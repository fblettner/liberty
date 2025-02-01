import logging
logger = logging.getLogger(__name__)
from backend.app.config import get_db_properties_path
from backend.app.setup.services.install import Install
from backend.app.setup.services.models import Models
from backend.app.utils.encrypt import Encryption
from backend.app.utils.jwt import JWT
import os
from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, text
from backend.app.setup.models.liberty import Base
from backend.app.setup.services.dump import Dump
from backend.app.controllers.api_controller import ApiController  

class Setup:
    def __init__(self, apiController: ApiController, jwt: JWT):
        self.apiController = apiController
        self.jwt = jwt
    

    async def install(self, req: Request):
        try:
            data = await req.json()
            host = data.get("host")
            port = data.get("port")
            database = data.get("database")
            user = data.get("user")
            password = data.get("password")

            # Database configuration
            DATABASE_URL = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"

            # Create an engine
            engine = create_engine(DATABASE_URL, isolation_level="AUTOCOMMIT") 
            with engine.connect() as conn:
                conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {database}"))

            # Create all tables in the database
            for table in Base.metadata.tables.values():
                if not table.schema:
                    table.schema = database  # 🔹 Assign schema to tables
            Base.metadata.create_all(engine)
            logging.warning("All tables have been successfully created!")

            liberty_init = Install(user, password, host, port, database)
            liberty_init.upload_json_to_database(database)

            
            db_properties_path = get_db_properties_path()
            encryption = Encryption(self.jwt)
            encrypted_password = encryption.encrypt_text(password)
            config_content = f"""# FRAMEWORK SETTINGS
[framework]
user={user}
password={encrypted_password}
host={host}
port={port}
database={database}
pool_min=1
pool_max=10
pool_alias=default
"""
            with open(db_properties_path, "w", encoding="utf-8") as config_file:
                config_file.write(config_content)
            
            logging.warning(f"Configuration file created at {db_properties_path}")

            if os.path.exists(db_properties_path):
                config = self.apiController.queryRest.load_db_properties(db_properties_path)
                await self.apiController.queryRest.default_pool(config)

                # Return the response
                return JSONResponse({
                        "items": [],
                        "status": "success",
                        "count": 0
                    })
            else:
                # Return the response
                return JSONResponse({
                        "items": [],
                        "status": "error",
                        "count": 0
                    })

        except Exception as err:
            message = str(err)
            return JSONResponse({
                "items": [{"message": f"Error: {message}"}],
                "status": "error",
                "count": 0
            })

    async def export(self, req: Request):
        try:

            liberty_dump = Dump(self.apiController, "liberty")
            liberty_dump.extract_schema_to_json()

            libnsx1_dump = Dump(self.apiController, "libnsx1")
            libnsx1_dump.extract_schema_to_json()

            libnjde_dump = Dump(self.apiController, "libnjde")
            libnjde_dump.extract_schema_to_json()

            libnjde_dump = Dump(self.apiController, "libnjde")
            libnjde_dump.extract_schema_to_json()

            nomasx1_dump = Dump(self.apiController, "nomasx1")
            tables = ["settings_applications", "settings_users"]
            nomasx1_dump.extract_table_to_json(tables)

            # Return the response
            return JSONResponse({
                    "items": [],
                    "status": "success",
                    "count": 0
                })

        except Exception as err:
            message = str(err)
            return JSONResponse({
                "items": [{"message": f"Error: {message}"}],
                "status": "error",
                "count": 0
            })

    async def models(self, req: Request):
        try:

            models_list = ["liberty", "libnsx1", "libnjde", "nomasx1"]
            for model in models_list:
                models = Models(self.apiController, model)
                models.create_model()

            # Return the response
            return JSONResponse({
                    "items": [],
                    "status": "success",
                    "count": 0
                })

        except Exception as err:
            message = str(err)
            return JSONResponse({
                "items": [{"message": f"Error: {message}"}],
                "status": "error",
                "count": 0
            })
