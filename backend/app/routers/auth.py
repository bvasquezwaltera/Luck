from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_profile, get_current_user
from app.models.perfil import Perfil
from app.schemas.auth import (
    ActionResult,
    AuthResponse,
    ChangePasswordRequest,
    GoogleUrl,
    OAuthCompleteRequest,
    ProfileOut,
    SignInRequest,
    SignUpRequest,
)
from app.services import auth_service, oauth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/sign-up", response_model=AuthResponse)
def sign_up(payload: SignUpRequest, db: Session = Depends(get_db)):
    return auth_service.sign_up(db, payload)


@router.post("/sign-in", response_model=AuthResponse)
def sign_in(payload: SignInRequest, db: Session = Depends(get_db)):
    return auth_service.sign_in(db, payload)


@router.get("/google-url", response_model=GoogleUrl)
def google_url():
    return GoogleUrl(url=oauth_service.google_authorize_url())


# Al volver de Google el frontend ya tiene el token; aquí se crea el perfil si es una cuenta nueva.
@router.post("/oauth/complete", response_model=AuthResponse)
def oauth_complete(payload: OAuthCompleteRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return oauth_service.complete_sign_in(db, user, payload.role)


@router.post("/sign-out")
def sign_out():
    # El cliente descarta el token localmente; no hay sesión de servidor que cerrar.
    return {"ok": True}


@router.get("/me", response_model=ProfileOut)
def me(profile: Perfil = Depends(get_current_profile)):
    return ProfileOut(id=str(profile.id), rol=profile.rol, nombre_completo=profile.nombre_completo)


@router.post("/change-password", response_model=ActionResult)
def change_password(payload: ChangePasswordRequest, profile: Perfil = Depends(get_current_profile)):
    return auth_service.change_password(str(profile.id), payload.newPassword)


@router.delete("/account", response_model=ActionResult)
def delete_account(db: Session = Depends(get_db), profile: Perfil = Depends(get_current_profile)):
    return auth_service.delete_account(db, str(profile.id))
