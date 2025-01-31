from pydantic import BaseModel


class SetupRequest(BaseModel):
    host: str
    port: int
    database: str
    user: str
    password: str

SETUP_ERROR_MESSAGE = "Setup failed"
SETUP_RESPONSE_DESCRIPTION = "Installation successful"
SETUP_RESPONSE_EXAMPLE = {
    "items": [],
    "status": "success",
    "count": 0
}     