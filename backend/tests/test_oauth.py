import uuid
from types import SimpleNamespace
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.main import app
from app.models.perfil import Perfil
from app.services import auth_validation, oauth_service


class FakeDb:
    """Lo mínimo de una sesión: guarda perfiles en memoria."""

    def __init__(self, existing: Perfil | None = None):
        self.existing = existing
        self.added: list[Perfil] = []
        self.commits = 0

    def get(self, model, key):
        return self.existing if self.existing and self.existing.id == key else None

    def add(self, row):
        self.added.append(row)

    def commit(self):
        self.commits += 1


def user(**metadata):
    return SimpleNamespace(id=uuid.uuid4(), email="ana.perez@gmail.com", user_metadata=metadata)


def test_google_url_goes_to_supabase_and_back_to_the_frontend(monkeypatch):
    monkeypatch.setattr(settings, "supabase_url", "https://abc.supabase.co/")
    monkeypatch.setattr(settings, "frontend_url", "https://luck.vercel.app/")
    parsed = urlparse(oauth_service.google_authorize_url())
    assert f"{parsed.scheme}://{parsed.netloc}{parsed.path}" == "https://abc.supabase.co/auth/v1/authorize"
    query = parse_qs(parsed.query)
    assert query["provider"] == ["google"]
    assert query["redirect_to"] == ["https://luck.vercel.app/auth/callback"]


@pytest.mark.parametrize(
    "metadata, email, expected",
    [
        ({"full_name": "Ana Pérez"}, "x@y.com", "Ana Pérez"),
        ({"name": "Luis Núñez"}, "x@y.com", "Luis Núñez"),
        ({"full_name": "  Ana   Pérez  "}, "x@y.com", "Ana Pérez"),
        ({"full_name": "Ana Pérez 2024 ✨"}, "x@y.com", "Ana Pérez"),  # números y emojis fuera
        ({"full_name": "12"}, "maria.lopez@gmail.com", "Maria Lopez"),  # no alcanza: se usa el correo
        ({}, "carlos_ruiz99@gmail.com", "Carlos Ruiz"),
        (None, "ab@gmail.com", "Usuario"),  # ni el correo alcanza
        ({"full_name": 123}, None, "Usuario"),
    ],
)
def test_display_name(metadata, email, expected):
    name = oauth_service.display_name(metadata, email)
    assert name == expected
    assert auth_validation.validate_full_name(name) is None  # siempre cumple las reglas del registro


def test_existing_profile_just_signs_in_and_ignores_the_chosen_role():
    existing = Perfil(id=uuid.uuid4(), rol="client", nombre_completo="Ana")
    db = FakeDb(existing)
    result = oauth_service.complete_sign_in(db, SimpleNamespace(id=existing.id), "freelancer")
    assert result.role == "client" and not result.needsRole
    assert db.added == [] and db.commits == 0


def test_new_account_without_role_asks_for_it():
    db = FakeDb()
    result = oauth_service.complete_sign_in(db, user(), None)
    assert result.needsRole and result.role is None
    assert db.added == []


def test_new_account_with_role_creates_the_profile_with_defaults():
    db = FakeDb()
    google_user = user(full_name="Ana Pérez")
    result = oauth_service.complete_sign_in(db, google_user, "freelancer")
    assert result.role == "freelancer" and not result.needsRole and not result.error
    (perfil,) = db.added
    assert (perfil.id, perfil.rol, perfil.nombre_completo) == (google_user.id, "freelancer", "Ana Pérez")
    assert (perfil.pais_codigo, perfil.pais, perfil.zona_horaria) == ("PE", "Perú", "GMT-5 (Lima)")
    assert db.commits == 1


def test_invalid_role_is_rejected():
    db = FakeDb()
    result = oauth_service.complete_sign_in(db, user(), "admin")
    assert result.error and db.added == []


@pytest.fixture
def client():
    google_user = user(full_name="Ana Pérez")
    db = FakeDb()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: google_user
    yield TestClient(app), db
    app.dependency_overrides.clear()


def test_endpoints(client):
    http, db = client
    assert http.get("/api/auth/google-url").json()["url"].startswith(settings.supabase_url.rstrip("/"))
    assert http.post("/api/auth/oauth/complete", json={}).json()["needsRole"] is True
    response = http.post("/api/auth/oauth/complete", json={"role": "client"}).json()
    assert response["role"] == "client" and len(db.added) == 1


def test_oauth_complete_requires_a_session():
    app.dependency_overrides.clear()
    assert TestClient(app).post("/api/auth/oauth/complete", json={}).status_code == 401
