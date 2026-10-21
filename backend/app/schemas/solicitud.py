from datetime import date, datetime

from pydantic import BaseModel, Field


class SolicitudCreate(BaseModel):
    freelancerId: str
    planId: str
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1, max_length=4000)
    desiredDate: date | None = None


class SolicitudCreated(BaseModel):
    id: str
    status: str


class SolicitudFreelancer(BaseModel):
    id: str
    name: str
    initials: str
    specialty: str


class SolicitudPlan(BaseModel):
    name: str
    tier: str
    price: float


class ClientSolicitud(BaseModel):
    id: str
    title: str
    description: str
    category: str
    desiredDate: date | None
    status: str
    rejectionReason: str | None
    createdAt: datetime
    plan: SolicitudPlan
    freelancer: SolicitudFreelancer
