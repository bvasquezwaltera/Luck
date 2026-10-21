import re
import uuid
from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from pathlib import PurePosixPath
from urllib.parse import urlparse

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.entrega import (
    ENTREGA_APROBADA,
    ENTREGA_CAMBIOS,
    ENTREGA_EN_REVISION,
    ENTREGA_PENDIENTE,
    REVISION_APROBADO,
    REVISION_CAMBIOS,
    Entrega,
    EntregaAdjunto,
    EntregaAvance,
    EntregaRevision,
)
from app.models.pago import CONTRATO_ACTIVO, Contrato
from app.models.perfil import Perfil
from app.models.solicitud import Solicitud
from app.schemas.delivery import (
    ContractDeliveries,
    DeliveryAdvance,
    DeliveryAttachment,
    DeliveryCounterpart,
    DeliveryCreate,
    DeliveryItem,
    DeliveryReview,
)
from app.services import storage_service as storage
from app.services.utils import get_initials

MAX_DELIVERIES_PER_CONTRACT = 20
MAX_OBJECTIVE_LENGTH = 200
MAX_NOTE_LENGTH = 2000
MAX_LINK_LENGTH = 500


@dataclass
class FileUpload:
    name: str
    content: bytes


@dataclass
class ValidatedFile:
    name: str
    content: bytes
    extension: str
    mime: str


def _invalid(message: str) -> HTTPException:
    return HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, message)


def _parse_uuid(value: str, message: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, message)


def _revisions_limit(plan_revisions: str) -> int | None:
    """Revisiones que permite el plan ("2" -> 2). Si el plan no pone un número, no se limitan."""
    match = re.match(r"\s*(\d+)", plan_revisions or "")
    return int(match.group(1)) if match else None


# ---------------------------------------------------------------- archivos y enlaces

def validate_files(files: list[FileUpload]) -> list[ValidatedFile]:
    if len(files) > storage.DELIVERY_MAX_FILES:
        raise _invalid(f"Puedes adjuntar hasta {storage.DELIVERY_MAX_FILES} archivos por envío.")
    if sum(len(file.content) for file in files) > storage.DELIVERY_MAX_TOTAL_BYTES:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE,
            f"Los archivos de un envío no pueden superar {storage.DELIVERY_MAX_TOTAL_BYTES // (1024 * 1024)} MB en total.",
        )

    validated = []
    for file in files:
        name = PurePosixPath(file.name.replace("\\", "/")).name or "archivo"
        extension = PurePosixPath(name).suffix.lower()
        allowed = storage.DELIVERY_ALLOWED_TYPES.get(extension)
        if not allowed:
            raise _invalid(f"«{name}»: formato no permitido. Usa PDF, imágenes, ZIP, Office, TXT, CSV o MD.")
        if len(file.content) == 0:
            raise _invalid(f"«{name}» está vacío.")
        if len(file.content) > storage.DELIVERY_MAX_FILE_BYTES:
            limit = storage.DELIVERY_MAX_FILE_BYTES // (1024 * 1024)
            raise HTTPException(status.HTTP_413_CONTENT_TOO_LARGE, f"«{name}» supera el límite de {limit} MB.")

        mime, signatures = allowed
        if extension in storage.DELIVERY_TEXT_EXTENSIONS:
            try:
                text_content = file.content.decode("utf-8")
            except UnicodeDecodeError:
                raise _invalid(f"«{name}» no es un archivo de texto válido.")
            if "\x00" in text_content:
                raise _invalid(f"«{name}» no es un archivo de texto válido.")
        else:
            # No basta con confiar en la extensión: el contenido debe empezar con la firma del formato.
            if not file.content.startswith(signatures) or (extension == ".webp" and file.content[8:12] != b"WEBP"):
                raise _invalid(f"«{name}» no es un archivo {extension[1:].upper()} válido.")
        validated.append(ValidatedFile(name=name[:200], content=file.content, extension=extension, mime=mime))
    return validated


