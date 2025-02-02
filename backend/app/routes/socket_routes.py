import logging
logger = logging.getLogger(__name__)

from fastapi import APIRouter, Request
from app.controllers.socket_controller import SocketController

def setup_socket_routes(app, controller: SocketController):
    router = APIRouter()

    @router.get("/", include_in_schema=False)
    async def default():
        return await controller.default()
    

    @router.get("/applications", include_in_schema=False)
    async def applications(req: Request):
        return await controller.applications(req)

    app.include_router(router, prefix="/socket")