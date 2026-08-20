import uuid

from sqlalchemy import ForeignKey, SmallInteger, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Educacion(Base):
    __tablename__ = "educacion"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id"))
    anio_desde: Mapped[int] = mapped_column(SmallInteger)
    anio_hasta: Mapped[int] = mapped_column(SmallInteger)
    titulo: Mapped[str] = mapped_column(Text)
    institucion: Mapped[str] = mapped_column(Text)
