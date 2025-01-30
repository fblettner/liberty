import json
import allure

THEME_QUERY_PARAMS = {
    "pool": "default",
    "q": json.dumps({"THM_NAME": {"=": "liberty"}})  # Converts the dictionary into a JSON string
}

@allure.feature("Framework")
@allure.story("Get Themes Settings")

def test_themes(client):
    """
    Test `/api/fmw/themes``.
    """
    with allure.step("Get themes settings from /api/fmw/themes"):
        response = client.get("/api/fmw/themes", params=THEME_QUERY_PARAMS)
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):
        assert response.status_code == 200, "Themes request failed"
        response_json = response.json()
        assert "items" in response_json, "Response does not contain 'items'"
        assert len(response_json["items"]) > 0, "Response 'items' list is empty"
        assert response_json["items"][0]["THM_NAME"] == "liberty", "Liberty theme is not found"
        assert response_json["status"] == "success", "Status returned is wrong"