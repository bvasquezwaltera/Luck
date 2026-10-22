import uuid
from datetime import date, datetime

from sqlalchemy import ARRAY, CheckConstraint, Date, DateTime, ForeignKey, Integer, SmallInteger, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

ENTREGA_PENDIENTE = "pendiente"
ENTREGA_EN_REVISION = "en_revision"
ENTREGA_CAMBIOS = "cambios_solicitados"
ENTREGA_APROBADA = "aprobada"

REVISION_APROBADO = "aprobado"
REVISION_CAMBIOS = "cambios"


class Entrega(Base):
    """Una entrega del proyecto (un 'módulo'): la planifica el freelancer y el cliente la revisa."""

    __tablename__ = "entregas"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contrato_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contratos.id", ondelete="CASCADE"))
    titulo: Mapped[str] = mapped_column(Text)
    descripcion: Mapped[str] = mapped_column(Text)
    objetivos: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list)
    fecha_limite: Mapped[date] = mapped_column(Date)
    estado: Mapped[str] = mapped_column(Text, default=ENTREGA_PENDIENTE)
    progreso: Mapped[int] = mapped_column(SmallInteger, default=0)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class EntregaAvance(Base):
    """Lo que sube el freelancer para que el cliente lo revise."""

    __tablename__ = "entrega_avances"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entrega_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entregas.id", ondelete="CASCADE"))
    nota: Mapped[str] = mapped_column(Text)
    progreso: Mapped[int] = mapped_column(SmallInteger, default=0)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class EntregaRevision(Base):
    """La respuesta del cliente a un avance: aprobar o pedir cambios (estos consumen revisiones del plan)."""

    __tablename__ = "entrega_revisiones"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entrega_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entregas.id", ondelete="CASCADE"))
    tipo: Mapped[str] = mapped_column(Text)
    comentario: Mapped[str] = mapped_column(Text, default="")
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class EntregaAdjunto(Base):
    """Archivo (guardado en Storage) o enlace, que cuelga de un avance o de una revisión."""

    __tablename__ = "entrega_adjuntos"
    __table_args__ = (
        CheckConstraint("(avance_id IS NOT NULL) <> (revision_id IS NOT NULL)", name="entrega_adjuntos_un_origen_check"),
        CheckConstraint("(ruta IS NOT NULL) <> (url IS NOT NULL)", name="entrega_adjuntos_archivo_o_enlace_check"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entrega_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entregas.id", ondelete="CASCADE"))
    avance_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entrega_avances.id", ondelete="CASCADE"), nullable=True
    )
    revision_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("entrega_revisiones.id", ondelete="CASCADE"), nullable=True
    )
    nombre: Mapped[str] = mapped_column(Text)
    tipo: Mapped[str] = mapped_column(Text)  # tipo MIME, o "link"
    tamano: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ruta: Mapped[str | None] = mapped_column(Text, nullable=True)
    url: Mapped[str | None] = mapped_column(Text, nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
