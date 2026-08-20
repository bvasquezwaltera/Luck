import uuid
from datetime import datetime

from sqlalchemy import ARRAY, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Resena(Base):
    __tablename__ = "resenas"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id"))
    nombre_autor: Mapped[str] = mapped_column(Text)
    iniciales_autor: Mapped[str] = mapped_column(Text)
    pais: Mapped[str | None] = mapped_column(Text, nullable=True)
    pais_codigo: Mapped[str | None] = mapped_column(Text, nullable=True)
    calificacion: Mapped[float] = mapped_column(Numeric)
    titulo: Mapped[str] = mapped_column(Text)
    comentario: Mapped[str] = mapped_column(Text)
    etiquetas: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    servicio: Mapped[str] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True))
