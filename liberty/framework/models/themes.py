from typing import List
from pydantic import BaseModel

# Schema for individual row items
class ThemeRow(BaseModel):
    ROW_ID: int
    THM_NAME: str
    TCL_KEY: str
    TCL_LIGHT: str
    TCL_DARK: str


# Schema for meta data items
class MetaData(BaseModel):
    name: str
    type: str

# Main schema
class ThemesResponse(BaseModel):
    status: str
    pool: str
    items: List[ThemeRow]
    rowCount: int
    meta_data: List[MetaData]

THEMES_ERROR_MESSAGE = "Query execution failed: (sqlalchemy.exc.InvalidRequestError) A value is required for bind parameter"
THEMES_RESPONSE_DESCRIPTION = "Get Themes Details"
THEMES_RESPONSE_EXAMPLE = {
    'status': 'success',
    'pool': 'default',
    'items': [
        {'ROW_ID': 1, 'THM_NAME': 'modernBluePurple', 'TCL_KEY': 'primary', 'TCL_LIGHT': '#3f51b5', 'TCL_DARK': '#673ab7'},
        {'ROW_ID': 2, 'THM_NAME': 'luxuryDarkGold', 'TCL_KEY': 'secondary', 'TCL_LIGHT': '#607d8b', 'TCL_DARK': 'rgb(206, 203, 203)'},

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