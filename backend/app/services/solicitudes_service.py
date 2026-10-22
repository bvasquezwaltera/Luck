import uuid
from dataclasses import dataclass
from pathlib import PurePosixPath

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.perfil import Perfil
from app.models.perfil_freelancer import PerfilFreelancer
from app.models.plan_suscripcion import PlanSuscripcion
from app.models.solicitud import (
    ESTADO_ACEPTADA,
    ESTADO_ENVIADA,
    ESTADO_RECHAZADA,
    Solicitud,
    SolicitudAdjunto,
)
from app.schemas.solicitud import (
    ClientSolicitud,
    ReceivedSolicitud,
    SolicitudAttachment,
    SolicitudClient,
    SolicitudCreate,
    SolicitudCreated,
    SolicitudFreelancer,
    SolicitudPayment,
    SolicitudPlan,
)
from app.services import payments_service, storage_service
from app.services.utils import get_initials

MAX_CHARACTERISTIC_LENGTH = 200


@dataclass
class AttachmentUpload:
    name: str
    content: bytes


def _parse_uuid(value: str, message: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, message)


def _clean_characteristics(items: list[str]) -> list[str]:
    cleaned = [item.strip() for item in items if item.strip()]
    if any(len(item) > MAX_CHARACTERISTIC_LENGTH for item in cleaned):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Cada característica puede tener hasta {MAX_CHARACTERISTIC_LENGTH} caracteres.",
        )
    return cleaned


def _validate_attachments(files: list[AttachmentUpload]) -> list[tuple[AttachmentUpload, str, str]]:
    """Devuelve (archivo, extensión, tipo MIME) de cada adjunto válido; si alguno no lo es, rechaza todo."""
    if len(files) > storage_service.MAX_FILES:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            f"Puedes adjuntar hasta {storage_service.MAX_FILES} archivos.",
        )

    validated = []
    for file in files:
        name = PurePosixPath(file.name.replace("\\", "/")).name or "archivo"
        extension = PurePosixPath(name).suffix.lower()
        allowed = storage_service.ALLOWED_TYPES.get(extension)
        if not allowed:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                f"«{name}»: solo se permiten PDF, PNG, JPG o WEBP.",
            )
        if len(file.content) == 0:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, f"«{name}» está vacío.")
        if len(file.content) > storage_service.MAX_FILE_BYTES:
            limit_mb = storage_service.MAX_FILE_BYTES // (1024 * 1024)
            raise HTTPException(
                status.HTTP_413_CONTENT_TOO_LARGE, f"«{name}» supera el límite de {limit_mb} MB."
            )

        mime, signatures = allowed
        # No basta con confiar en la extensión: el contenido debe empezar con la firma del formato.
        if not file.content.startswith(signatures) or (
            extension == ".webp" and file.content[8:12] != b"WEBP"
        ):
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT, f"«{name}» no es un archivo {extension[1:].upper()} válido."
            )
        validated.append((AttachmentUpload(name=name, content=file.content), extension, mime))
    return validated


def create_solicitud(
    db: Session, cliente: Perfil, payload: SolicitudCreate, files: list[AttachmentUpload]
) -> SolicitudCreated:
    freelancer_id = _parse_uuid(payload.freelancerId, "Freelancer inválido.")
    plan_id = _parse_uuid(payload.planId, "Plan inválido.")

    title = payload.title.strip()
    description = payload.description.strip()
    if not title or not description:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "El título y la descripción son obligatorios.")
    characteristics = _clean_characteristics(payload.characteristics)
    attachments = _validate_attachments(files)

    freelancer = db.get(Perfil, freelancer_id)
    if not freelancer or freelancer.rol != "freelancer":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró al freelancer.")

    # El plan, su precio y la categoría salen de la base de datos, nunca del cliente.
    plan = db.get(PlanSuscripcion, plan_id)
    if not plan or plan.freelancer_id != freelancer_id or not plan.activo:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ese plan no está disponible.")

    duplicada = db.scalar(
        select(Solicitud.id).where(
            Solicitud.cliente_id == cliente.id,
            Solicitud.plan_id == plan_id,
            Solicitud.estado == ESTADO_ENVIADA,
        )
    )
    if duplicada:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Ya enviaste una solicitud para este plan y sigue pendiente."
        )

    perfil_freelancer = db.get(PerfilFreelancer, freelancer_id)
    categoria = (perfil_freelancer.categoria if perfil_freelancer else "") or ""

    solicitud = Solicitud(
        id=uuid.uuid4(),
        cliente_id=cliente.id,
        freelancer_id=freelancer_id,
        plan_id=plan.id,
        plan_nombre=plan.nombre,
        plan_nivel=plan.nivel,
        plan_precio=plan.precio,
        plan_proyectos_activos=plan.proyectos_activos or "",
        plan_revisiones=plan.revisiones or "",
        titulo=title,
        descripcion=description,
        caracteristicas=characteristics,
        categoria=categoria,
        fecha_deseada=payload.desiredDate,
        estado=ESTADO_ENVIADA,
    )
    db.add(solicitud)

    # Primero los archivos y al final el commit: si algo falla, no queda una solicitud a medias.
    uploaded_paths: list[str] = []
    try:
        for file, extension, mime in attachments:
            path = f"{solicitud.id}/{uuid.uuid4().hex}{extension}"
            storage_service.upload(path, file.content, mime)
            uploaded_paths.append(path)
            db.add(
                SolicitudAdjunto(
                    solicitud_id=solicitud.id,
                    nombre=file.name[:200],
                    tipo=mime,
                    tamano=len(file.content),
                    ruta=path,
                )
            )
        db.commit()
    except Exception:
        db.rollback()
        storage_service.remove(uploaded_paths)
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, "No se pudieron guardar los archivos adjuntos. Inténtalo de nuevo."
        )

    return SolicitudCreated(id=str(solicitud.id), status=solicitud.estado)