def validate_links(links: list[str]) -> list[str]:
    cleaned = [link.strip() for link in links if link.strip()]
    if len(cleaned) > storage.DELIVERY_MAX_LINKS:
        raise _invalid(f"Puedes agregar hasta {storage.DELIVERY_MAX_LINKS} enlaces por envío.")
    for link in cleaned:
        parsed = urlparse(link)
        if len(link) > MAX_LINK_LENGTH:
            raise _invalid("Un enlace es demasiado largo.")
        # Solo http/https: nada de javascript:, data: ni file:
        if parsed.scheme not in ("http", "https") or not parsed.netloc or re.search(r"\s", link):
            raise _invalid(f"«{link[:60]}» no es un enlace válido (debe empezar con http:// o https://).")
    return cleaned


def _link_name(link: str) -> str:
    parsed = urlparse(link)
    path = parsed.path.rstrip("/")
    return (parsed.netloc + path)[:120] or link[:120]


def _format_size(size: int) -> str:
    if size < 1024 * 1024:
        return f"{max(1, round(size / 1024))} KB"
    return f"{size / (1024 * 1024):.1f} MB"


def _attachment_kind(mime: str) -> str:
    if mime == "link":
        return "link"
    if mime == "application/pdf":
        return "pdf"
    if mime.startswith("image/"):
        return "image"
    return "file"


def _store_attachments(
    db: Session,
    delivery_id: uuid.UUID,
    owner: dict[str, uuid.UUID],
    files: list[ValidatedFile],
    links: list[str],
) -> list[str]:
    """Sube los archivos y deja listas las filas; devuelve las rutas subidas para poder limpiarlas si algo falla."""
    uploaded: list[str] = []
    for file in files:
        path = f"{delivery_id}/{uuid.uuid4().hex}{file.extension}"
        storage.upload(path, file.content, file.mime, bucket=storage.DELIVERY_BUCKET)
        uploaded.append(path)
        db.add(
            EntregaAdjunto(
                entrega_id=delivery_id, nombre=file.name, tipo=file.mime, tamano=len(file.content), ruta=path, **owner
            )
        )
    for link in links:
        db.add(EntregaAdjunto(entrega_id=delivery_id, nombre=_link_name(link), tipo="link", url=link, **owner))
    return uploaded


def _commit_with_cleanup(db: Session, uploaded: list[str]) -> None:
    try:
        db.commit()
    except Exception:
        db.rollback()
        storage.remove(uploaded, bucket=storage.DELIVERY_BUCKET)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "No se pudo guardar el envío. Inténtalo de nuevo.")


# ---------------------------------------------------------------- consulta

def _attachment_out(row: EntregaAdjunto) -> DeliveryAttachment:
    return DeliveryAttachment(
        id=str(row.id),
        name=row.nombre,
        type=_attachment_kind(row.tipo),
        size=_format_size(row.tamano) if row.tamano else None,
        url=row.url,
    )


