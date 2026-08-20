from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_profile
from app.models.perfil import Perfil
from app.schemas.portfolio_project import PortfolioProject
from app.services import portfolio_projects_service

router = APIRouter(prefix="/api/portfolio-projects", tags=["portfolio-projects"])


@router.get("/{freelancer_id}")
def get_projects(freelancer_id: str, db: Session = Depends(get_db)):
    return {"projects": portfolio_projects_service.get_portfolio_projects(db, freelancer_id)}


@router.post("/{freelancer_id}")
def add_project(
    freelancer_id: str,
    payload: PortfolioProject,
    db: Session = Depends(get_db),
    current: Perfil = Depends(get_current_profile),
):
    if str(current.id) != freelancer_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No puedes editar el portafolio de otro usuario.")
    return portfolio_projects_service.add_portfolio_project(db, freelancer_id, payload)


@router.delete("/{freelancer_id}/{project_id}")
def delete_project(
    freelancer_id: str,
    project_id: str,
    db: Session = Depends(get_db),
    current: Perfil = Depends(get_current_profile),
):
    if str(current.id) != freelancer_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No puedes editar el portafolio de otro usuario.")
    return portfolio_projects_service.delete_portfolio_project(db, freelancer_id, project_id)
