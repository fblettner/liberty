import configparser
import os
import subprocess
import traceback
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from app.controllers.api_controller import ApiController
from app.utils.jwt import JWT
from app.setup.services.dump import Dump
from app.config import get_ini_path
import importlib.resources as pkg_resources
from pathlib import Path
import app
from alembic import command
from alembic.config import Config

ALEMBIC_CONFIG = str(Path(pkg_resources.files(app) / "alembic.ini"))

class Alembic:
    def __init__(self, apiController: ApiController, jwt: JWT):
        if not os.path.exists(ALEMBIC_CONFIG):
            raise FileNotFoundError(f"File not found: {ALEMBIC_CONFIG}")
        self.apiController = apiController 
        self.jwt = jwt
        self.alembic_cfg = Config(ALEMBIC_CONFIG)

    def upgrade(self, req: Request):
        """Run Alembic upgrade to the latest version."""
        try:
            # Upgrade the database
            command.upgrade(self.alembic_cfg, "head")
            # Upload JSON data to the database
            self.config = configparser.ConfigParser()
            self.config.read(get_ini_path())
            database_to_upgrade = self.config["repository"]["databases"].split(", ")
            for database in database_to_upgrade:         
                dump = Dump(self.apiController, database, self.jwt)
                dump.upload_json_to_database()
            return {"message": "Database upgraded successfully!", "status": "success"}
        except Exception as err:
            return JSONResponse({
                "status": "error",
                "message": f"{str(err)}"
            })


    def downgrade(self, req: Request):
        """Downgrade the database to a specific version."""
        try:
            version = req.path_params["version"]
            result = command.downgrade(self.alembic_cfg, revision=version)
            return {"message": f"Database downgraded to {version}!", "status": "success"}
        except Exception as err:
            return JSONResponse({
                "status": "error",
                "message": f"{str(err)}"
            })

    def revision(self, req: Request):
        """Generate a new Alembic migration with a message."""
        try:
            message = req.query_params["message"]
            result = command.revision(self.alembic_cfg, message=message, autogenerate=True)
            return {"message": f"Alembic migration created: {result}", "status": "success"}
        except Exception as err:
            return JSONResponse({
                "status": "error",
                "message": f"{str(err)}"
            })

    def current(self, req: Request):
        """Get the current Alembic migration version."""
        try:
            result = command.current(self.alembic_cfg) 
            return {
                "message": f"Current Alembic versions: {result}",
                "status": "success", 
            }
        except Exception as err:
            return JSONResponse({
                "status": "error",
                "message": f"{str(err)}"
            })