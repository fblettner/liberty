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

class CreateRequest(BaseModel):
    host: str
    port: int
    database: str
    user: str
    password: str

CREATE_ERROR_MESSAGE = "Create database failed"
CREATE_RESPONSE_DESCRIPTION = "Create database successful"
CREATE_RESPONSE_EXAMPLE = {
    "items": [],
    "status": "success",
    "count": 0
}     

class DropRequest(BaseModel):
    database: str
    user: str

DROP_ERROR_MESSAGE = "Drop database failed"
DROP_RESPONSE_DESCRIPTION = "Drop Database successful"
DROP_RESPONSE_EXAMPLE = {
    "items": [],
    "status": "success",
    "count": 0
}   