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
    # Entró con Google, es nueva y falta elegir el rol para crear su perfil.
    needsRole: bool = False


class ProfileOut(BaseModel):
    id: str
    rol: str
    nombre_completo: str
    onboarding: str


class ChangePasswordRequest(BaseModel):
    newPassword: str


class ActionResult(BaseModel):
    error: str | None = None


class OAuthCompleteRequest(BaseModel):
    role: str | None = None


class GoogleUrl(BaseModel):
    url: str


class ForgotPasswordRequest(BaseModel):
    email: str


class RefreshRequest(BaseModel):
    refreshToken: str


class OnboardingRequest(BaseModel):
    state: str
