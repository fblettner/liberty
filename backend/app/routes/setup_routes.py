import json
import logging

from backend.app.config import get_db_properties_path
logger = logging.getLogger(__name__)
import os
from fastapi import APIRouter, Request

from backend.app.controllers.setup_controller import SetupController
from backend.app.models.base import ErrorResponse, SuccessResponse, response_200, response_422, response_500
from backend.app.models.setup import SETUP_ERROR_MESSAGE, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE, SetupRequest


def setup_setup_routes(app, controller: SetupController):
    router = APIRouter()

    @router.post(
        "/setup/install",
        summary="SETUP - Installation",
        description="Configure the postgres database.",
        tags=["Setup"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, SETUP_ERROR_MESSAGE),
        },
    )
    async def install(
        req: Request,
        body: SetupRequest,
    ):
        result = await controller.install(req)
        result_data = json.loads(result.body.decode("utf-8"))  

        if result_data.get("status") == "success":
            app.state.setup_required = False  
        return result  
    

    @router.get(
        "/export/repository",
        summary="EXPORT - Repository for new installations",
        description="Export all tables models to Alchemy.",
        tags=["Export"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, SETUP_ERROR_MESSAGE),
        },
    )
    async def models(
        req: Request,
    ):
        return await controller.repository(req)
    
    @router.post("/setup/status", include_in_schema=False)
    async def status():
        try:
            db_properties_path = get_db_properties_path()
            if os.path.exists(db_properties_path):
                app.state.setup_required = False
                return {"message": "Setup completed, database is ready."}
        except Exception as e:
            logging.error(f"Error refreshing status: {e}")
        return {"message": "Setup still required."}
    
    app.include_router(router, prefix="/api")