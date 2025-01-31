from typing import List
from pydantic import BaseModel

# Schema for individual row items
class ApplicationRow(BaseModel):
    ROW_ID: int
    APPS_ID: int
    APPS_NAME: str
    APPS_DESCRIPTION: str
    APPS_POOL: str
    APPS_OFFSET: int
    APPS_LIMIT: int
    APPS_VERSION: int | None
    APPS_DASHBOARD: int | None
    APPS_THEME: str | None

# Schema for meta data items
class MetaData(BaseModel):
    name: str
    type: str

# Main schema
class ApplicationsResponse(BaseModel):
    status: str
    pool: str
    items: List[ApplicationRow]
    rowCount: int
    meta_data: List[MetaData]

APPLICATIONS_ERROR_MESSAGE = "Query execution failed: (sqlalchemy.exc.InvalidRequestError) A value is required for bind parameter"
APPLICATIONS_RESPONSE_DESCRIPTION = "Get Applications Available"
APPLICATIONS_RESPONSE_EXAMPLE = {
    'status': 'success',
    'pool': 'default',
    'items': [
        {'ROW_ID': 1, 'APPS_ID': 1, 'APPS_NAME': 'LIBERTY', 'APPS_DESCRIPTION': 'Framework Liberty', 'APPS_POOL': 'default', 'APPS_OFFSET': 5000, 'APPS_LIMIT': 10000, 'APPS_VERSION': 500, 'APPS_DASHBOARD': 1, 'APPS_THEME': 'liberty'},
        {'ROW_ID': 2, 'APPS_ID': 2, 'APPS_NAME': 'NOMASX1', 'APPS_DESCRIPTION': 'Rights, licenses and SOD', 'APPS_POOL': 'default', 'APPS_OFFSET': 5000, 'APPS_LIMIT': 10000, 'APPS_VERSION': 500, 'APPS_DASHBOARD': 1, 'APPS_THEME': 'modernBluePurple'},

    ],
    'rowCount': 2,
    'meta_data': [
        {'name': 'ROW_ID', 'type': 'int'},
        {'name': 'MODULE_ID', 'type': 'str'},
        {'name': 'MODULE_DESCRIPTION', 'type': 'str'},
        {'name': 'MODULE_ENABLED', 'type': 'str'},
        {'name': 'MODULE_PARAMS', 'type': 'UNKNOWN'},
    ]
}