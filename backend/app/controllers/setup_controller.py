import logging

from backend.app.utils.jwt import JWT
logger = logging.getLogger(__name__)

from backend.app.setup.services.setup import Setup
import json
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse, HTMLResponse
from typing import Optional
from socketio import ASGIApp, AsyncServer
from fastapi import FastAPI
from backend.app.controllers.api_controller import ApiController

class SetupController:
    def __init__(self, apiController: ApiController,  jwt: JWT):
        self.setupRest = Setup(apiController, jwt)

    async def install(self, req: Request):
        return await self.setupRest.install(req)
    
    async def repository(self, req: Request):
        return await self.setupRest.repository(req)        