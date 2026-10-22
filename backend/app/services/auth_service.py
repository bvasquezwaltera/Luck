import logging

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.caracteristica_plan import CaracteristicaPlan
from app.models.categoria_metodo_trabajo import CategoriaMetodoTrabajo
from app.models.diferenciador import DiferenciadorFreelancer
from app.models.educacion import Educacion
from app.models.experiencia import Experiencia
from app.models.habilidad import HabilidadFreelancer
from app.models.herramienta import HerramientaFreelancer
from app.models.idioma import IdiomaFreelancer
from app.models.item_metodo_trabajo import ItemMetodoTrabajo
from app.models.perfil import Perfil
from app.models.perfil_freelancer import PerfilFreelancer
from app.models.plan_suscripcion import PlanSuscripcion
from app.models.proyecto_portafolio import ProyectoPortafolio
from app.models.resena import Resena
from app.models.solicitud import Solicitud, SolicitudAdjunto
from app.services import auth_validation, deliveries_service, messages_service, storage_service
from app.core.config import settings
from app.schemas.auth import ActionResult, AuthResponse, SignInRequest, SignUpRequest
from app.services.supabase_client import create_auth_client, supabase_auth

logger = logging.getLogger(__name__)

# La plataforma está orientada a Perú: valores iniciales hasta que el usuario los cambie.
DEFAULT_COUNTRY_CODE = "PE"
DEFAULT_COUNTRY = "Perú"
DEFAULT_TIMEZONE = "GMT-5 (Lima)"
# Pantalla del frontend a la que lleva el enlace del correo de recuperación.
RESET_PASSWORD_PATH = "/restablecer-contrasena"


