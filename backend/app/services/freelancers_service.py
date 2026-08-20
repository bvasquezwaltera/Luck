from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.habilidad import HabilidadFreelancer
from app.models.perfil import Perfil
from app.models.perfil_freelancer import PerfilFreelancer
from app.models.plan_suscripcion import PlanSuscripcion
from app.schemas.freelancer import Freelancer
from app.services.utils import get_initials


def get_freelancer_list(db: Session) -> list[Freelancer]:
    perfiles = db.scalars(select(Perfil).where(Perfil.rol == "freelancer")).all()
    freelancer_ids = [p.id for p in perfiles]
    if not freelancer_ids:
        return []

    perfiles_freelancer = db.scalars(
        select(PerfilFreelancer).where(PerfilFreelancer.perfil_id.in_(freelancer_ids))
    ).all()
    habilidades = db.scalars(
        select(HabilidadFreelancer)
        .where(HabilidadFreelancer.freelancer_id.in_(freelancer_ids))
        .order_by(HabilidadFreelancer.posicion)
    ).all()
    planes = db.scalars(
        select(PlanSuscripcion).where(
            PlanSuscripcion.freelancer_id.in_(freelancer_ids), PlanSuscripcion.activo.is_(True)
        )
    ).all()

    result: list[Freelancer] = []
    for perfil in perfiles:
        perfil_freelancer = next((pf for pf in perfiles_freelancer if pf.perfil_id == perfil.id), None)
        if not perfil_freelancer:
            continue

        skills = [h.nombre for h in habilidades if h.freelancer_id == perfil.id]
        plan_prices = [float(p.precio) for p in planes if p.freelancer_id == perfil.id]

        result.append(
            Freelancer(
                id=str(perfil.id),
                name=perfil.nombre_completo,
                initials=get_initials(perfil.nombre_completo),
                rating=float(perfil_freelancer.calificacion or 0),
                reviewCount=perfil_freelancer.cantidad_resenas or 0,
                specialty=perfil_freelancer.especialidad or "",
                category=perfil_freelancer.categoria or "",
                country=perfil.pais or "",
                countryCode=perfil.pais_codigo or "",
                skills=skills,
                # El conteo real de proyectos depende de datos que todavía no existen.
                projectCount=0,
                monthlyPriceFrom=min(plan_prices) if plan_prices else 0,
            )
        )

    return result
