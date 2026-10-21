import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.perfil import Perfil
from app.models.perfil_freelancer import PerfilFreelancer
from app.models.plan_suscripcion import PlanSuscripcion
from app.models.solicitud import ESTADO_ENVIADA, Solicitud
from app.schemas.solicitud import (
    ClientSolicitud,
    SolicitudCreate,
    SolicitudCreated,
    SolicitudFreelancer,
    SolicitudPlan,
)
from app.services.utils import get_initials


def _parse_uuid(value: str, message: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, message)


def create_solicitud(db: Session, cliente: Perfil, payload: SolicitudCreate) -> SolicitudCreated:
    freelancer_id = _parse_uuid(payload.freelancerId, "Freelancer inválido.")
    plan_id = _parse_uuid(payload.planId, "Plan inválido.")

    freelancer = db.get(Perfil, freelancer_id)
    if not freelancer or freelancer.rol != "freelancer":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró al freelancer.")

    # El plan, su precio y la categoría salen de la base de datos, nunca del cliente.
    plan = db.get(PlanSuscripcion, plan_id)
    if not plan or plan.freelancer_id != freelancer_id or not plan.activo:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Ese plan no está disponible.")

    duplicada = db.scalar(
        select(Solicitud.id).where(
            Solicitud.cliente_id == cliente.id,
            Solicitud.plan_id == plan_id,
            Solicitud.estado == ESTADO_ENVIADA,
        )
    )
    if duplicada:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Ya enviaste una solicitud para este plan y sigue pendiente."
        )

    perfil_freelancer = db.get(PerfilFreelancer, freelancer_id)
    categoria = (perfil_freelancer.categoria if perfil_freelancer else "") or ""

    solicitud = Solicitud(
        cliente_id=cliente.id,
        freelancer_id=freelancer_id,
        plan_id=plan.id,
        plan_nombre=plan.nombre,
        plan_nivel=plan.nivel,
        plan_precio=plan.precio,
        titulo=payload.title.strip(),
        descripcion=payload.description.strip(),
        categoria=categoria,
        fecha_deseada=payload.desiredDate,
        estado=ESTADO_ENVIADA,
    )
    db.add(solicitud)
    db.commit()

    return SolicitudCreated(id=str(solicitud.id), status=solicitud.estado)


def list_client_solicitudes(db: Session, cliente: Perfil) -> list[ClientSolicitud]:
    rows = db.execute(
        select(Solicitud, Perfil, PerfilFreelancer)
        .join(Perfil, Perfil.id == Solicitud.freelancer_id)
        .outerjoin(PerfilFreelancer, PerfilFreelancer.perfil_id == Solicitud.freelancer_id)
        .where(Solicitud.cliente_id == cliente.id)
        .order_by(Solicitud.creado_en.desc())
    ).all()

    return [
        ClientSolicitud(
            id=str(solicitud.id),
            title=solicitud.titulo,
            description=solicitud.descripcion,
            category=solicitud.categoria,
            desiredDate=solicitud.fecha_deseada,
            status=solicitud.estado,
            rejectionReason=solicitud.motivo_rechazo,
            createdAt=solicitud.creado_en,
            plan=SolicitudPlan(
                name=solicitud.plan_nombre, tier=solicitud.plan_nivel, price=float(solicitud.plan_precio)
            ),
            freelancer=SolicitudFreelancer(
                id=str(freelancer.id),
                name=freelancer.nombre_completo,
                initials=get_initials(freelancer.nombre_completo),
                specialty=(perfil_freelancer.especialidad if perfil_freelancer else "") or "",
            ),
        )
        for solicitud, freelancer, perfil_freelancer in rows
    ]
