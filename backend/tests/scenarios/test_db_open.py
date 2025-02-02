import pytest
import allure

from tests.main import VALID_CREDENTIALS

# Define query parameters required for /auth/user
AUTH_QUERY_PARAMS = {"pool": "default", "mode": "framework", "type": "database"}
OPEN_QUERY_PARAMS = {"framework_pool": "default", "target_pool": "libnsx1"}

@allure.feature("Authentication")
@allure.story("Check opening database with Valid Token")
def test_open_valid_token(client):
    """
    Test `api/db/open` by first obtaining a valid JWT token from `/auth/token`.
    """
    with allure.step("Get a valid token from /auth/token"):
        response = client.post("/api/auth/token", json=VALID_CREDENTIALS, params=AUTH_QUERY_PARAMS)
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)
        assert response.status_code == 200, "Token request failed"
        token = response.json()["access_token"]


    with allure.step("Use token to open database connection from api/db/open"):
        response = client.get("api/db/open", params=OPEN_QUERY_PARAMS, headers={"Authorization": f"Bearer {token}"})
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["status"] == "success", "Status returned is wrong"
        assert response_json["message"] == "connected", "Message returned is wrong"
        


@allure.feature("Authentication")
@allure.story("Fail to open database if not authenticated")
def test_open_invalid_token(client):
    """
    Test `/api/db/open` with an invalid token.
    """
    with allure.step("Use an invalid token to open database"):
        response = client.get("/api/db/open", params=OPEN_QUERY_PARAMS)
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):
        assert response.status_code == 401  # Unauthorized

