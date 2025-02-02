import pytest
import allure

from tests.main import VALID_CREDENTIALS

# Define query parameters required for /auth/user
AUTH_QUERY_PARAMS = {"pool": "default", "mode": "framework", "type": "database"}
CHECK_QUERY_PARAMS = {"framework_pool": "default", "target_pool": "default"}

@allure.feature("Authentication")
@allure.story("Check database connection with Valid Token")
def test_check_valid_token(client):
    """
    Test `api/db/check` by first obtaining a valid JWT token from `/auth/token`.
    """
    with allure.step("Get a valid token from /auth/token"):
        response = client.post("/api/auth/token", json=VALID_CREDENTIALS, params=AUTH_QUERY_PARAMS)
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)
        assert response.status_code == 200, "Token request failed"
        token = response.json()["access_token"]


    with allure.step("Use token to check database connection from api/db/check"):
        response = client.get("api/db/check", params=CHECK_QUERY_PARAMS, headers={"Authorization": f"Bearer {token}"})
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):
        assert response.status_code == 200
        response_json = response.json()

        assert "rows" in response_json, "Response does not contain 'rows'"
        assert len(response_json["rows"]) > 0, "Response 'rows' list is empty"
        assert "CURRENT_DATE" in response_json["rows"][0], "Response does not contain 'CURRENT_DATE'" 
        assert response_json["status"] == "success", "Status returned is wrong"



@allure.feature("Authentication")
@allure.story("Fail to check database if not authenticated")
def test_check_invalid_token(client):
    """
    Test `/api/db/check` with an invalid token.
    """
    with allure.step("Use an invalid token to check database"):
        response = client.get("/api/db/check", params=CHECK_QUERY_PARAMS)
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):
        assert response.status_code == 401  # Unauthorized

