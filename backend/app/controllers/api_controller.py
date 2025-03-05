from fastapi import HTTPException, Request
from app.utils.encrypt import Encryption
from app.utils.jwt import JWT
from app.services.db_query import Query
from app.services.api_rest import Rest

class ApiController:
    def __init__(self, jwt: JWT):
        self.queryRest = Query(jwt)
        self.apiRest = Rest(self.queryRest)
        self.jwt = jwt

    async def token(self, req: Request):
        return await self.queryRest.token(req)
    
    async def user(self, req: Request):
        return await self.queryRest.user(req)
    
    async def check(self, req: Request):
        return await self.queryRest.check(req)
    
    async def get(self, req: Request):
        return await self.queryRest.get(req)

    async def post(self, req: Request):
        return await self.queryRest.post(req)

    async def put(self, req: Request):
        return await self.queryRest.post(req)

    async def delete(self, req: Request):
        return await self.queryRest.post(req)

    async def open(self, req: Request):
        return await self.queryRest.open(req)
    
    def get_pool_info(self, req: Request, pool: str):
        return self.queryRest.get_pool_info(req, pool)

    async def close(self, req: Request):
        return await self.queryRest.close(req)

    async def encrypt(self, req: Request):
        try:
            data = await req.json()
            plain_text = data.get("plain_text")
            encryption = Encryption(self.jwt)
            encrypted_text = encryption.encrypt_text(plain_text)
            return {"encrypted": encrypted_text}
        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))

    async def audit(self, req: Request, table: str, user: str):
        return await self.queryRest.audit(req, table, user)    
    
    async def modules(self, req: Request):
        return await self.queryRest.modules(req)
    
    async def applications(self, req: Request):
        return await self.queryRest.applications(req)    

    async def themes(self, req: Request):
        return await self.queryRest.themes(req)    
    
    async def push_log(self, req: Request):
        return await self.apiRest.push_log(req)    

    async def get_log(self, req: Request):
        return await self.apiRest.get_log(req) 
    
    async def get_log_details(self, req: Request):
        return await self.apiRest.get_log_details(req) 

    async def ai_prompt(self, req: Request):
        return await self.apiRest.ai_prompt(req)     
    
    async def ai_welcome(self, req: Request):
        return await self.apiRest.ai_welcome(req)      
        
    async def rest(self, req: Request):
        return await self.apiRest.rest(req)          
    
    async def version(self, req: Request):
        return await self.apiRest.get_version(req)           