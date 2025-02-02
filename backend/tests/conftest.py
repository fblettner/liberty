import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


from app.main import app

@pytest.fixture(scope="module")
def client():
    """Create a test client for FastAPI app"""
    with TestClient(app) as c:
        yield c