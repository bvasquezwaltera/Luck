from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_profile
from app.models.perfil import Perfil
from app.schemas.message import Conversation, MessageAttachmentUrl, MessageOut, UnreadCount
from app.services import messages_service as service
from app.services import storage_service
from app.services.deliveries_service import FileUpload

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.get("/unread-count", response_model=UnreadCount)
def unread_count(db: Session = Depends(get_db), current: Perfil = Depends(get_current_profile)):
    return UnreadCount(count=service.unread_count(db, current))


@router.get("/conversations", response_model=list[Conversation])
def list_conversations(db: Session = Depends(get_db), current: Perfil = Depends(get_current_profile)):
    return service.list_conversations(db, current)


@router.get("/conversations/{contract_id}/messages", response_model=list[MessageOut])
def list_messages(contract_id: str, db: Session = Depends(get_db), current: Perfil = Depends(get_current_profile)):
    return service.list_messages(db, current, contract_id)


@router.post("/conversations/{contract_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_read(contract_id: str, db: Session = Depends(get_db), current: Perfil = Depends(get_current_profile)):
    service.mark_read(db, current, contract_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Multipart porque puede traer un archivo.
@router.post("/conversations/{contract_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
async def send_message(
    contract_id: str,
    text: Annotated[str, Form(max_length=service.MAX_TEXT_LENGTH)] = "",
    file: Annotated[UploadFile | None, File()] = None,
    db: Session = Depends(get_db),
    current: Perfil = Depends(get_current_profile),
):
    upload = None
    if file is not None and file.filename:
        # Se lee un byte de más para detectar archivos que superan el límite sin cargarlos enteros.
        upload = FileUpload(name=file.filename, content=await file.read(storage_service.DELIVERY_MAX_FILE_BYTES + 1))
    return service.send_message(db, current, contract_id, text, upload)


@router.get("/conversations/{contract_id}/messages/{message_id}/attachment-url", response_model=MessageAttachmentUrl)
def get_attachment_url(
    contract_id: str, message_id: str, db: Session = Depends(get_db), current: Perfil = Depends(get_current_profile)
):
    return MessageAttachmentUrl(url=service.get_attachment_url(db, current, contract_id, message_id))
