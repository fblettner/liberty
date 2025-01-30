import allure


TEXT_TO_ENCRYPT = {"plain_text": "admin"}

@allure.feature("Encryption")
@allure.story("Encrypt a text")

def test_encrypt_text(client):
    """
    Test `/api/fmw/encrypt`.
    """
    with allure.step("Get a encrypted text"):
        response = client.post("/api/fmw/encrypt", json=TEXT_TO_ENCRYPT)
        allure.attach(response.text, name="Results", attachment_type=allure.attachment_type.JSON)

    with allure.step("Validate response"):     
        assert response.status_code == 200, "Encrypt request failed"
        response_json = response.json()
        assert response_json["encrypted"] != "", "Text is empty when it should contain a value"
