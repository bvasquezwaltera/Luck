from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models.perfil import Perfil
from app.schemas.client_profile import ClientProfile, ClientProfileUpdate
from app.services import client_profile_service

router = APIRouter(prefix="/api/client-profile", tags=["client-profile"])


@router.get("/me", response_model=ClientProfile)
def get_my_profile(current: Perfil = Depends(require_role("client"))):
    return client_profile_service.get_client_profile(current)


@router.put("/me", response_model=ClientProfile)
def save_my_profile(
    payload: ClientProfileUpdate,
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("client")),
):
    return client_profile_service.save_client_profile(db, current, payload)
