from pydantic import BaseModel, Field, RootModel
from typing import Dict, List, Any, Union

class BadRequestResponse(BaseModel):
    status: str
    message: str  

class ErrorItem(BaseModel):
    error: Dict[str, Any]  # Represents the JSON object from the request body

class ErrorResponse(BaseModel):
    status: str  # The status (e.g., "error")
    message: List[ErrorItem]  # A list of Item objects


class SuccessResponse(BaseModel):
    status: str  # The status (e.g., "error")
    message: str # A list of Item objects

class FilterCondition(RootModel[Dict[str, Dict[str, Any]]]):
    pass

class EncryptRequest(BaseModel):
    password: str    

class ValidationErrorItem(BaseModel):
    loc: List[Union[str, int]]  # Location of the error (e.g., query, body, etc.)
    msg: str  # Human-readable error message
    type: str  # Type of validation error (e.g., value_error.missing, type_error.integer)

# Model for the full validation error response
class ValidationErrorResponse(BaseModel):
    detail: List[ValidationErrorItem]  # List of validation error items 

class DataRequest(RootModel[Dict[str, Any]]):
    """JSON object with key-value pairs."""
    pass

def response_200(schema: BaseModel, description: str, message: str):
    
    return {
        "model": schema,
        "description": description,
        "content": {
            "application/json": 
                {
                    "example": message
                }     
        },
    }

def response_422():
    return {
        "description": "Validation Error",
        "model": ValidationErrorResponse,
        "content": {
            "application/json": {        
                "example": {
                    "detail": [
                        {
                            "loc": ["query", "name"],
                            "msg": "field required",
                            "type": "value_error.missing"
                        },
                        {
                            "loc": ["query", "quantity"],
                            "msg": "value is not a valid integer",
                            "type": "type_error.integer"
                        }
                    ]
                }
            }
        },
    }

def response_500(schema: BaseModel, message: str):
    return {
        "model": schema,
        "description": "Internal server error",
        "content": {
            "application/json": 
                {
                    "example": {
                    "status": "failed",
                    "message": message}
                    }
        },
    }
    
def response_400(message: str):
    return {
        "model": BadRequestResponse,
        "description": "Bad Request",
        "content": {
            "application/json": 
                {
                    "example": {
                    "status": "failed",
                    "message": message}
                    }
        },
    }    