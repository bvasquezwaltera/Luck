import uuid

from sqlalchemy import ForeignKey, SmallInteger, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class IdiomaFreelancer(Base):
    __tablename__ = "idiomas_freelancer"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    freelancer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("perfiles.id"))
    nombre: Mapped[str] = mapped_column(Text)
    nivel: Mapped[str] = mapped_column(Text)
    posicion: Mapped[int] = mapped_column(SmallInteger)
