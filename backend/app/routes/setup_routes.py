import logging
logger = logging.getLogger(__name__)

import json
from app.config import get_db_properties_path
from app.services.alembic import alembic_current, alembic_downgrade, alembic_revision, alembic_upgrade
import os
from fastapi import APIRouter, Request

from app.controllers.setup_controller import SetupController
from app.models.base import ErrorResponse, SuccessResponse, response_200, response_422, response_500
from app.models.setup import SETUP_ERROR_MESSAGE, SETUP_RESPONSE_DESCRIPTION, SETUP_RESPONSE_EXAMPLE, SetupRequest


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


    @router.post("/setup/upgrade")
    async def upgrade_db():
        """Upgrade the database to the latest Alembic migration."""
        return alembic_upgrade()

    @router.post("/setup/downgrade/{version}")
    async def downgrade_db(version: str):
        """Downgrade the database to a specific Alembic version."""
        return alembic_downgrade(version)

    @router.post("/setup/revision")
    async def create_migration(message: str):
        """Create a new Alembic migration with a message."""
        return alembic_revision(message)

    @router.get("/setup/current")
    async def get_current_version():
        """Get the current Alembic migration version."""
        return alembic_current()

    app.include_router(router, prefix="/api")