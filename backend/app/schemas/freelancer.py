from pydantic import BaseModel


class Freelancer(BaseModel):
    id: str
    name: str
    initials: str
    rating: float
    reviewCount: int
    specialty: str
    category: str
    country: str
    countryCode: str
    skills: list[str]
    projectCount: int
    monthlyPriceFrom: float
