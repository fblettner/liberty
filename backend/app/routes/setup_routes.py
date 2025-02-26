import logging
logger = logging.getLogger(__name__)

import json
from app.config import get_db_properties_path
import os
from fastapi import APIRouter, Request

from app.controllers.setup_controller import SetupController
from app.models.base import ErrorResponse, SuccessResponse, response_200, response_422, response_500
from app.models.setup import CREATE_ERROR_MESSAGE, CREATE_RESPONSE_DESCRIPTION, CREATE_RESPONSE_EXAMPLE, DROP_ERROR_MESSAGE, DROP_RESPONSE_DESCRIPTION, DROP_RESPONSE_EXAMPLE, SETUP_ERROR_MESSAGE, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE, CreateRequest, DropRequest, SetupRequest


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
            app.state.offline_mode = False
        return result  

    @router.post(
        "/setup/prepare",
        summary="SETUP - Prepare Upgrade",
        description="Configure the postgres database for upgrading.",
        tags=["Setup"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, SETUP_ERROR_MESSAGE),
        },
    )
    async def prepare(
        req: Request,
        body: SetupRequest,
    ):
        result = await controller.prepare(req)
        result_data = json.loads(result.body.decode("utf-8"))  

        if result_data.get("status") == "success":
            app.state.setup_required = False  
            app.state.offline_mode = False
        return result  
    
    @router.post(
        "/setup/restore",
        summary="SETUP - Restore",
        description="Restore database with clean installation.",
        tags=["Setup"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, SETUP_ERROR_MESSAGE),
        },
    )
    async def restore(
        req: Request,
        body: SetupRequest,
    ):
        result = await controller.restore(req)
        result_data = json.loads(result.body.decode("utf-8"))  

        if result_data.get("status") == "success":
            app.state.setup_required = False  
            app.state.offline_mode = False
        return result  

    @router.post(
        "/setup/update",
        summary="SETUP - Update",
        description="Update all settings for database connection and passwords.",
        tags=["Setup"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, SETUP_ERROR_MESSAGE),
        },
    )
    async def update(
        req: Request,
        body: SetupRequest,
    ):
        result = await controller.update(req)
        result_data = json.loads(result.body.decode("utf-8"))  

        if result_data.get("status") == "success":
            app.state.setup_required = False  
            app.state.offline_mode = False
        return result      

    @router.get(
        "/export/repository",
        summary="EXPORT - Repository for Deployment",
        description="Export all tables models and data.",
        tags=["Export"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, SETUP_ERROR_MESSAGE),
        },
    )
    async def repository(
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


    @router.post("/setup/upgrade",
        summary="SETUP - Upgrade",
        description="Upgrade databases to latest version",
        tags=["Setup"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, SETUP_ERROR_MESSAGE),
        },
    )
    async def upgrade(        
        req: Request
        ):
        result = controller.upgrade(req)
        return result  

    @router.post("/setup/downgrade/{version}",
        summary="SETUP - Downgrade",
        description="Downgrade databases to a specific version",
        tags=["Setup"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, SETUP_ERROR_MESSAGE),
        },
    )
    async def downgrade(        
        req: Request
        ):
        result = controller.downgrade(req)
        return result  

    @router.post("/setup/revision",
        summary="SETUP - Revision",
        description="Create a new revision for the database",
        tags=["Setup"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, SETUP_ERROR_MESSAGE),
        },
    )
    async def revision(        
        req: Request
        ):
        return controller.revision(req)

    @router.get("/setup/current",
        summary="SETUP - Current",
        description="Get the current version deployed",
        tags=["Setup"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, SETUP_ERROR_MESSAGE),
        },
    )
    async def current(        
        req: Request
        ):
        return controller.current(req)


    @router.post(
        "/db/create",
        summary="DATABASE - Create",
        description="Create database for new application",
        tags=["Database"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, CREATE_RESPONSE_DESCRIPTION, CREATE_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, CREATE_ERROR_MESSAGE),
        },
    )
    async def create(
        req: Request,
        body: CreateRequest,
    ):
        return await controller.create(req)
    
    @router.post(
        "/db/drop",
        summary="DATABASE - Drop",
        description="Drop an existing database",
        tags=["Database"], 
        response_model=SuccessResponse,
        responses={
            200: response_200(SuccessResponse, DROP_RESPONSE_EXAMPLE, DROP_RESPONSE_DESCRIPTION),
            422: response_422(),  
            500: response_500(ErrorResponse, DROP_ERROR_MESSAGE),
        },
    )
    async def drop(
        req: Request,
        body: DropRequest,
    ):
        return await controller.drop(req)
    
    app.include_router(router, prefix="/api")

