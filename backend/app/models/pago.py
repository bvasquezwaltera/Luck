import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

PAGO_APROBADO = "aprobado"
PAGO_RECHAZADO = "rechazado"
CONTRATO_ACTIVO = "activo"


class Pago(Base):
    """Un intento de cobro. Los rechazados también se guardan, como historial."""

    __tablename__ = "pagos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    solicitud_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("solicitudes.id", ondelete="CASCADE")
    )
    cliente_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id", ondelete="CASCADE"))
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id", ondelete="CASCADE"))
    monto: Mapped[float] = mapped_column(Numeric)
    moneda: Mapped[str] = mapped_column(Text, default="USD")
    metodo: Mapped[str] = mapped_column(Text, default="simulado")
    referencia: Mapped[str] = mapped_column(Text, unique=True)
    estado: Mapped[str] = mapped_column(Text)
    motivo_rechazo: Mapped[str | None] = mapped_column(Text, nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Contrato(Base):
    """La suscripción activa que nace de un pago aprobado."""

    __tablename__ = "contratos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    solicitud_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("solicitudes.id", ondelete="CASCADE"), unique=True
    )
    cliente_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id", ondelete="CASCADE"))
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id", ondelete="CASCADE"))
    plan_nombre: Mapped[str] = mapped_column(Text)
    plan_nivel: Mapped[str] = mapped_column(Text)
    plan_precio: Mapped[float] = mapped_column(Numeric)
    estado: Mapped[str] = mapped_column(Text, default=CONTRATO_ACTIVO)
    inicio: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    proximo_cobro: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
