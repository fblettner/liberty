import logging
logger = logging.getLogger(__name__)

from fastapi import Request
from liberty.framework.controllers.api_controller import ApiController
from liberty.framework.utils.jwt import JWT
from liberty.framework.setup.services.setup import Setup
from liberty.framework.setup.services.alembic import Alembic

class SetupController:
    def __init__(self, apiController: ApiController,  jwt: JWT):
        self.setupRest = Setup(apiController, jwt)
        self.alembic = Alembic(apiController, jwt)

    async def install(self, req: Request):
        return await self.setupRest.install(req)

    async def prepare(self, req: Request):
        return await self.setupRest.prepare(req)
    
    async def restore(self, req: Request):
        return await self.setupRest.restore(req)
        
    async def update(self, req: Request):
        return await self.setupRest.update(req)    
    
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
    
    async def create(self, req: Request):
        return await self.setupRest.create_database(req)    
    
    async def drop(self, req: Request):
        return await self.setupRest.drop_database(req)        