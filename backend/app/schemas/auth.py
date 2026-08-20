from pydantic import BaseModel


class SignUpRequest(BaseModel):
    fullName: str
    email: str
    password: str
    role: str


class SignInRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    error: str | None = None
    role: str | None = None
    accessToken: str | None = None
    refreshToken: str | None = None


class ProfileOut(BaseModel):
    id: str
    rol: str
    nombre_completo: str
