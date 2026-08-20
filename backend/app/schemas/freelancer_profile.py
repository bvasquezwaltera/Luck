from pydantic import BaseModel


class FreelancerLanguage(BaseModel):
    name: str
    level: str


class FreelancerBadges(BaseModel):
    successRate: float
    topRated: bool
    avgResponseTime: str


class FreelancerStats(BaseModel):
    completedProjects: int
    hoursWorked: int
    repeatClients: int
    memberSince: str
    lastDelivery: str


class ExperienceEntry(BaseModel):
    period: str
    role: str
    company: str
    description: str


class EducationEntry(BaseModel):
    period: str
    degree: str
    institution: str


class WorkMethodCategory(BaseModel):
    label: str
    items: list[str]


class FreelancerProfile(BaseModel):
    id: str
    name: str
    email: str
    initials: str
    rating: float
    reviewCount: int
    specialty: str
    category: str
    country: str
    countryCode: str
    timezone: str
    online: bool
    languages: list[FreelancerLanguage]
    skills: list[str]
    badges: FreelancerBadges
    stats: FreelancerStats
    bio: str
    differentiators: list[str]
    experience: list[ExperienceEntry]
    education: list[EducationEntry]
    tools: list[str]
    availabilityStatus: str
    workMethods: list[WorkMethodCategory]
