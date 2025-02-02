import configparser
import os
import subprocess
from fastapi import HTTPException, Request

from app.controllers.api_controller import ApiController
from app.utils.jwt import JWT
from app.setup.services.dump import Dump
from app.config.config import get_config_path

ALEMBIC_CONFIG = "alembic.ini"  # Adjust if needed

class Alembic:
    def __init__(self, apiController: ApiController, jwt: JWT):

        if not os.path.exists(ALEMBIC_CONFIG):
            raise FileNotFoundError(f"File not found: {ALEMBIC_CONFIG}")
        self.apiController = apiController 
        self.jwt = jwt

    def upgrade(self, req: Request):
        """Run Alembic upgrade to the latest version."""
        try:
            # Create a new migration
            result = subprocess.run(["alembic", "revision", "--autogenerate", "-m upgrade"], capture_output=True, text=True, check=True)
            # Upgrade the database
            result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True, check=True)
            # Upload JSON data to the database
            self.config = configparser.ConfigParser()
            self.config.read(os.path.join(get_config_path(), "liberty.ini"))
            database_to_upgrade = self.config["repository"]["databases"].split(", ")
            for database in database_to_upgrade:         
                dump = Dump(self.apiController, database)
                dump.upload_json_to_database()
            return {"message": "Database upgraded successfully!", "status": "success"}
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"Alembic upgrade failed: {e.stderr}")

    def downgrade(self, req: Request):
        """Downgrade the database to a specific version."""
        try:
            version = req.path_params["version"]
            result = subprocess.run(["alembic", "downgrade", version], capture_output=True, text=True, check=True)
            return {"message": f"Database downgraded to {version}!", "status": "success"}
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"Alembic downgrade failed: {e.stderr}")

    def revision(self, req: Request):
        """Generate a new Alembic migration with a message."""
        try:
            message = req.query_params["message"]
            result = subprocess.run(["alembic", "revision", "--autogenerate", "-m", message], capture_output=True, text=True, check=True)
            return {"message": f"Alembic migration created: {result.stdout}", "status": "success"}
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"Alembic revision failed: {e.stderr}")

    def current(self, req: Request):
        """Get the current Alembic migration version."""
        try:
            result = subprocess.run(["alembic", "current"], capture_output=True, text=True, check=True)
            unique_versions = sorted(set(result.stdout.strip().split("\n")))

            return {
                "message": f"Current Alembic versions: {unique_versions}" ,
                "status": "success", 
            }
        except subprocess.CalledProcessError as e:
            raise HTTPException(status_code=500, detail=f"Alembic current failed: {e.stderr}")