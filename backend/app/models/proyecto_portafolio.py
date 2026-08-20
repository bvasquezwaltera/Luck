import uuid

from sqlalchemy import ARRAY, ForeignKey, SmallInteger, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ProyectoPortafolio(Base):
    __tablename__ = "proyectos_portafolio"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id"))
    nombre: Mapped[str] = mapped_column(Text)
    categoria: Mapped[str] = mapped_column(Text)
    descripcion: Mapped[str] = mapped_column(Text)
    tech_stack: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    mes: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    anio: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    duracion: Mapped[str] = mapped_column(Text)
    url: Mapped[str] = mapped_column(Text)
    banner_class: Mapped[str] = mapped_column(Text)
    imagen_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    posicion: Mapped[int] = mapped_column(SmallInteger, default=0)
