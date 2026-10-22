import re
from urllib.parse import urlencode

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.perfil import Perfil
from app.schemas.auth import AuthResponse
from app.services import auth_validation
from app.services.auth_service import DEFAULT_COUNTRY, DEFAULT_COUNTRY_CODE, DEFAULT_TIMEZONE

ROLES = ("freelancer", "client")
CALLBACK_PATH = "/auth/callback"


def google_authorize_url() -> str:
    """Dirección de Supabase que lleva a Google y, al terminar, vuelve a la pantalla de retorno del frontend.

    El retorno es siempre FRONTEND_URL (no un dato que mande el cliente), así nadie puede usar esto para redirigir
    a otro sitio; Supabase además solo acepta las direcciones que estén en su lista de redirecciones permitidas."""
    query = urlencode({"provider": "google", "redirect_to": settings.frontend_url.rstrip("/") + CALLBACK_PATH})
    return f"{settings.supabase_url.rstrip('/')}/auth/v1/authorize?{query}"


def display_name(metadata: dict | None, email: str | None) -> str:
    """Nombre para el perfil de quien entra con Google. Cumple las mismas reglas que el registro (letras, 3 o más):
    lo que traiga Google se limpia, y si no alcanza se usa la parte local del correo."""
    metadata = metadata or {}
    local = re.sub(r"[._-]+", " ", (email or "").split("@")[0]).title()  # "maria.lopez" -> "Maria Lopez"
    for candidate in (metadata.get("full_name"), metadata.get("name"), local):
        if not isinstance(candidate, str):
            continue
        # fuera números y símbolos que el nombre no permite; se juntan los espacios
        cleaned = re.sub(r"\s+", " ", re.sub(r"[^\w\s'’.-]|\d|_", " ", candidate)).strip(" '’.-")
        cleaned = cleaned[: auth_validation.NAME_MAX_LENGTH].strip()
        if not auth_validation.validate_full_name(cleaned):
            return cleaned
    return "Usuario"


def complete_sign_in(db: Session, user, role: str | None) -> AuthResponse:
    """Cierra el inicio de sesión con Google: si la cuenta ya tiene perfil entra con el que tiene; si es nueva, hace
    falta el rol (freelancer o cliente) para crearlo, y si no llegó se pide elegirlo."""
    perfil = db.get(Perfil, user.id)
    if perfil:
        return AuthResponse(role=perfil.rol)

    if role is None:
        return AuthResponse(needsRole=True)
    if role not in ROLES:
        return AuthResponse(error="Rol inválido.")

    db.add(
        Perfil(
            id=user.id,
            rol=role,
            nombre_completo=display_name(getattr(user, "user_metadata", None), getattr(user, "email", None)),
            pais_codigo=DEFAULT_COUNTRY_CODE,
            pais=DEFAULT_COUNTRY,
            zona_horaria=DEFAULT_TIMEZONE,
        )
    )
    db.commit()
    return AuthResponse(role=role)
