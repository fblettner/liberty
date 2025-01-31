import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

@pytest.fixture(scope="module")
def client():
    """Create a test client for FastAPI app"""
    with TestClient(app) as c:
        yield c