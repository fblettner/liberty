import logging
logger = logging.getLogger(__name__)

from fastapi import Request
from app.controllers.api_controller import ApiController
from app.utils.jwt import JWT
from app.setup.services.setup import Setup

class SetupController:
    def __init__(self, apiController: ApiController,  jwt: JWT):
        self.setupRest = Setup(apiController, jwt)

    async def install(self, req: Request):
        return await self.setupRest.install(req)
    
    async def repository(self, req: Request):
        return await self.setupRest.repository(req)        