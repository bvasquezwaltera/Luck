from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_profile
from app.models.perfil import Perfil
from app.schemas.auth import AuthResponse, ProfileOut, SignInRequest, SignUpRequest
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/sign-up", response_model=AuthResponse)
def sign_up(payload: SignUpRequest, db: Session = Depends(get_db)):
    return auth_service.sign_up(db, payload)


@router.post("/sign-in", response_model=AuthResponse)
def sign_in(payload: SignInRequest, db: Session = Depends(get_db)):
    return auth_service.sign_in(db, payload)


@router.post("/sign-out")
def sign_out():
    # El cliente descarta el token localmente; no hay sesión de servidor que cerrar.
    return {"ok": True}


@router.get("/me", response_model=ProfileOut)
def me(profile: Perfil = Depends(get_current_profile)):
    return ProfileOut(id=str(profile.id), rol=profile.rol, nombre_completo=profile.nombre_completo)
