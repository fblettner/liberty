import allure

@allure.feature("Framework")
@allure.story("Get Modules Settings")

def test_modules(client):
    """
    Test `/api/fmw/modules``.
    """
    with allure.step("Get modules settings from /api/fmw/modules"):
        response = client.get("/api/fmw/modules")
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):
        assert response.status_code == 200, "Modules request failed"
        response_json = response.json()
        assert "items" in response_json, "Response does not contain 'items'"
        assert response_json["status"] == "success", "Status returned is wrong"
        assert response_json["count"] == 6, "Wrong number of modules returned"