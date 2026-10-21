from datetime import datetime

from pydantic import BaseModel


class PayRequest(BaseModel):
    # Solo lo usa el proveedor simulado (pruebas): la pantalla ya no lo envía.
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
    # Solo para el freelancer: lo que la plataforma retiene y lo que recibe. El cliente no ve la comisión.
    commissionRate: float | None = None
    commission: float | None = None
    net: float | None = None


class ClientPaymentSummary(BaseModel):
    activeContracts: int
    monthlySpend: float
    nextChargeAt: datetime | None


class FreelancerPaymentSummary(BaseModel):
    commissionRate: float
    totalGross: float
    totalCommission: float
    totalNet: float
    activeContracts: int
    monthlyNet: float
    nextChargeAt: datetime | None
