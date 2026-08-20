from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_profile
from app.models.perfil import Perfil
from app.schemas.subscription_plan import SubscriptionPlan
from app.services import subscription_plans_service

router = APIRouter(prefix="/api/subscription-plans", tags=["subscription-plans"])


@router.get("/{freelancer_id}")
def get_plans(freelancer_id: str, db: Session = Depends(get_db)):
    return {"plans": subscription_plans_service.get_subscription_plans(db, freelancer_id)}


@router.post("/{freelancer_id}")
def save_plans(
    freelancer_id: str,
    payload: list[SubscriptionPlan],
    db: Session = Depends(get_db),
    current: Perfil = Depends(get_current_profile),
):
    if str(current.id) != freelancer_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No puedes editar los planes de otro usuario.")
    return subscription_plans_service.save_subscription_plans(db, freelancer_id, payload)
