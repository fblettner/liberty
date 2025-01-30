import pytest
import allure

from tests.main import VALID_CREDENTIALS

# Define query parameters required for /auth/user
AUTH_QUERY_PARAMS = {"pool": "default", "mode": "framework", "type": "database"}
USER_QUERY_PARAMS = {"pool": "default", "mode": "framework", "user": "admin"}

@allure.feature("Authentication")
@allure.story("Retrieve User Info with Valid Token")
def test_user_valid_token(client):
    """
    Test `/api/auth/user` by first obtaining a valid JWT token from `/auth/token`.
    """
    with allure.step("Get a valid token from /auth/token"):
        response = client.post("/api/auth/token", json=VALID_CREDENTIALS, params=AUTH_QUERY_PARAMS)
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)
        assert response.status_code == 200, "Token request failed"
        token = response.json()["access_token"]


    with allure.step("Use token to retrieve user info from /api/auth/user"):
        response = client.get("/api/auth/user", params=USER_QUERY_PARAMS, headers={"Authorization": f"Bearer {token}"})
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):
        assert response.status_code == 200
        response_json = response.json()

        assert "items" in response_json, "Response does not contain 'items'"
        assert len(response_json["items"]) > 0, "Response 'items' list is empty"
        assert response_json["items"][0]["USR_ID"] == "admin", "USR_ID is not 'admin'" 


@allure.feature("Authentication")
@allure.story("Fail to Retrieve User Info if not authenticated")
def test_user_invalid_token(client):
    """
    Test `/api/auth/user` with an invalid token.
    """
    with allure.step("Use an invalid token to retrieve user info"):
        response = client.get("/api/auth/user", params=USER_QUERY_PARAMS)

    with allure.step("Validate response"):
        assert response.status_code == 401  # Unauthorized
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)
