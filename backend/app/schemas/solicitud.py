from datetime import date, datetime

from pydantic import BaseModel, Field


class SolicitudCreate(BaseModel):
    freelancerId: str
    planId: str
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1, max_length=4000)
    desiredDate: date | None = None
    characteristics: list[str] = Field(default_factory=list, max_length=20)


class SolicitudCreated(BaseModel):
    id: str
    status: str


class SolicitudFreelancer(BaseModel):
    id: str
    name: str
    initials: str
    specialty: str


class SolicitudClient(BaseModel):
    id: str
    name: str
    initials: str
    country: str


class SolicitudPlan(BaseModel):
    name: str
    tier: str
    price: float
    activeProjects: str
    revisions: str


class SolicitudPayment(BaseModel):
    reference: str
    amount: float
    paidAt: datetime
    nextChargeAt: datetime


class SolicitudAttachment(BaseModel):
    id: str
    name: str
    type: str  # "pdf" | "image"
    size: str


class ClientSolicitud(BaseModel):
    id: str
    title: str
    description: str
    characteristics: list[str]
    category: str
    desiredDate: date | None
    status: str
    rejectionReason: str | None
    createdAt: datetime
    plan: SolicitudPlan
    attachments: list[SolicitudAttachment]
    payment: SolicitudPayment | None = None
    freelancer: SolicitudFreelancer


class ReceivedSolicitud(BaseModel):
    id: str
    title: str
    description: str
    characteristics: list[str]
    category: str
    desiredDate: date | None
    status: str
    rejectionReason: str | None
    createdAt: datetime
    plan: SolicitudPlan
    attachments: list[SolicitudAttachment]
    payment: SolicitudPayment | None = None
    client: SolicitudClient


class SolicitudReject(BaseModel):
    reason: str | None = Field(default=None, max_length=500)


class AttachmentUrl(BaseModel):
    url: str
