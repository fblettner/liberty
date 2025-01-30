import allure

@allure.feature("Framework")
@allure.story("Get list of applications")

def test_get_modules(client):
    """
    Test `/api/fmw/applications``.
    """
    with allure.step("Get list of applications from /api/fmw/applications"):
        response = client.get("/api/fmw/applications")
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):
        assert response.status_code == 200, "Applications request failed"
        response_json = response.json()
        assert "items" in response_json, "Response does not contain 'items'"
        assert len(response_json["items"]) > 0, "Response 'items' list is empty"
        assert response_json["items"][0]["APPS_NAME"] == "LIBERTY", "Liberty application is not found"
        assert response_json["status"] == "success", "Status returned is wrong"
 
