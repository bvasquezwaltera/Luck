from pydantic import BaseModel


class ReviewEntry(BaseModel):
    id: str
    reviewerName: str
    reviewerInitials: str
    country: str
    countryCode: str
    rating: float
    title: str
    comment: str
    tags: list[str]
    service: str
    dateValue: str
    relativeDate: str
