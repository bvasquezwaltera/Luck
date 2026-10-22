import uuid
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.core.database import get_db
from app.core.security import get_current_profile
from app.main import app
from app.services import auth_service


class FakeDb:
    def __init__(self):
        self.commits = 0

    def commit(self):
        self.commits += 1


def perfil(state="pendiente"):
    return SimpleNamespace(id=uuid.uuid4(), rol="freelancer", nombre_completo="Ana Pérez", onboarding=state)


def test_advances_one_step_at_a_time_or_jumps_forward():
    db, p = FakeDb(), perfil()
    assert auth_service.advance_onboarding(db, p, "bienvenida_vista").error is None
    assert p.onboarding == "bienvenida_vista"
    assert auth_service.advance_onboarding(db, p, "completado").error is None
    assert p.onboarding == "completado"

    # también se puede saltar directo (el cliente cierra su bienvenida y termina)
    q = perfil()
    auth_service.advance_onboarding(db, q, "completado")
    assert q.onboarding == "completado"


def test_never_goes_back_nor_repeats():
    db, p = FakeDb(), perfil("completado")
    auth_service.advance_onboarding(db, p, "pendiente")
    auth_service.advance_onboarding(db, p, "bienvenida_vista")
    assert p.onboarding == "completado"
    assert db.commits == 0  # no hubo nada que guardar


def test_rejects_unknown_states():
    db, p = FakeDb(), perfil()
    assert auth_service.advance_onboarding(db, p, "otro").error
    assert p.onboarding == "pendiente" and db.commits == 0


@pytest.fixture
def client():
    p, db = perfil(), FakeDb()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_profile] = lambda: p
    yield TestClient(app), p
    app.dependency_overrides.clear()


def test_endpoints(client):
    http, p = client
    assert http.get("/api/auth/me").json()["onboarding"] == "pendiente"
    assert http.post("/api/auth/onboarding", json={"state": "bienvenida_vista"}).json() == {"error": None}
    assert http.get("/api/auth/me").json()["onboarding"] == "bienvenida_vista"
    assert http.post("/api/auth/onboarding", json={"state": "x"}).json()["error"]
