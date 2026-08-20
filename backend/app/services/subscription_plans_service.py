from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.caracteristica_plan import CaracteristicaPlan
from app.models.plan_suscripcion import PlanSuscripcion
from app.schemas.subscription_plan import SubscriptionPlan

DEFAULT_PLAN_NAMES = {"basico": "Básico", "estandar": "Estándar", "premium": "Premium"}
TIER_ORDER = ["basico", "estandar", "premium"]


def get_subscription_plans(db: Session, freelancer_id: str) -> list[SubscriptionPlan]:
    planes = db.scalars(
        select(PlanSuscripcion).where(PlanSuscripcion.freelancer_id == freelancer_id)
    ).all()

    plan_ids = [plan.id for plan in planes]
    caracteristicas: list[CaracteristicaPlan] = []
    if plan_ids:
        caracteristicas = list(
            db.scalars(
                select(CaracteristicaPlan)
                .where(CaracteristicaPlan.plan_id.in_(plan_ids))
                .order_by(CaracteristicaPlan.posicion)
            ).all()
        )

    result: list[SubscriptionPlan] = []
    for tier in TIER_ORDER:
        plan = next((p for p in planes if p.nivel == tier), None)
        if not plan:
            result.append(
                SubscriptionPlan(
                    id=f"nuevo-{tier}",
                    name=DEFAULT_PLAN_NAMES[tier],
                    tier=tier,
                    description="",
                    price=0,
                    activeProjects="",
                    revisions="",
                    features=[],
                    active=True,
                )
            )
            continue

        result.append(
            SubscriptionPlan(
                id=str(plan.id),
                name=plan.nombre,
                tier=plan.nivel,
                description=plan.descripcion,
                price=float(plan.precio),
                activeProjects=plan.proyectos_activos,
                revisions=plan.revisiones,
                active=plan.activo,
                features=[
                    {"id": str(f.id), "label": f.etiqueta, "value": f.valor}
                    for f in caracteristicas
                    if f.plan_id == plan.id
                ],
            )
        )

    return result


def save_subscription_plans(
    db: Session, freelancer_id: str, plans: list[SubscriptionPlan]
) -> dict[str, str]:
    for plan in plans:
        existing = db.scalars(
            select(PlanSuscripcion).where(
                PlanSuscripcion.freelancer_id == freelancer_id, PlanSuscripcion.nivel == plan.tier
            )
        ).first()

        if existing:
            existing.nombre = plan.name
            existing.descripcion = plan.description
            existing.precio = plan.price
            existing.proyectos_activos = plan.activeProjects
            existing.revisiones = plan.revisions
            existing.activo = plan.active
            saved_plan = existing
        else:
            saved_plan = PlanSuscripcion(
                freelancer_id=freelancer_id,
                nivel=plan.tier,
                nombre=plan.name,
                descripcion=plan.description,
                precio=plan.price,
                proyectos_activos=plan.activeProjects,
                revisiones=plan.revisions,
                activo=plan.active,
            )
            db.add(saved_plan)
        db.flush()

        db.query(CaracteristicaPlan).filter(CaracteristicaPlan.plan_id == saved_plan.id).delete()
        for index, feature in enumerate(plan.features):
            db.add(
                CaracteristicaPlan(
                    plan_id=saved_plan.id, etiqueta=feature.label, valor=feature.value, posicion=index
                )
            )

    db.commit()
    return {}