def sign_up(db: Session, payload: SignUpRequest) -> AuthResponse:
    if payload.role not in ("freelancer", "client"):
        return AuthResponse(error="Rol inválido.")

    # El formulario ya valida, pero la API no debe confiar en eso: cualquiera puede llamarla directamente.
    error = (
        auth_validation.validate_full_name(payload.fullName)
        or auth_validation.validate_email(payload.email)
        or auth_validation.validate_password(payload.password)
    )
    if error:
        return AuthResponse(error=error)
    email = payload.email.strip()
    full_name = payload.fullName.strip()

    try:
        result = create_auth_client().auth.sign_up({"email": email, "password": payload.password})
    except Exception as exc:
        return AuthResponse(error=str(exc))

    if not result.user:
        return AuthResponse(error="No se pudo crear la cuenta.")

    perfil = Perfil(
        id=result.user.id,
        rol=payload.role,
        nombre_completo=full_name,
        pais_codigo=DEFAULT_COUNTRY_CODE,
        pais=DEFAULT_COUNTRY,
        zona_horaria=DEFAULT_TIMEZONE,
    )
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
        result = create_auth_client().auth.sign_in_with_password(
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


def refresh_session(refresh_token: str) -> AuthResponse:
    """Cambia el token de renovación por una sesión nueva (el de acceso dura solo una hora).

    Supabase rota el token de renovación: el que se envía deja de servir y el que vuelve es el que hay que guardar."""
    if not refresh_token.strip():
        return AuthResponse(error="Sesión vencida.")

    try:
        result = create_auth_client().auth.refresh_session(refresh_token.strip())
    except Exception:
        return AuthResponse(error="Sesión vencida.")

    session = result.session
    if not session:
        return AuthResponse(error="Sesión vencida.")
    return AuthResponse(accessToken=session.access_token, refreshToken=session.refresh_token)


ONBOARDING_ORDER = ["pendiente", "bienvenida_vista", "completado"]


def advance_onboarding(db: Session, perfil: Perfil, state: str) -> ActionResult:
    """La guía solo avanza: pendiente -> bienvenida_vista -> completado. Pedir un paso anterior no hace nada."""
    if state not in ONBOARDING_ORDER:
        return ActionResult(error="Estado inválido.")

    if ONBOARDING_ORDER.index(state) > ONBOARDING_ORDER.index(perfil.onboarding):
        perfil.onboarding = state
        db.commit()
    return ActionResult()


def forgot_password(email: str) -> ActionResult:
    """Envía el correo con el enlace para elegir una contraseña nueva.

    Responde igual exista o no la cuenta: si no, cualquiera podría averiguar qué correos están registrados."""
    error = auth_validation.validate_email(email)
    if error:
        return ActionResult(error=error)

    try:
        create_auth_client().auth.reset_password_for_email(
            email.strip(), {"redirect_to": settings.frontend_url.rstrip("/") + RESET_PASSWORD_PATH}
        )
    except Exception as exc:
        # Supabase limita cuántos correos se pueden enviar por hora: ese caso sí se le avisa a la persona.
        if "rate limit" in str(exc).lower():
            return ActionResult(error="Se enviaron demasiados correos. Espera unos minutos antes de intentarlo de nuevo.")
        # Cualquier otro fallo no se detalla (podría delatar si la cuenta existe); queda en el registro del servidor.
        logger.warning("No se pudo enviar el correo de recuperación: %s", exc)

    return ActionResult()


def change_password(user_id: str, new_password: str) -> ActionResult:
    error = auth_validation.validate_password(new_password)
    if error:
        return ActionResult(error=error)

    try:
        supabase_auth.auth.admin.update_user_by_id(user_id, {"password": new_password})
    except Exception as exc:
        return ActionResult(error=str(exc))

    return ActionResult()


def delete_account(db: Session, freelancer_id: str) -> ActionResult:
    plan_ids = [
        row[0]
        for row in db.query(PlanSuscripcion.id).filter(PlanSuscripcion.freelancer_id == freelancer_id).all()
    ]
    categoria_ids = [
        row[0]
        for row in db.query(CategoriaMetodoTrabajo.id)
        .filter(CategoriaMetodoTrabajo.freelancer_id == freelancer_id)
        .all()
    ]

    if categoria_ids:
        db.query(ItemMetodoTrabajo).filter(ItemMetodoTrabajo.categoria_id.in_(categoria_ids)).delete(
            synchronize_session=False
        )
    if plan_ids:
        db.query(CaracteristicaPlan).filter(CaracteristicaPlan.plan_id.in_(plan_ids)).delete(
            synchronize_session=False
        )

    db.query(CategoriaMetodoTrabajo).filter(CategoriaMetodoTrabajo.freelancer_id == freelancer_id).delete()
    db.query(DiferenciadorFreelancer).filter(DiferenciadorFreelancer.freelancer_id == freelancer_id).delete()
    db.query(HabilidadFreelancer).filter(HabilidadFreelancer.freelancer_id == freelancer_id).delete()
    db.query(HerramientaFreelancer).filter(HerramientaFreelancer.freelancer_id == freelancer_id).delete()
    db.query(IdiomaFreelancer).filter(IdiomaFreelancer.freelancer_id == freelancer_id).delete()
    db.query(Experiencia).filter(Experiencia.freelancer_id == freelancer_id).delete()
    db.query(Educacion).filter(Educacion.freelancer_id == freelancer_id).delete()
    db.query(PlanSuscripcion).filter(PlanSuscripcion.freelancer_id == freelancer_id).delete()
    # Los archivos viven en Storage, fuera de la base: se recogen sus rutas antes de borrar las filas.
    entrega_paths = deliveries_service.attachment_paths_for_user(db, freelancer_id) + messages_service.attachment_paths_for_user(
        db, freelancer_id
    )
    adjunto_paths = list(
        db.scalars(
            select(SolicitudAdjunto.ruta)
            .join(Solicitud, Solicitud.id == SolicitudAdjunto.solicitud_id)
            .where((Solicitud.cliente_id == freelancer_id) | (Solicitud.freelancer_id == freelancer_id))
        )
    )
    db.query(Solicitud).filter(
        (Solicitud.cliente_id == freelancer_id) | (Solicitud.freelancer_id == freelancer_id)
    ).delete(synchronize_session=False)
    db.query(Resena).filter(Resena.freelancer_id == freelancer_id).delete()
    db.query(ProyectoPortafolio).filter(ProyectoPortafolio.freelancer_id == freelancer_id).delete()
    db.query(PerfilFreelancer).filter(PerfilFreelancer.perfil_id == freelancer_id).delete()
    db.query(Perfil).filter(Perfil.id == freelancer_id).delete()
    db.commit()
    storage_service.remove(adjunto_paths)
    storage_service.remove(entrega_paths, bucket=storage_service.DELIVERY_BUCKET)

    try:
        supabase_auth.auth.admin.delete_user(freelancer_id)
    except Exception as exc:
        return ActionResult(error=str(exc))

    return ActionResult()
