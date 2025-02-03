import os

VALID_CREDENTIALS = {"user": "admin", "password": "ENC:i9w7bfJU0T7D7rBzgQkgBvjnFdV/gfhrx1rxG4DInCRoTPfSTPJQ8JeHI+pd1SZXud2zSTeDUAY2O2BgROE4Qp4OgnZAlTQBES5V2cP1tLQ3W8me37hy/Lbg1hJuDRckpOYGdE8z"}

def run_tests():
    """
    Run all tests and generate Allure reports.
    """
    os.system("pytest --alluredir=tests/results")
    os.system("allure serve --host localhost --port 8001 tests/results")

if __name__ == "__main__":
    run_tests()