def list_contracts(db: Session, profile: Perfil) -> list[ContractDeliveries]:
    """Los contratos del usuario (como cliente o como freelancer) con todas sus entregas."""
    contratos = db.scalars(
        select(Contrato)
        .where((Contrato.cliente_id == profile.id) | (Contrato.freelancer_id == profile.id))
        .order_by(Contrato.inicio.desc())
    ).all()
    if not contratos:
        return []

    contrato_ids = [c.id for c in contratos]
    solicitudes = {s.id: s for s in db.scalars(select(Solicitud).where(Solicitud.id.in_([c.solicitud_id for c in contratos])))}
    perfiles = {
        p.id: p
        for p in db.scalars(select(Perfil).where(Perfil.id.in_({c.cliente_id for c in contratos} | {c.freelancer_id for c in contratos})))
    }

    entregas = db.scalars(select(Entrega).where(Entrega.contrato_id.in_(contrato_ids)).order_by(Entrega.fecha_limite, Entrega.creado_en)).all()
    entrega_ids = [e.id for e in entregas]
    avances = defaultdict(list)
    revisiones = defaultdict(list)
    adjuntos_avance = defaultdict(list)
    adjuntos_revision = defaultdict(list)
    if entrega_ids:
        for a in db.scalars(select(EntregaAvance).where(EntregaAvance.entrega_id.in_(entrega_ids)).order_by(EntregaAvance.creado_en)):
            avances[a.entrega_id].append(a)
        for r in db.scalars(select(EntregaRevision).where(EntregaRevision.entrega_id.in_(entrega_ids)).order_by(EntregaRevision.creado_en)):
            revisiones[r.entrega_id].append(r)
        for adj in db.scalars(select(EntregaAdjunto).where(EntregaAdjunto.entrega_id.in_(entrega_ids)).order_by(EntregaAdjunto.creado_en)):
            (adjuntos_avance if adj.avance_id else adjuntos_revision)[adj.avance_id or adj.revision_id].append(adj)

    entregas_por_contrato = defaultdict(list)
    for e in entregas:
        entregas_por_contrato[e.contrato_id].append(e)

    result = []
    for contrato in contratos:
        solicitud = solicitudes[contrato.solicitud_id]
        other = perfiles[contrato.freelancer_id if profile.id == contrato.cliente_id else contrato.cliente_id]
        items = [
            DeliveryItem(
                id=str(e.id),
                title=e.titulo,
                description=e.descripcion,
                objectives=list(e.objetivos or []),
                dueDate=e.fecha_limite,
                status=e.estado,
                progress=e.progreso,
                createdAt=e.creado_en,
                advances=[
                    DeliveryAdvance(
                        id=str(a.id),
                        note=a.nota,
                        progress=a.progreso,
                        createdAt=a.creado_en,
                        attachments=[_attachment_out(x) for x in adjuntos_avance[a.id]],
                    )
                    for a in avances[e.id]
                ],
                reviews=[
                    DeliveryReview(
                        id=str(r.id),
                        type=r.tipo,
                        comment=r.comentario,
                        createdAt=r.creado_en,
                        attachments=[_attachment_out(x) for x in adjuntos_revision[r.id]],
                    )
                    for r in revisiones[e.id]
                ],
            )
            for e in entregas_por_contrato[contrato.id]
        ]
        used = sum(1 for e in entregas_por_contrato[contrato.id] for r in revisiones[e.id] if r.tipo == REVISION_CAMBIOS)
        result.append(
            ContractDeliveries(
                contractId=str(contrato.id),
                solicitudId=str(solicitud.id),
                title=solicitud.titulo,
                category=solicitud.categoria,
                planName=contrato.plan_nombre,
                startedAt=contrato.inicio,
                nextChargeAt=contrato.proximo_cobro,
                revisionsLimit=_revisions_limit(solicitud.plan_revisiones),
                revisionsUsed=used,
                counterpart=DeliveryCounterpart(
                    id=str(other.id), name=other.nombre_completo, initials=get_initials(other.nombre_completo)
                ),
                deliveries=items,
            )
        )
    return result


# ---------------------------------------------------------------- acciones del freelancer

def _own_active_contract(db: Session, freelancer: Perfil, contract_id: str, lock: bool = False) -> Contrato:
    contract_uuid = _parse_uuid(contract_id, "No se encontró el contrato.")
    query = select(Contrato).where(Contrato.id == contract_uuid, Contrato.freelancer_id == freelancer.id)
    contrato = db.scalar(query.with_for_update() if lock else query)
    if not contrato:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró el contrato.")
    if contrato.estado != CONTRATO_ACTIVO:
        raise HTTPException(status.HTTP_409_CONFLICT, "Este contrato ya no está activo.")
    return contrato


