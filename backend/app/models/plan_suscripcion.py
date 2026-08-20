import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PlanSuscripcion(Base):
    __tablename__ = "planes_suscripcion"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id"))
    nivel: Mapped[str] = mapped_column(Text)
    nombre: Mapped[str] = mapped_column(Text)
    descripcion: Mapped[str] = mapped_column(Text)
    precio: Mapped[float] = mapped_column(Numeric)
    proyectos_activos: Mapped[str] = mapped_column(Text)
    revisiones: Mapped[str] = mapped_column(Text)
    activo: Mapped[bool] = mapped_column(Boolean)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
