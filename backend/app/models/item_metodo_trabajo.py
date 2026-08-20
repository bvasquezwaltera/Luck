import uuid

from sqlalchemy import ForeignKey, SmallInteger, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ItemMetodoTrabajo(Base):
    __tablename__ = "items_metodos_trabajo"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    categoria_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categorias_metodos_trabajo.id")
    )
    valor: Mapped[str] = mapped_column(Text)
    posicion: Mapped[int] = mapped_column(SmallInteger)
