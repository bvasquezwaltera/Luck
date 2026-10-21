from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_profile, require_role
from app.models.perfil import Perfil
from app.schemas.payment import ClientPaymentSummary, FreelancerPaymentSummary, PaymentOut
from app.services import payments_service
from app.services.receipt_pdf import build_receipt_pdf

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/mine", response_model=list[PaymentOut])
def list_my_payments(
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("client")),
):
    return payments_service.list_client_payments(db, current)


@router.get("/mine/summary", response_model=ClientPaymentSummary)
def my_payment_summary(
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("client")),
):
    return payments_service.client_summary(db, current)


@router.get("/received", response_model=list[PaymentOut])
def list_received_payments(
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("freelancer")),
):
    return payments_service.list_freelancer_payments(db, current)


@router.get("/received/summary", response_model=FreelancerPaymentSummary)
def received_payment_summary(
    db: Session = Depends(get_db),
    current: Perfil = Depends(require_role("freelancer")),
):
    return payments_service.freelancer_summary(db, current)


# Comprobante en PDF: solo lo descargan el cliente y el freelancer de ese pago.
@router.get("/{payment_id}/receipt")
def download_receipt(
    payment_id: str,
    db: Session = Depends(get_db),
    current: Perfil = Depends(get_current_profile),
):
    pago, solicitud, cliente, freelancer = payments_service.get_payment_for_receipt(db, current, payment_id)
    pdf = build_receipt_pdf(pago, solicitud, cliente, freelancer, current)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="comprobante-{pago.referencia}.pdf"'},
    )
