from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_profile, require_role
from app.models.perfil import Perfil
from app.schemas.delivery import ContractDeliveries, DeliveryAttachmentUrl, DeliveryCreate
from app.services import deliveries_service as service
from app.services import storage_service
from app.services.deliveries_service import FileUpload

router = APIRouter(prefix="/api/deliveries", tags=["deliveries"])


async def _read_files(files: list[UploadFile]) -> list[FileUpload]:
    # Se lee un byte de más para detectar archivos que superan el límite sin cargarlos enteros.
    return [
        FileUpload(name=file.filename or "archivo", content=await file.read(storage_service.DELIVERY_MAX_FILE_BYTES + 1))
        for file in files
    ]


# Todas las acciones devuelven la lista actualizada de contratos, para que la pantalla no tenga que adivinar.
@router.get("", response_model=list[ContractDeliveries])
def list_deliveries(db: Session = Depends(get_db), current: Perfil = Depends(get_current_profile)):
    return service.list_contracts(db, current)


@router.post("/contracts/{contract_id}/items", response_model=list[ContractDeliveries], status_code=status.HTTP_201_CREATED)
def create_delivery(
    contract_id: str,
    payload: DeliveryCreate,
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("freelancer")),
):
    service.create_delivery(db, current, contract_id, payload)
    return service.list_contracts(db, current)


@router.delete("/items/{delivery_id}", response_model=list[ContractDeliveries])
def delete_delivery(
    delivery_id: str,
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("freelancer")),
):
    service.delete_delivery(db, current, delivery_id)
    return service.list_contracts(db, current)


# Avance del freelancer: multipart porque puede traer archivos.
@router.post("/items/{delivery_id}/advances", response_model=list[ContractDeliveries], status_code=status.HTTP_201_CREATED)
async def add_advance(
    delivery_id: str,
    note: Annotated[str, Form(max_length=service.MAX_NOTE_LENGTH)],
    progress: Annotated[int, Form(ge=0, le=100)],
    links: Annotated[list[str], Form()] = [],
    files: Annotated[list[UploadFile], File()] = [],
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("freelancer")),
):
    service.add_advance(db, current, delivery_id, note, progress, await _read_files(files), links)
    return service.list_contracts(db, current)


# Revisión del cliente: aprobar o pedir cambios (estos consumen las revisiones del plan).
@router.post("/items/{delivery_id}/reviews", response_model=list[ContractDeliveries], status_code=status.HTTP_201_CREATED)
async def add_review(
    delivery_id: str,
    type: Annotated[str, Form()],
    comment: Annotated[str, Form(max_length=service.MAX_NOTE_LENGTH)] = "",
    links: Annotated[list[str], Form()] = [],
    files: Annotated[list[UploadFile], File()] = [],
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("client")),
):
    service.add_review(db, current, delivery_id, type, comment, await _read_files(files), links)
    return service.list_contracts(db, current)


# Enlace temporal (60 s) para abrir un archivo; solo lo obtienen el cliente y el freelancer del contrato.
@router.get("/items/{delivery_id}/attachments/{attachment_id}/url", response_model=DeliveryAttachmentUrl)
def get_attachment_url(
    delivery_id: str,
    attachment_id: str,
    db: Session = Depends(get_db),
    current: Perfil = Depends(get_current_profile),
):
    return DeliveryAttachmentUrl(url=service.get_attachment_url(db, current, delivery_id, attachment_id))
