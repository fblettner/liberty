from typing import List, Optional, Union
from pydantic import BaseModel

# Schema for individual row items
class ModuleRow(BaseModel):
    ROW_ID: int
    MODULE_ID: str
    MODULE_DESCRIPTION: str
    MODULE_ENABLED: str
    MODULE_PARAMS: Optional[Union[str, dict]] = None

# Schema for meta data items
class MetaData(BaseModel):
    name: str
    type: str

# Main schema
class ModulesResponse(BaseModel):
    status: str
    pool: str
    items: List[ModuleRow]
    rowCount: int
    meta_data: List[MetaData]

MODULES_ERROR_MESSAGE = "Query execution failed: (sqlalchemy.exc.InvalidRequestError) A value is required for bind parameter"
MODULES_RESPONSE_DESCRIPTION = "Get Modules Details"
MODULES_RESPONSE_EXAMPLE = {
    'status': 'success',
    'pool': 'default',
    'items': [
        {'ROW_ID': 1, 'MODULE_ID': 'menus', 'MODULE_DESCRIPTION': 'Enable Drawer Menus', 'MODULE_ENABLED': 'Y', 'MODULE_PARAMS': None},
        {'ROW_ID': 2, 'MODULE_ID': 'grafana', 'MODULE_DESCRIPTION': 'Enable Grafana Dashboard', 'MODULE_ENABLED': 'N', 'MODULE_PARAMS': None},
        {'ROW_ID': 3, 'MODULE_ID': 'dev', 'MODULE_DESCRIPTION': 'Enable Development Mode', 'MODULE_ENABLED': 'Y', 'MODULE_PARAMS': None},
        {'ROW_ID': 4, 'MODULE_ID': 'sentry', 'MODULE_DESCRIPTION': 'Enable Sentry', 'MODULE_ENABLED': 'N', 'MODULE_PARAMS': {
            'url': 'https://sentry.io',
            'replay': 'false',
            'clientid': 'nomana',
            'platform': 'dev'
        }},
        {'ROW_ID': 5, 'MODULE_ID': 'debug', 'MODULE_DESCRIPTION': 'Enable Debug', 'MODULE_ENABLED': 'N', 'MODULE_PARAMS': None},
        {'ROW_ID': 6, 'MODULE_ID': 'login', 'MODULE_DESCRIPTION': 'Enable Embedded Login', 'MODULE_ENABLED': 'Y', 'MODULE_PARAMS': None},
    ],
    'rowCount': 6,
    'meta_data': [
        {'name': 'ROW_ID', 'type': 'int'},
        {'name': 'MODULE_ID', 'type': 'str'},
        {'name': 'MODULE_DESCRIPTION', 'type': 'str'},
        {'name': 'MODULE_ENABLED', 'type': 'str'},
        {'name': 'MODULE_PARAMS', 'type': 'UNKNOWN'},
    ]
}