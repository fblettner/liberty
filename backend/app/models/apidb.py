

from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime

# Define metadata schema
class MetaDataItem(BaseModel):
    name: str
    type: str


# Define a single row schema
class RowItem(BaseModel):
    ROW_ID: int
    CURRENT_DATE: datetime


# Define the full response schema
class CheckDBResponse(BaseModel):
    status: str
    pool: str
    rows: List[RowItem]
    rowCount: int
    meta_data: List[MetaDataItem]

# Define the full response schema
class CheckDBErrorResponse(BaseModel):
    status: str
    message: str   

CHECKDB_ERROR_MESSAGE = "Query execution failed: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError)"
CHECKDB_RESPONSE_DESCRIPTION = "Database connection is successful"
CHECKDB_RESPONSE_EXAMPLE = {
    "status": "success",
    "rows": [
        {
            "ROW_ID": 1,
            "CURRENT_DATE": "2025-01-27T08:14:13.809494+00:00"
        }
    ],
    "rowCount": 1,
    "meta_data": [
        {"name": "ROW_ID", "type": "int"},
        {"name": "CURRENT_DATE", "type": "datetime"}
    ]
} 

GET_APIDB_ERROR_MESSAGE = "Query execution failed: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError)"
GET_APIDB_RESPONSE_DESCRIPTION = "Data retrieved successfully"
GET_APIDB_RESPONSE_EXAMPLE = {
    "items": [
        {"ROW_ID": 1, "DD_ID": "ACT_AUDIT_DATE", "DD_LABEL": "Date (Audit)"},
        {"ROW_ID": 2, "DD_ID": "ACT_ID", "DD_LABEL": "Action ID"}
    ],
    "status": "success",
    "metadata": [
        {"name": "ROW_ID", "type": "int"},
        {"name": "DD_ID", "type": "str"},
        {"name": "DD_LABEL", "type": "str"}
    ],
    "hasMore": True,
    "limit": 100,
    "offset": 0,
    "count": 2
}
GET_APIDB_ERROR_EXAMPLE = {
    "items": [{"message": "Error: Example error message"}],
    "status": "error",
    "hasMore": False,
    "limit": 100,
    "offset": 0,
    "count": 0,
    "query": "SELECT * FROM table_name"
}

class MetadataItem(BaseModel):
    name: str
    type: str

class GetErrorResponse(BaseModel):
    items: List[dict]
    status: str
    hasMore: bool
    limit: int
    offset: int
    count: int
    query: Optional[str]


class GetSuccessResponse(BaseModel):
    items: List[dict]
    status: str
    metadata: List[MetadataItem]
    hasMore: bool
    limit: int
    offset: int
    count: int


class PostErrorResponse(BaseModel):
    items: List[dict]
    status: str
    count: int


class PostErrorItem(BaseModel):
    message: str  # The error message
    line: Dict[str, Any]  # Represents the JSON object from the request body

class PostSuccessResponse(BaseModel):
    items: List[PostErrorItem]  # A list of Item objects
    status: str  # The status (e.g., "error")
    count: int  # The count (e.g., 0)
    

POST_APIDB_ERROR_EXAMPLE = {
    "items": [
        {
            "message": "Error: Query execution failed: Query execution failed: INSERT INTO...",
            "line": {
                "field1": "<string>",
                "field2": "<string>"
            }
        }
    ],
    "status": "error",
    "count": 0
}

POST_APIDB_RESPONSE_DESCRIPTION = "Data inserted/updated successfully"
POST_APIDB_RESPONSE_EXAMPLE = {
    "items": [],
    "status": "success",
    "count": 0
}


# Define the full response schema
class EncryptResponse(BaseModel):
    encrypted: str

ENCRYPT_ERROR_MESSAGE = "Failed to encrypt data: (sqlalchemy.dialects.postgresql.asyncpg.ProgrammingError)"
ENCRYPT_RESPONSE_DESCRIPTION = "Encryption successful"
ENCRYPT_RESPONSE_EXAMPLE = {
    "encrypted": "ENC:wNMyALbXf....."
} 

# Define the full response schema
class VersionResponse(BaseModel):
    version: str
VERSION_ERROR_MESSAGE = "Failed to get the framework version"
VERSION_RESPONSE_DESCRIPTION = "Version retrieved successfully"
VERSION_RESPONSE_EXAMPLE = {
    "version": "6.0.59"
} 