import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Mensaje(Base):
    """Un mensaje del chat de un contrato. El chat existe mientras exista el contrato: es entre su cliente y su freelancer."""

    __tablename__ = "mensajes"
    __table_args__ = (
        CheckConstraint("texto <> '' OR adjunto_ruta IS NOT NULL", name="mensajes_texto_o_adjunto_check"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contrato_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contratos.id", ondelete="CASCADE"))
    emisor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id", ondelete="CASCADE"))
    texto: Mapped[str] = mapped_column(Text, default="")
    # Un archivo opcional por mensaje, guardado en Storage.
    adjunto_nombre: Mapped[str | None] = mapped_column(Text, nullable=True)
    adjunto_tipo: Mapped[str | None] = mapped_column(Text, nullable=True)
    adjunto_tamano: Mapped[int | None] = mapped_column(Integer, nullable=True)
    adjunto_ruta: Mapped[str | None] = mapped_column(Text, nullable=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    # Cuándo lo leyó la otra persona; vacío = sin leer.
    leido_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
