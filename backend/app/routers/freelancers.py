from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import freelancers_service

router = APIRouter(prefix="/api/freelancers", tags=["freelancers"])


@router.get("")
def list_freelancers(db: Session = Depends(get_db)):
    return {"freelancers": freelancers_service.get_freelancer_list(db)}
