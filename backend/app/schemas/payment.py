from datetime import datetime

from pydantic import BaseModel


class PayRequest(BaseModel):
    # Solo lo usa el proveedor simulado, para poder mostrar el caso de pago rechazado en la demostración.
    simulateDecline: bool = False


class PaymentReceipt(BaseModel):
    id: str
    solicitudId: str
    reference: str
    amount: float
    currency: str
    method: str
    status: str
    paidAt: datetime
    contractStartedAt: datetime
    nextChargeAt: datetime


class PaymentCounterpart(BaseModel):
    id: str
    name: str
    initials: str


class PaymentOut(BaseModel):
    id: str
    solicitudId: str
    solicitudTitle: str
    planName: str
    reference: str
    amount: float
    currency: str
    method: str
    status: str
    rejectionReason: str | None
    createdAt: datetime
    counterpart: PaymentCounterpart
