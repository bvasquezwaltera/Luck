from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.proyecto_portafolio import ProyectoPortafolio
from app.schemas.portfolio_project import PortfolioProject

MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]


def get_portfolio_projects(db: Session, freelancer_id: str) -> list[PortfolioProject]:
    rows = db.scalars(
        select(ProyectoPortafolio)
        .where(ProyectoPortafolio.freelancer_id == freelancer_id)
        .order_by(ProyectoPortafolio.posicion)
    ).all()

    result = []
    for row in rows:
        date = f"{MONTH_LABELS[row.mes - 1]} {row.anio}" if row.mes and row.anio else ""
        date_value = f"{row.anio}-{row.mes:02d}" if row.mes and row.anio else ""
        result.append(
            PortfolioProject(
                id=str(row.id),
                name=row.nombre,
                category=row.categoria,
                description=row.descripcion,
                techStack=row.tech_stack or [],
                date=date,
                dateValue=date_value,
                duration=row.duracion,
                url=row.url,
                bannerClassName=row.banner_class,
                imageUrl=row.imagen_url,
            )
        )
    return result


def add_portfolio_project(
    db: Session, freelancer_id: str, project: PortfolioProject
) -> dict[str, str]:
    anio, mes = (None, None)
    if project.dateValue:
        anio_str, mes_str = project.dateValue.split("-")
        anio, mes = int(anio_str), int(mes_str)

    db.add(
        ProyectoPortafolio(
            freelancer_id=freelancer_id,
            nombre=project.name,
            categoria=project.category,
            descripcion=project.description,
            tech_stack=project.techStack,
            mes=mes,
            anio=anio,
            duracion=project.duration,
            url=project.url,
            banner_class=project.bannerClassName,
            imagen_url=project.imageUrl,
        )
    )
    db.commit()
    return {}


def delete_portfolio_project(
    db: Session, freelancer_id: str, project_id: str
) -> dict[str, str]:
    db.query(ProyectoPortafolio).filter(
        ProyectoPortafolio.id == project_id, ProyectoPortafolio.freelancer_id == freelancer_id
    ).delete()
    db.commit()
    return {}
