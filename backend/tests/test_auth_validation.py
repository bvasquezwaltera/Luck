import pytest
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.main import app
from app.services import auth_service, auth_validation


@pytest.mark.parametrize(
    "password",
    ["Secret1!", "Abcdef1#", "S3cret.ok", "P@ssw0rd_largo_y_seguro", "10191195Barreto#"],
)
def test_valid_passwords(password):
    assert auth_validation.validate_password(password) is None


@pytest.mark.parametrize(
    "password, message",
    [
        ("", "obligatoria"),
        ("Sh0rt!", "al menos 8"),
        ("secret1!", "mayúscula"),
        ("Secretx!", "número"),
        ("Secret12", "carácter especial"),
        ("Aa1!" + "x" * 80, "72"),
    ],
)
def test_invalid_passwords(password, message):
    assert message in (auth_validation.validate_password(password) or "")


def test_email_and_name_rules():
    assert auth_validation.validate_email("persona@correo.com") is None
    assert auth_validation.validate_email("  persona@correo.com  ") is None
    for bad in ("", "   ", "sin-arroba", "a@b", "a b@c.com", "a@" + "x" * 260 + ".com"):
        assert auth_validation.validate_email(bad), bad

    assert auth_validation.validate_full_name("   ")
    assert "superar" in auth_validation.validate_full_name("x" * 121)


@pytest.mark.parametrize(
    "name", ["Ana", "Ana Pérez", "María-José Núñez", "Conan O'Brien", "Juan Pérez Jr.", "  Zoë Ñandú  ", "Ana María"]
)
def test_valid_names(name):
    assert auth_validation.validate_full_name(name) is None


@pytest.mark.parametrize(
    "name, message",
    [
        ("Al", "al menos 3"),
        ("Ana123", "números"),
        ("123", "números"),
        ("Ana #1", "números"),
        ("Ana@Perez", "solo puede tener letras"),
        ("-Ana", "solo puede tener letras"),
        ("Ana\tPérez", "solo puede tener letras"),
        ("???", "solo puede tener letras"),
    ],
)
def test_invalid_names(name, message):
    assert message in (auth_validation.validate_full_name(name) or "")


@pytest.fixture
def client(monkeypatch):
    # Si una petición inválida llegara a Supabase, el test fallaría: la validación debe cortarla antes.
    def fail():
        raise AssertionError("no debería llegar a Supabase")

    monkeypatch.setattr(auth_service, "create_auth_client", fail)
    app.dependency_overrides[get_db] = lambda: None
    yield TestClient(app)
    app.dependency_overrides.clear()


VALID = {"fullName": "Ana Pérez", "email": "ana@correo.com", "password": "Secret1!", "role": "client"}


@pytest.mark.parametrize(
    "changes, message",
    [
        ({"password": "abcdef"}, "al menos 8"),
        ({"password": "secret1!"}, "mayúscula"),
        ({"email": "no-es-correo"}, "correo"),
        ({"fullName": "   "}, "nombre"),
        ({"fullName": "Ana123"}, "números"),
        ({"fullName": "Al"}, "al menos 3"),
        ({"role": "admin"}, "Rol"),
    ],
)
def test_sign_up_rejects_invalid_input_before_supabase(client, changes, message):
    response = client.post("/api/auth/sign-up", json={**VALID, **changes})
    assert response.status_code == 200  # la API responde los errores en el cuerpo, como siempre
    body = response.json()
    assert message in body["error"]
    assert body["accessToken"] is None


def test_change_password_rejects_weak_password(client):
    from app.core.security import get_current_profile

    app.dependency_overrides[get_current_profile] = lambda: type("P", (), {"id": "00000000-0000-0000-0000-000000000000"})()
    response = client.post("/api/auth/change-password", json={"newPassword": "abc"})
    assert "al menos 8" in response.json()["error"]
