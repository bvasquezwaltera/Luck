import uuid
from datetime import date, datetime

from sqlalchemy import ARRAY, Date, DateTime, ForeignKey, Integer, Numeric, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

ESTADO_ENVIADA = "enviada"
ESTADO_ACEPTADA = "aceptada"
ESTADO_RECHAZADA = "rechazada"
ESTADO_CONTRATADA = "contratada"


class Solicitud(Base):
    __tablename__ = "solicitudes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cliente_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id", ondelete="CASCADE"))
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id", ondelete="CASCADE"))
    # Copia del plan al momento de enviar: si el freelancer lo edita o lo borra después,
    # lo que el cliente solicitó no cambia. Por eso plan_id no es una clave foránea.
    plan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    plan_nombre: Mapped[str] = mapped_column(Text)
    plan_nivel: Mapped[str] = mapped_column(Text)
    plan_precio: Mapped[float] = mapped_column(Numeric)
    plan_proyectos_activos: Mapped[str] = mapped_column(Text, default="")
    plan_revisiones: Mapped[str] = mapped_column(Text, default="")
    titulo: Mapped[str] = mapped_column(Text)
    descripcion: Mapped[str] = mapped_column(Text)
    caracteristicas: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    categoria: Mapped[str] = mapped_column(Text)
    fecha_deseada: Mapped[date | None] = mapped_column(Date, nullable=True)
    estado: Mapped[str] = mapped_column(Text, default=ESTADO_ENVIADA)
    motivo_rechazo: Mapped[str | None] = mapped_column(Text, nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class SolicitudAdjunto(Base):
    __tablename__ = "solicitud_adjuntos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    solicitud_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("solicitudes.id", ondelete="CASCADE")
    )
    nombre: Mapped[str] = mapped_column(Text)
    tipo: Mapped[str] = mapped_column(Text)
    tamano: Mapped[int] = mapped_column(Integer)
    ruta: Mapped[str] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
