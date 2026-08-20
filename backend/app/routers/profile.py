from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_profile
from app.models.perfil import Perfil
from app.schemas.freelancer_profile import FreelancerProfile
from app.services import profile_service

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/{freelancer_id}")
def get_profile(freelancer_id: str, db: Session = Depends(get_db)):
    profile = profile_service.get_freelancer_profile(db, freelancer_id)
    return {"profile": profile}


@router.post("/{freelancer_id}")
def save_profile(
    freelancer_id: str,
    payload: FreelancerProfile,
    db: Session = Depends(get_db),
    current: Perfil = Depends(get_current_profile),
):
    if str(current.id) != freelancer_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No puedes editar el perfil de otro usuario.")
    return profile_service.save_freelancer_profile(db, freelancer_id, payload)