def create_delivery(db: Session, freelancer: Perfil, contract_id: str, payload: DeliveryCreate) -> None:
    # Bloquear el contrato evita pasarse del máximo de entregas con dos peticiones a la vez.
    contrato = _own_active_contract(db, freelancer, contract_id, lock=True)

    title = payload.title.strip()
    description = payload.description.strip()
    if not title or not description:
        raise _invalid("El título y la descripción son obligatorios.")
    objectives = [item.strip() for item in payload.objectives if item.strip()]
    if any(len(item) > MAX_OBJECTIVE_LENGTH for item in objectives):
        raise _invalid(f"Cada objetivo puede tener hasta {MAX_OBJECTIVE_LENGTH} caracteres.")
    if payload.dueDate < date.today():
        raise _invalid("La fecha límite no puede estar en el pasado.")

    existing = db.scalar(select(func.count()).select_from(Entrega).where(Entrega.contrato_id == contrato.id))
    if existing >= MAX_DELIVERIES_PER_CONTRACT:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Un contrato admite hasta {MAX_DELIVERIES_PER_CONTRACT} entregas.")

    db.add(
        Entrega(
            id=uuid.uuid4(),
            contrato_id=contrato.id,
            titulo=title,
            descripcion=description,
            objetivos=objectives,
            fecha_limite=payload.dueDate,
            estado=ENTREGA_PENDIENTE,
            progreso=0,
        )
    )
    db.commit()


def _own_delivery(db: Session, freelancer: Perfil, delivery_id: str) -> Entrega:
    delivery_uuid = _parse_uuid(delivery_id, "No se encontró la entrega.")
    row = db.execute(
        select(Entrega, Contrato)
        .join(Contrato, Contrato.id == Entrega.contrato_id)
        .where(Entrega.id == delivery_uuid, Contrato.freelancer_id == freelancer.id)
        .with_for_update(of=Entrega)
    ).first()
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró la entrega.")
    return row[0]


def delete_delivery(db: Session, freelancer: Perfil, delivery_id: str) -> None:
    entrega = _own_delivery(db, freelancer, delivery_id)
    # Una vez que hay avances o revisiones, la entrega es parte del historial acordado con el cliente.
    if entrega.estado != ENTREGA_PENDIENTE:
        raise HTTPException(status.HTTP_409_CONFLICT, "Solo se pueden eliminar entregas que aún no tienen avances.")
    db.delete(entrega)
    db.commit()


def add_advance(
    db: Session,
    freelancer: Perfil,
    delivery_id: str,
    note: str,
    progress: int,
    files: list[FileUpload],
    links: list[str],
) -> None:
    note = note.strip()
    if not note:
        raise _invalid("Escribe una nota para el cliente.")
    if len(note) > MAX_NOTE_LENGTH:
        raise _invalid(f"La nota puede tener hasta {MAX_NOTE_LENGTH} caracteres.")
    if not 0 <= progress <= 100:
        raise _invalid("El progreso debe estar entre 0 y 100.")
    validated_files = validate_files(files)
    clean_links = validate_links(links)

    entrega = _own_delivery(db, freelancer, delivery_id)
    contrato = db.get(Contrato, entrega.contrato_id)
    if contrato.estado != CONTRATO_ACTIVO:
        raise HTTPException(status.HTTP_409_CONFLICT, "Este contrato ya no está activo.")
    if entrega.estado == ENTREGA_EN_REVISION:
        raise HTTPException(status.HTTP_409_CONFLICT, "Esta entrega está esperando la revisión del cliente.")
    if entrega.estado == ENTREGA_APROBADA:
        raise HTTPException(status.HTTP_409_CONFLICT, "Esta entrega ya fue aprobada.")

    avance = EntregaAvance(id=uuid.uuid4(), entrega_id=entrega.id, nota=note, progreso=progress)
    db.add(avance)
    db.flush()
    entrega.estado = ENTREGA_EN_REVISION
    entrega.progreso = progress

    uploaded = _store_attachments(db, entrega.id, {"avance_id": avance.id}, validated_files, clean_links)
    _commit_with_cleanup(db, uploaded)


# ---------------------------------------------------------------- acciones del cliente

