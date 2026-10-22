from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.perfil import Perfil
from app.schemas.client_profile import ClientProfile, ClientProfileUpdate
from app.services import profile_validation
from app.services.supabase_client import supabase_auth
from app.services.utils import get_initials


def _to_client_profile(perfil: Perfil) -> ClientProfile:
    try:
        auth_user = supabase_auth.auth.admin.get_user_by_id(str(perfil.id))
        email = auth_user.user.email or "" if auth_user and auth_user.user else ""
    except Exception:
        email = ""

    return ClientProfile(
        id=str(perfil.id),
        name=perfil.nombre_completo,
        email=email,
        initials=get_initials(perfil.nombre_completo),
        country=perfil.pais or "",
        countryCode=perfil.pais_codigo or "",
        timezone=perfil.zona_horaria or "",
    )


def get_client_profile(perfil: Perfil) -> ClientProfile:
    return _to_client_profile(perfil)


def save_client_profile(db: Session, perfil: Perfil, update: ClientProfileUpdate) -> ClientProfile:
    try:
        update = profile_validation.clean_client_update(update)
    except profile_validation.ProfileValidationError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(exc))

    perfil.nombre_completo = update.name
    perfil.pais = update.country
    perfil.pais_codigo = update.countryCode
    perfil.zona_horaria = update.timezone
    db.commit()
    return _to_client_profile(perfil)
