from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models.perfil import Perfil
from app.schemas.payment import PaymentOut
from app.services import payments_service

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/mine", response_model=list[PaymentOut])
def list_my_payments(
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("client")),
):
    return payments_service.list_client_payments(db, current)


@router.get("/received", response_model=list[PaymentOut])
def list_received_payments(
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("freelancer")),
):
    return payments_service.list_freelancer_payments(db, current)