def _format_size(size: int) -> str:
    if size < 1024 * 1024:
        return f"{max(1, round(size / 1024))} KB"
    return f"{size / (1024 * 1024):.1f} MB"


def _attachments_by_solicitud(db: Session, solicitud_ids: list[uuid.UUID]) -> dict[uuid.UUID, list[SolicitudAttachment]]:
    grouped: dict[uuid.UUID, list[SolicitudAttachment]] = {}
    if not solicitud_ids:
        return grouped

    rows = db.scalars(
        select(SolicitudAdjunto)
        .where(SolicitudAdjunto.solicitud_id.in_(solicitud_ids))
        .order_by(SolicitudAdjunto.creado_en)
    ).all()
    for row in rows:
        grouped.setdefault(row.solicitud_id, []).append(
            SolicitudAttachment(
                id=str(row.id),
                name=row.nombre,
                type="pdf" if row.tipo == "application/pdf" else "image",
                size=_format_size(row.tamano),
            )
        )
    return grouped


def _plan_out(solicitud: Solicitud) -> SolicitudPlan:
    return SolicitudPlan(
        name=solicitud.plan_nombre,
        tier=solicitud.plan_nivel,
        price=float(solicitud.plan_precio),
        activeProjects=solicitud.plan_proyectos_activos,
        revisions=solicitud.plan_revisiones,
    )


def list_client_solicitudes(db: Session, cliente: Perfil) -> list[ClientSolicitud]:
    rows = db.execute(
        select(Solicitud, Perfil, PerfilFreelancer)
        .join(Perfil, Perfil.id == Solicitud.freelancer_id)
        .outerjoin(PerfilFreelancer, PerfilFreelancer.perfil_id == Solicitud.freelancer_id)
        .where(Solicitud.cliente_id == cliente.id)
        .order_by(Solicitud.creado_en.desc())
    ).all()
    attachments = _attachments_by_solicitud(db, [row[0].id for row in rows])
    payments = payments_service.payments_by_solicitud(db, [row[0].id for row in rows])

    return [
        ClientSolicitud(
            id=str(solicitud.id),
            title=solicitud.titulo,
            description=solicitud.descripcion,
            characteristics=list(solicitud.caracteristicas or []),
            category=solicitud.categoria,
            desiredDate=solicitud.fecha_deseada,
            status=solicitud.estado,
            rejectionReason=solicitud.motivo_rechazo,
            createdAt=solicitud.creado_en,
            plan=_plan_out(solicitud),
            attachments=attachments.get(solicitud.id, []),
            payment=payments.get(solicitud.id),
            freelancer=SolicitudFreelancer(
                id=str(freelancer.id),
                name=freelancer.nombre_completo,
                initials=get_initials(freelancer.nombre_completo),
                specialty=(perfil_freelancer.especialidad if perfil_freelancer else "") or "",
            ),
        )
        for solicitud, freelancer, perfil_freelancer in rows
    ]


