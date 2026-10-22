import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models.mensaje import Mensaje
from app.models.pago import CONTRATO_ACTIVO, Contrato
from app.models.perfil import Perfil
from app.models.solicitud import Solicitud
from app.schemas.message import (
    Conversation,
    ConversationCounterpart,
    ConversationLastMessage,
    MessageAttachment,
    MessageOut,
)
from app.services import deliveries_service
from app.services import storage_service as storage
from app.services.deliveries_service import FileUpload, _attachment_kind, _format_size
from app.services.utils import get_initials

MAX_TEXT_LENGTH = 2000
HISTORY_LIMIT = 200  # los mensajes más recientes que se traen al abrir un chat


def _contract_for(db: Session, profile: Perfil, contract_id: str) -> Contrato:
    """El contrato, solo si el usuario es su cliente o su freelancer; para cualquier otro, "no existe"."""
    try:
        contract_uuid = uuid.UUID(contract_id)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró la conversación.")
    contrato = db.get(Contrato, contract_uuid)
    if not contrato or profile.id not in (contrato.cliente_id, contrato.freelancer_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró la conversación.")
    return contrato


def _message_out(row: Mensaje, profile: Perfil) -> MessageOut:
    attachment = None
    if row.adjunto_ruta:
        attachment = MessageAttachment(
            name=row.adjunto_nombre or "archivo",
            type=_attachment_kind(row.adjunto_tipo or ""),
            size=_format_size(row.adjunto_tamano or 0),
        )
    return MessageOut(
        id=str(row.id),
        mine=row.emisor_id == profile.id,
        text=row.texto,
        createdAt=row.creado_en,
        read=row.leido_en is not None,
        attachment=attachment,
    )


def list_conversations(db: Session, profile: Perfil) -> list[Conversation]:
    """Un chat por contrato del usuario, el de actividad más reciente primero."""
    contratos = db.scalars(
        select(Contrato).where((Contrato.cliente_id == profile.id) | (Contrato.freelancer_id == profile.id))
    ).all()
    if not contratos:
        return []

    ids = [c.id for c in contratos]
    titles = {
        contrato_id: title
        for contrato_id, title in db.execute(
            select(Contrato.id, Solicitud.titulo).join(Solicitud, Solicitud.id == Contrato.solicitud_id).where(Contrato.id.in_(ids))
        )
    }
    perfiles = {
        p.id: p
        for p in db.scalars(
            select(Perfil).where(Perfil.id.in_({c.cliente_id for c in contratos} | {c.freelancer_id for c in contratos}))
        )
    }

    # El último mensaje de cada contrato: al recorrerlos en orden, el último que se guarda es el más reciente.
    last_by_contract: dict[uuid.UUID, Mensaje] = {}
    for message in db.scalars(select(Mensaje).where(Mensaje.contrato_id.in_(ids)).order_by(Mensaje.creado_en)):
        last_by_contract[message.contrato_id] = message

    unread = dict(
        db.execute(
            select(Mensaje.contrato_id, func.count())
            .where(Mensaje.contrato_id.in_(ids), Mensaje.emisor_id != profile.id, Mensaje.leido_en.is_(None))
            .group_by(Mensaje.contrato_id)
        ).all()
    )

    conversations = []
    for contrato in contratos:
        other = perfiles[contrato.freelancer_id if profile.id == contrato.cliente_id else contrato.cliente_id]
        last = last_by_contract.get(contrato.id)
        last_out = (
            ConversationLastMessage(
                text=last.texto or last.adjunto_nombre or "", mine=last.emisor_id == profile.id, createdAt=last.creado_en
            )
            if last
            else None
        )
        conversations.append(
            (
                last.creado_en if last else contrato.inicio,
                Conversation(
                    contractId=str(contrato.id),
                    title=titles[contrato.id],
                    counterpart=ConversationCounterpart(
                        id=str(other.id), name=other.nombre_completo, initials=get_initials(other.nombre_completo)
                    ),
                    lastMessage=last_out,
                    unread=unread.get(contrato.id, 0),
                ),
            )
        )
    conversations.sort(key=lambda item: item[0], reverse=True)
    return [conversation for _, conversation in conversations]


def list_messages(db: Session, profile: Perfil, contract_id: str) -> list[MessageOut]:
    contrato = _contract_for(db, profile, contract_id)
    rows = db.scalars(
        select(Mensaje).where(Mensaje.contrato_id == contrato.id).order_by(Mensaje.creado_en.desc()).limit(HISTORY_LIMIT)
    ).all()
    return [_message_out(row, profile) for row in reversed(rows)]


def unread_count(db: Session, profile: Perfil) -> int:
    """Mensajes que me escribió la otra persona y aún no leí, sumando todos mis chats."""
    return (
        db.scalar(
            select(func.count())
            .select_from(Mensaje)
            .join(Contrato, Contrato.id == Mensaje.contrato_id)
            .where(
                (Contrato.cliente_id == profile.id) | (Contrato.freelancer_id == profile.id),
                Mensaje.emisor_id != profile.id,
                Mensaje.leido_en.is_(None),
            )
        )
        or 0
    )


def mark_read(db: Session, profile: Perfil, contract_id: str) -> None:
    """Marca como leídos los mensajes que me escribió la otra persona."""
    contrato = _contract_for(db, profile, contract_id)
    db.execute(
        update(Mensaje)
        .where(Mensaje.contrato_id == contrato.id, Mensaje.emisor_id != profile.id, Mensaje.leido_en.is_(None))
        .values(leido_en=datetime.now(timezone.utc))
    )
    db.commit()


def send_message(db: Session, profile: Perfil, contract_id: str, text: str, file: FileUpload | None) -> MessageOut:
    contrato = _contract_for(db, profile, contract_id)
    if contrato.estado != CONTRATO_ACTIVO:
        raise HTTPException(status.HTTP_409_CONFLICT, "Este contrato ya no está activo.")

    text = text.strip()
    if not text and not file:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Escribe un mensaje o adjunta un archivo.")

    message = Mensaje(contrato_id=contrato.id, emisor_id=profile.id, texto=text)
    uploaded: list[str] = []
    if file:
        # Mismas reglas de formato, firma y tamaño que los archivos de las entregas.
        (validated,) = deliveries_service.validate_files([file])
        path = f"mensajes/{contrato.id}/{uuid.uuid4().hex}{validated.extension}"
        try:
            storage.upload(path, validated.content, validated.mime, bucket=storage.DELIVERY_BUCKET)
        except Exception:
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, "No se pudo subir el archivo. Inténtalo de nuevo.")
        uploaded.append(path)
        message.adjunto_nombre = validated.name
        message.adjunto_tipo = validated.mime
        message.adjunto_tamano = len(validated.content)
        message.adjunto_ruta = path

    db.add(message)
    try:
        db.commit()
    except Exception:
        db.rollback()
        storage.remove(uploaded, bucket=storage.DELIVERY_BUCKET)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "No se pudo enviar el mensaje. Inténtalo de nuevo.")
    db.refresh(message)
    return _message_out(message, profile)


def get_attachment_url(db: Session, profile: Perfil, contract_id: str, message_id: str) -> str:
    contrato = _contract_for(db, profile, contract_id)
    try:
        message_uuid = uuid.UUID(message_id)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró el archivo.")
    message = db.scalar(select(Mensaje).where(Mensaje.id == message_uuid, Mensaje.contrato_id == contrato.id))
    if not message or not message.adjunto_ruta:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró el archivo.")
    try:
        return storage.create_signed_url(message.adjunto_ruta, bucket=storage.DELIVERY_BUCKET)
    except Exception:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "No se pudo abrir el archivo. Inténtalo de nuevo.")


def attachment_paths_for_user(db: Session, user_id: uuid.UUID) -> list[str]:
    """Rutas de Storage de los archivos de los chats del usuario (para limpiar al borrar la cuenta)."""
    return list(
        db.scalars(
            select(Mensaje.adjunto_ruta)
            .join(Contrato, Contrato.id == Mensaje.contrato_id)
            .where(
                Mensaje.adjunto_ruta.is_not(None),
                (Contrato.cliente_id == user_id) | (Contrato.freelancer_id == user_id),
            )
        )
    )
