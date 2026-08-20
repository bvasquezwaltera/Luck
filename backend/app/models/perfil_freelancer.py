import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PerfilFreelancer(Base):
    __tablename__ = "perfiles_freelancer"

    perfil_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("perfiles.id"), primary_key=True
    )
    especialidad: Mapped[str | None] = mapped_column(Text, nullable=True)
    categoria: Mapped[str | None] = mapped_column(Text, nullable=True)
    biografia: Mapped[str | None] = mapped_column(Text, nullable=True)
    estado_disponibilidad: Mapped[str | None] = mapped_column(Text, nullable=True)
    calificacion: Mapped[float] = mapped_column(Numeric)
    cantidad_resenas: Mapped[int]
    actualizado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True))
