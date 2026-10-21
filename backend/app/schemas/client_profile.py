from pydantic import BaseModel, Field


class ClientProfile(BaseModel):
    id: str
    name: str
    email: str
    initials: str
    country: str
    countryCode: str
    timezone: str


class ClientProfileUpdate(BaseModel):
    name: str = Field(min_length=1)
    country: str
    countryCode: str
    timezone: str
