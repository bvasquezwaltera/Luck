from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_profile, require_role
from app.models.perfil import Perfil
from app.schemas.solicitud import (
    AttachmentUrl,
    ClientSolicitud,
    ReceivedSolicitud,
    SolicitudCreate,
    SolicitudCreated,
    SolicitudReject,
)
from app.services import solicitudes_service, storage_service
from app.services.solicitudes_service import AttachmentUpload

router = APIRouter(prefix="/api/solicitudes", tags=["solicitudes"])


# Solo un cliente con sesión puede enviar una solicitud: require_role("client")
# responde 401 sin sesión y 403 si la cuenta es de freelancer.
# Va como multipart/form-data porque puede traer archivos adjuntos.
@router.post("", response_model=SolicitudCreated, status_code=status.HTTP_201_CREATED)
async def create_solicitud(
    freelancerId: Annotated[str, Form()],
    planId: Annotated[str, Form()],
    title: Annotated[str, Form(max_length=150)],
    description: Annotated[str, Form(max_length=4000)],
    desiredDate: Annotated[date | None, Form()] = None,
    characteristics: Annotated[list[str], Form()] = [],
    files: Annotated[list[UploadFile], File()] = [],
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("client")),
):
    uploads = []
    for file in files:
        # Se lee un byte de más para detectar archivos que superan el límite sin cargarlos enteros.
        content = await file.read(storage_service.MAX_FILE_BYTES + 1)
        uploads.append(AttachmentUpload(name=file.filename or "archivo", content=content))

    payload = SolicitudCreate(
        freelancerId=freelancerId,
        planId=planId,
        title=title,
        description=description,
        desiredDate=desiredDate,
        characteristics=characteristics,
    )
    return solicitudes_service.create_solicitud(db, current, payload, uploads)


@router.get("/mine", response_model=list[ClientSolicitud])
def list_my_solicitudes(
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("client")),
):
    return solicitudes_service.list_client_solicitudes(db, current)


@router.get("/received", response_model=list[ReceivedSolicitud])
def list_received_solicitudes(
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("freelancer")),
):
    return solicitudes_service.list_received_solicitudes(db, current)


@router.post("/{solicitud_id}/accept", response_model=ReceivedSolicitud)
def accept_solicitud(
    solicitud_id: str,
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("freelancer")),
):
    return solicitudes_service.accept_solicitud(db, current, solicitud_id)


@router.post("/{solicitud_id}/reject", response_model=ReceivedSolicitud)
def reject_solicitud(
    solicitud_id: str,
    payload: SolicitudReject,
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("freelancer")),
):
    return solicitudes_service.reject_solicitud(db, current, solicitud_id, payload.reason)


# Enlace temporal (60 s) para abrir un adjunto; solo lo obtienen el cliente y el freelancer de esa solicitud.
@router.get("/{solicitud_id}/attachments/{attachment_id}/url", response_model=AttachmentUrl)
def get_attachment_url(
    solicitud_id: str,
    attachment_id: str,
    db: Session = Depends(get_db),
    current: Perfil = Depends(get_current_profile),
):
    return AttachmentUrl(
        url=solicitudes_service.get_attachment_url(db, current, solicitud_id, attachment_id)
    )
