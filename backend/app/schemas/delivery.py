from datetime import date, datetime

from pydantic import BaseModel, Field


class DeliveryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str = Field(min_length=1, max_length=2000)
    dueDate: date
    objectives: list[str] = Field(default_factory=list, max_length=10)


class DeliveryAttachment(BaseModel):
    id: str
    name: str
    type: str  # "pdf" | "image" | "file" | "link"
    size: str | None  # None en los enlaces
    url: str | None  # solo los enlaces la traen; los archivos se abren con un enlace temporal aparte


class DeliveryAdvance(BaseModel):
    id: str
    note: str
    progress: int
    createdAt: datetime
    attachments: list[DeliveryAttachment]


class DeliveryReview(BaseModel):
    id: str
    type: str  # "aprobado" | "cambios"
    comment: str
    createdAt: datetime
    attachments: list[DeliveryAttachment]


class DeliveryItem(BaseModel):
    id: str
    title: str
    description: str
    objectives: list[str]
    dueDate: date
    status: str  # pendiente | en_revision | cambios_solicitados | aprobada
    progress: int
    createdAt: datetime
    advances: list[DeliveryAdvance]
    reviews: list[DeliveryReview]


class DeliveryCounterpart(BaseModel):
    id: str
    name: str
    initials: str


class ContractDeliveries(BaseModel):
    contractId: str
    solicitudId: str
    title: str
    category: str
    planName: str
    startedAt: datetime
    nextChargeAt: datetime
    # None = el plan no limita las revisiones.
    revisionsLimit: int | None
    revisionsUsed: int
    counterpart: DeliveryCounterpart
    deliveries: list[DeliveryItem]


class DeliveryAttachmentUrl(BaseModel):
    url: str
