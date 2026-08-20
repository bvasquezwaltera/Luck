from pydantic import BaseModel


class PortfolioProject(BaseModel):
    id: str
    name: str
    category: str
    description: str
    techStack: list[str]
    date: str
    dateValue: str
    duration: str
    url: str
    bannerClassName: str
    imageUrl: str | None = None
