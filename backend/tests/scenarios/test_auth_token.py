import pytest
import allure

from tests.main import VALID_CREDENTIALS

AUTH_QUERY_PARAMS = {"pool": "default", "mode": "framework", "type": "database"}
INVALID_CREDENTIALS = {"user": "testuser", "password": ""}

@allure.feature("Authentication")
@allure.story("Generate JWT Token")

def test_get_valid_token(client):
    """
    Test `/api/auth/token` with valid credentials`.
    """
    with allure.step("Get a valid token from /auth/token"):
        response = client.post("/api/auth/token", json=VALID_CREDENTIALS, params=AUTH_QUERY_PARAMS)
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):
        assert response.status_code == 200, "Token request failed"
        response_json = response.json()
        assert response_json["access_token"] != "", "Token is empty when it should contain a value"
        assert response_json["status"] == "success", "Status returned is wrong"
 
def test_get_invalid_token(client):
    """
    Test `/api/auth/token` with invalid credentials`.
    """
    with allure.step("Get a valid token from /auth/token"):
        response = client.post("/api/auth/token", json=INVALID_CREDENTIALS, params=AUTH_QUERY_PARAMS)
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):
        assert response.status_code == 200, "Token request failed"
        response_json = response.json()
        assert response_json["access_token"] == "", "Token contain a value when it should not"
        assert response_json["status"] == "error", "Status returned is wrong"