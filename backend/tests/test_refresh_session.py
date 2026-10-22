from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import auth_service


class FakeAuth:
    def __init__(self, session=None, fail=False):
        self.session, self.fail, self.calls = session, fail, []
        self.auth = self

    def refresh_session(self, refresh_token):
        self.calls.append(refresh_token)
        if self.fail:
            raise RuntimeError("Invalid Refresh Token: Already Used")
        return SimpleNamespace(session=self.session)


@pytest.fixture
def install(monkeypatch):
    def _install(**kwargs):
        client = FakeAuth(**kwargs)
        monkeypatch.setattr(auth_service, "create_auth_client", lambda: client)
        return client

    return _install


def test_returns_the_new_tokens(install):
    client = install(session=SimpleNamespace(access_token="nuevo-acceso", refresh_token="nuevo-renovacion"))
    result = auth_service.refresh_session("  viejo  ")
    assert (result.accessToken, result.refreshToken, result.error) == ("nuevo-acceso", "nuevo-renovacion", None)
    assert client.calls == ["viejo"]


def test_an_invalid_refresh_token_means_expired_session(install):
    install(fail=True)
    result = auth_service.refresh_session("ya-usado")
    assert result.error == "Sesión vencida." and result.accessToken is None


def test_no_session_returned_means_expired_session(install):
    install(session=None)
    assert auth_service.refresh_session("x").error == "Sesión vencida."


def test_empty_token_is_rejected_without_calling_supabase(install):
    client = install(session=SimpleNamespace(access_token="a", refresh_token="b"))
    assert auth_service.refresh_session("   ").error == "Sesión vencida."
    assert client.calls == []


def test_endpoint(install):
    install(session=SimpleNamespace(access_token="a", refresh_token="b"))
    http = TestClient(app)
    assert http.post("/api/auth/refresh", json={"refreshToken": "r"}).json()["accessToken"] == "a"
    assert http.post("/api/auth/refresh", json={}).status_code == 422
