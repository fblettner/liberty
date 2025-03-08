from enum import Enum
from typing import List
from pydantic import BaseModel

class LoginRequest(BaseModel):
    user: str
    password: str | None


TOKEN_ERROR_MESSAGE = "Authentication failed"
TOKEN_RESPONSE_DESCRIPTION = "Authentication successful, JWT token generated"
TOKEN_RESPONSE_EXAMPLE = {
    "access_token": "....",
    "token_type": "bearer",
    "status": "success",
    "message": "Authentication successful"
}     

# Define the full response schema
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    status: str
    message: str

class UserItem(BaseModel):
    ROW_ID: int
    USR_ID: str
    USR_PASSWORD: str
    USR_NAME: str
    USR_EMAIL: str
    USR_STATUS: str
    USR_ADMIN: str
    USR_LANGUAGE: str
    USR_MODE: str
    USR_READONLY: str
    USR_DASHBOARD: int | None
    USR_THEME: str | None

class UserResponse(BaseModel):
    items: List[UserItem]
    status: str


USER_ERROR_MESSAGE = "Query execution failed: (sqlalchemy.exc.InvalidRequestError) A value is required for bind parameter"
USER_RESPONSE_DESCRIPTION = "Get user information"
USER_RESPONSE_EXAMPLE = {
    "items": [
        {
            "ROW_ID": 1,
            "USR_ID": "demo",
            "USR_PASSWORD": "ENC:...",
            "USR_NAME": "Demo User",
            "USR_EMAIL": "demo@liberty.fr",
            "USR_STATUS": "Y",
            "USR_ADMIN": "N",
            "USR_LANGUAGE": "fr",
            "USR_MODE": "light",
            "USR_READONLY": "Y",
            "USR_DASHBOARD": 1,
            "USR_THEME": "liberty"
        }
    ],
    "status": "success"
}