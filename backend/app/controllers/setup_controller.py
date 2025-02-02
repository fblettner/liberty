import logging
logger = logging.getLogger(__name__)

from fastapi import Request
from app.controllers.api_controller import ApiController
from app.utils.jwt import JWT
from app.setup.services.setup import Setup
from app.setup.services.alembic import Alembic

class SetupController:
    def __init__(self, apiController: ApiController,  jwt: JWT):
        self.setupRest = Setup(apiController, jwt)
        self.alembic = Alembic(apiController, jwt)

    async def install(self, req: Request):
        return await self.setupRest.install(req)
    
    async def repository(self, req: Request):
        return await self.setupRest.repository(req)        
    
    def upgrade(self, req: Request):
        return self.alembic.upgrade(req)  
    
    def downgrade(self, req: Request):
        return self.alembic.downgrade(req)      
    
    def revision(self, req: Request):
        return self.alembic.revision(req)          
    
    def current(self, req: Request):
        return self.alembic.current(req)           