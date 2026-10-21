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
from app.services import deliveries_service, messages_service, storage_service
from app.schemas.auth import ActionResult, AuthResponse, SignInRequest, SignUpRequest
from app.services.supabase_client import create_auth_client, supabase_auth


# La plataforma está orientada a Perú: valores iniciales hasta que el usuario los cambie.
DEFAULT_COUNTRY_CODE = "PE"
DEFAULT_COUNTRY = "Perú"
DEFAULT_TIMEZONE = "GMT-5 (Lima)"


def sign_up(db: Session, payload: SignUpRequest) -> AuthResponse:
    if payload.role not in ("freelancer", "client"):
        return AuthResponse(error="Rol inválido.")

    try:
        result = create_auth_client().auth.sign_up({"email": payload.email, "password": payload.password})
    except Exception as exc:
        return AuthResponse(error=str(exc))

    if not result.user:
        return AuthResponse(error="No se pudo crear la cuenta.")

    perfil = Perfil(
        id=result.user.id,
        rol=payload.role,
        nombre_completo=payload.fullName,
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


def change_password(user_id: str, new_password: str) -> ActionResult:
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
