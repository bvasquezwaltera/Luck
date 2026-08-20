from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resena import Resena
from app.schemas.review import ReviewEntry
from app.services.utils import to_relative_date


def get_reviews(db: Session, freelancer_id: str) -> list[ReviewEntry]:
    rows = db.scalars(
        select(Resena).where(Resena.freelancer_id == freelancer_id).order_by(Resena.creado_en.desc())
    ).all()

    return [
        ReviewEntry(
            id=str(row.id),
            reviewerName=row.nombre_autor,
            reviewerInitials=row.iniciales_autor,
            country=row.pais or "",
            countryCode=row.pais_codigo or "",
            rating=float(row.calificacion),
            title=row.titulo,
            comment=row.comentario,
            tags=row.etiquetas or [],
            service=row.servicio,
            dateValue=row.creado_en.isoformat(),
            relativeDate=to_relative_date(row.creado_en),
        )
        for row in rows
    ]
