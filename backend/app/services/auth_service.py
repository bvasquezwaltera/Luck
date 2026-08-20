from sqlalchemy.orm import Session

from app.models.perfil import Perfil
from app.schemas.auth import AuthResponse, SignInRequest, SignUpRequest
from app.services.supabase_client import supabase_auth


def sign_up(db: Session, payload: SignUpRequest) -> AuthResponse:
    if payload.role not in ("freelancer", "client"):
        return AuthResponse(error="Rol inválido.")

    try:
        result = supabase_auth.auth.sign_up({"email": payload.email, "password": payload.password})
    except Exception as exc:
        return AuthResponse(error=str(exc))

    if not result.user:
        return AuthResponse(error="No se pudo crear la cuenta.")

    perfil = Perfil(id=result.user.id, rol=payload.role, nombre_completo=payload.fullName)
    db.add(perfil)
    db.commit()

    session = result.session
    return AuthResponse(
        role=payload.role,
        accessToken=session.access_token if session else None,
        refreshToken=session.refresh_token if session else None,
    )


def sign_in(db: Session, payload: SignInRequest) -> AuthResponse:
    try:
        result = supabase_auth.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as exc:
        return AuthResponse(error=str(exc))

    if not result.user:
        return AuthResponse(error="No se pudo iniciar sesión.")

    perfil = db.get(Perfil, result.user.id)
    if not perfil:
        return AuthResponse(error="No se encontró el perfil de esta cuenta.")

    session = result.session
    return AuthResponse(
        role=perfil.rol,
        accessToken=session.access_token if session else None,
        refreshToken=session.refresh_token if session else None,
    )