def add_review(
    db: Session,
    cliente: Perfil,
    delivery_id: str,
    kind: str,
    comment: str,
    files: list[FileUpload],
    links: list[str],
) -> None:
    if kind not in (REVISION_APROBADO, REVISION_CAMBIOS):
        raise _invalid("Indica si apruebas la entrega o pides cambios.")
    comment = comment.strip()
    if len(comment) > MAX_NOTE_LENGTH:
        raise _invalid(f"El comentario puede tener hasta {MAX_NOTE_LENGTH} caracteres.")
    if kind == REVISION_CAMBIOS and not comment:
        raise _invalid("Cuéntale al freelancer qué cambios necesitas.")
    validated_files = validate_files(files)
    clean_links = validate_links(links)

    delivery_uuid = _parse_uuid(delivery_id, "No se encontró la entrega.")
    row = db.execute(
        select(Entrega, Contrato)
        .join(Contrato, Contrato.id == Entrega.contrato_id)
        .where(Entrega.id == delivery_uuid, Contrato.cliente_id == cliente.id)
    ).first()
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró la entrega.")

    # Se bloquea el contrato (no solo la entrega): las revisiones del plan se cuentan entre todas sus entregas,
    # así dos pedidos de cambios simultáneos sobre entregas distintas no se pasan del límite.
    contrato = db.scalar(select(Contrato).where(Contrato.id == row[1].id).with_for_update())
    entrega = db.scalar(select(Entrega).where(Entrega.id == delivery_uuid).with_for_update())

    if entrega.estado != ENTREGA_EN_REVISION:
        raise HTTPException(status.HTTP_409_CONFLICT, "Esta entrega no está esperando tu revisión.")

    if kind == REVISION_CAMBIOS:
        solicitud = db.get(Solicitud, contrato.solicitud_id)
        limit = _revisions_limit(solicitud.plan_revisiones)
        used = db.scalar(
            select(func.count())
            .select_from(EntregaRevision)
            .join(Entrega, Entrega.id == EntregaRevision.entrega_id)
            .where(Entrega.contrato_id == contrato.id, EntregaRevision.tipo == REVISION_CAMBIOS)
        )
        if limit is not None and used >= limit:
            plan_text = "la revisión" if limit == 1 else f"las {limit} revisiones"
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Ya usaste {plan_text} de tu plan. Solo puedes aprobar esta entrega.",
            )

    revision = EntregaRevision(id=uuid.uuid4(), entrega_id=entrega.id, tipo=kind, comentario=comment)
    db.add(revision)
    db.flush()
    if kind == REVISION_APROBADO:
        entrega.estado = ENTREGA_APROBADA
        entrega.progreso = 100
    else:
        entrega.estado = ENTREGA_CAMBIOS

    uploaded = _store_attachments(db, entrega.id, {"revision_id": revision.id}, validated_files, clean_links)
    _commit_with_cleanup(db, uploaded)


# ---------------------------------------------------------------- archivos

def get_attachment_url(db: Session, profile: Perfil, delivery_id: str, attachment_id: str) -> str:
    delivery_uuid = _parse_uuid(delivery_id, "No se encontró el archivo.")
    attachment_uuid = _parse_uuid(attachment_id, "No se encontró el archivo.")

    row = db.execute(
        select(EntregaAdjunto, Contrato)
        .join(Entrega, Entrega.id == EntregaAdjunto.entrega_id)
        .join(Contrato, Contrato.id == Entrega.contrato_id)
        .where(EntregaAdjunto.id == attachment_uuid, EntregaAdjunto.entrega_id == delivery_uuid)
    ).first()
    # Solo el cliente y el freelancer del contrato; para cualquier otro, el archivo "no existe".
    if not row or profile.id not in (row[1].cliente_id, row[1].freelancer_id) or not row[0].ruta:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró el archivo.")

    try:
        return storage.create_signed_url(row[0].ruta, bucket=storage.DELIVERY_BUCKET)
    except Exception:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "No se pudo abrir el archivo. Inténtalo de nuevo.")


def attachment_paths_for_user(db: Session, user_id: uuid.UUID) -> list[str]:
    """Rutas de Storage de todos los archivos de entregas en los que participa el usuario (para limpiar al borrar la cuenta)."""
    return list(
        db.scalars(
            select(EntregaAdjunto.ruta)
            .join(Entrega, Entrega.id == EntregaAdjunto.entrega_id)
            .join(Contrato, Contrato.id == Entrega.contrato_id)
            .where(
                EntregaAdjunto.ruta.is_not(None),
                (Contrato.cliente_id == user_id) | (Contrato.freelancer_id == user_id),
            )
        )
    )