def _to_received(
    solicitud: Solicitud,
    cliente: Perfil,
    attachments: list[SolicitudAttachment],
    payment: SolicitudPayment | None = None,
) -> ReceivedSolicitud:
    return ReceivedSolicitud(
        id=str(solicitud.id),
        title=solicitud.titulo,
        description=solicitud.descripcion,
        characteristics=list(solicitud.caracteristicas or []),
        category=solicitud.categoria,
        desiredDate=solicitud.fecha_deseada,
        status=solicitud.estado,
        rejectionReason=solicitud.motivo_rechazo,
        createdAt=solicitud.creado_en,
        plan=_plan_out(solicitud),
        attachments=attachments,
        payment=payment,
        client=SolicitudClient(
            id=str(cliente.id),
            name=cliente.nombre_completo,
            initials=get_initials(cliente.nombre_completo),
            country=cliente.pais or "",
        ),
    )


def list_received_solicitudes(db: Session, freelancer: Perfil) -> list[ReceivedSolicitud]:
    rows = db.execute(
        select(Solicitud, Perfil)
        .join(Perfil, Perfil.id == Solicitud.cliente_id)
        .where(Solicitud.freelancer_id == freelancer.id)
        .order_by(Solicitud.creado_en.desc())
    ).all()
    attachments = _attachments_by_solicitud(db, [solicitud.id for solicitud, _ in rows])
    payments = payments_service.payments_by_solicitud(db, [solicitud.id for solicitud, _ in rows], include_net=True)
    return [
        _to_received(solicitud, cliente, attachments.get(solicitud.id, []), payments.get(solicitud.id))
        for solicitud, cliente in rows
    ]


def _decide(
    db: Session, freelancer: Perfil, solicitud_id: str, new_status: str, reason: str | None
) -> ReceivedSolicitud:
    solicitud_uuid = _parse_uuid(solicitud_id, "Solicitud inválida.")

    # Un solo UPDATE condicionado: solo la puede resolver el freelancer destinatario
    # y solo mientras siga "enviada", así dos clics (o dos pestañas) no la pisan.
    result = db.execute(
        update(Solicitud)
        .where(
            Solicitud.id == solicitud_uuid,
            Solicitud.freelancer_id == freelancer.id,
            Solicitud.estado == ESTADO_ENVIADA,
        )
        .values(estado=new_status, motivo_rechazo=reason)
    )
    db.commit()

    if result.rowcount == 0:
        existing = db.scalar(
            select(Solicitud.id).where(
                Solicitud.id == solicitud_uuid, Solicitud.freelancer_id == freelancer.id
            )
        )
        if not existing:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró la solicitud.")
        raise HTTPException(status.HTTP_409_CONFLICT, "Esta solicitud ya fue respondida.")

    solicitud = db.get(Solicitud, solicitud_uuid)
    db.refresh(solicitud)
    attachments = _attachments_by_solicitud(db, [solicitud.id]).get(solicitud.id, [])
    return _to_received(solicitud, db.get(Perfil, solicitud.cliente_id), attachments)


def accept_solicitud(db: Session, freelancer: Perfil, solicitud_id: str) -> ReceivedSolicitud:
    return _decide(db, freelancer, solicitud_id, ESTADO_ACEPTADA, None)


def reject_solicitud(
    db: Session, freelancer: Perfil, solicitud_id: str, reason: str | None
) -> ReceivedSolicitud:
    cleaned = (reason or "").strip() or None
    return _decide(db, freelancer, solicitud_id, ESTADO_RECHAZADA, cleaned)


def get_attachment_url(db: Session, profile: Perfil, solicitud_id: str, attachment_id: str) -> str:
    solicitud_uuid = _parse_uuid(solicitud_id, "Solicitud inválida.")
    attachment_uuid = _parse_uuid(attachment_id, "Archivo inválido.")

    row = db.execute(
        select(SolicitudAdjunto, Solicitud)
        .join(Solicitud, Solicitud.id == SolicitudAdjunto.solicitud_id)
        .where(SolicitudAdjunto.id == attachment_uuid, SolicitudAdjunto.solicitud_id == solicitud_uuid)
    ).first()

    # Solo las dos partes de la solicitud pueden ver sus archivos. Para cualquier otro,
    # el archivo "no existe", así no se revela qué ids son válidos.
    if not row or profile.id not in (row[1].cliente_id, row[1].freelancer_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró el archivo.")

    try:
        return storage_service.create_signed_url(row[0].ruta)
    except Exception:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "No se pudo abrir el archivo. Inténtalo de nuevo.")
