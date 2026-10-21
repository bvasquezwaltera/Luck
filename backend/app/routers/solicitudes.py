from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models.perfil import Perfil
from app.schemas.solicitud import ClientSolicitud, SolicitudCreate, SolicitudCreated
from app.services import solicitudes_service

router = APIRouter(prefix="/api/solicitudes", tags=["solicitudes"])


# Solo un cliente con sesión puede enviar una solicitud: require_role("client")
# responde 401 sin sesión y 403 si la cuenta es de freelancer.
@router.post("", response_model=SolicitudCreated, status_code=status.HTTP_201_CREATED)
def create_solicitud(
    payload: SolicitudCreate,
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("client")),
):
    return solicitudes_service.create_solicitud(db, current, payload)


@router.get("/mine", response_model=list[ClientSolicitud])
def list_my_solicitudes(
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("client")),
):
    return solicitudes_service.list_client_solicitudes(db, current)
