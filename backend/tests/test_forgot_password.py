import pytest

from app.core.config import settings
from app.services import auth_service


class FakeAuth:
    """Cliente de Supabase de mentira: guarda lo que se le pide y puede fallar a propósito."""

    def __init__(self, fail_with: Exception | None = None):
        self.fail_with = fail_with
        self.calls: list[tuple[str, dict]] = []
        self.auth = self

    def reset_password_for_email(self, email, options=None):
        self.calls.append((email, options or {}))
        if self.fail_with:
            raise self.fail_with


@pytest.fixture
def fake(monkeypatch):
    def install(fail_with=None):
        client = FakeAuth(fail_with)
        monkeypatch.setattr(auth_service, "create_auth_client", lambda: client)
        return client

    monkeypatch.setattr(settings, "frontend_url", "https://luck.vercel.app/")
    return install


def test_sends_the_email_with_a_link_back_to_the_reset_page(fake):
    client = fake()
    result = auth_service.forgot_password("  ana@correo.com ")
    assert result.error is None
    assert client.calls == [("ana@correo.com", {"redirect_to": "https://luck.vercel.app/restablecer-contrasena"})]


@pytest.mark.parametrize("email", ["", "   ", "sin-arroba", "a@b"])
def test_invalid_email_is_rejected_without_calling_supabase(fake, email):
    client = fake()
    assert auth_service.forgot_password(email).error
    assert client.calls == []


def test_answers_the_same_when_supabase_fails_so_it_does_not_reveal_accounts(fake):
    fake(RuntimeError("User not found"))
    assert auth_service.forgot_password("nadie@correo.com").error is None


def test_tells_the_person_when_the_email_limit_is_reached(fake):
    fake(RuntimeError("email rate limit exceeded"))
    assert "demasiados correos" in auth_service.forgot_password("ana@correo.com").error


def test_endpoint(fake):
    from fastapi.testclient import TestClient

    from app.main import app

    fake()
    http = TestClient(app)
    assert http.post("/api/auth/forgot-password", json={"email": "ana@correo.com"}).json() == {"error": None}
    assert "correo" in http.post("/api/auth/forgot-password", json={"email": "mal"}).json()["error"]
