from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import reviews_service

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


@router.get("/{freelancer_id}")
def get_reviews(freelancer_id: str, db: Session = Depends(get_db)):
    return {"reviews": reviews_service.get_reviews(db, freelancer_id)}
