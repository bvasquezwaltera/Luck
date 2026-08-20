import uuid
from datetime import datetime

from sqlalchemy import DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Perfil(Base):
    __tablename__ = "perfiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    rol: Mapped[str] = mapped_column(Text)
    nombre_completo: Mapped[str] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_active_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    pais_codigo: Mapped[str | None] = mapped_column(Text, nullable=True)
    pais: Mapped[str | None] = mapped_column(Text, nullable=True)
    zona_horaria: Mapped[str | None] = mapped_column(Text, nullable=True)
