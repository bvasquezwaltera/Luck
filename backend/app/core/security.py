from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.perfil import Perfil
from app.services.supabase_client import supabase_auth

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_profile(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Perfil:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado.")

    try:
        user_response = supabase_auth.auth.get_user(credentials.credentials)
    except Exception as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión inválida.") from exc

    user = user_response.user if user_response else None
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión inválida.")

    profile = db.get(Perfil, user.id)
    if not profile:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró el perfil de esta cuenta.")

    return profile


def require_role(role: str):
    def _check(profile: Perfil = Depends(get_current_profile)) -> Perfil:
        if profile.rol != role:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tienes permiso para acceder a este recurso.")
        return profile

    return _check
