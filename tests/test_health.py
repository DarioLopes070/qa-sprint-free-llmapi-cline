import pytest

from app import create_app


class TestHealthEndpoint:
    """Testes para o endpoint /health."""

    def test_health_endpoint_returns_ok(self):
        """Teste: endpoint /health deve retornar HTTP 200 e JSON {status: 'ok'}."""
        app = create_app("Testing")
        client = app.test_client()

        with app.app_context():
            response = client.get("/health")

        assert response.status_code == 200
        data = response.get_json()
        assert data == {"status": "ok"}