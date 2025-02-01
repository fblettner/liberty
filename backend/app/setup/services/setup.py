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
            admin_database = data.get("database")
            user = data.get("user")
            password = data.get("password")

            # Create all tables in the database
#            for table in Base.metadata.tables.values():
#                if not table.schema:
#                    table.schema = database  # 🔹 Assign schema to tables
#            Base.metadata.create_all(engine)
#            logging.warning("All tables have been successfully created!")

            databases_to_install = {
                "liberty": True,
                "libnsx1": data.get("enterprise", False),
                "libnjde": data.get("enterprise", False),
                "libnetl": data.get("enterprise", False),
                "nomasx1": data.get("enterprise", False),
                "nomajde": data.get("enterprise", False),
                "airflow": data.get("airflow", False),
                "keycloak": data.get("keycloak", False),
                "gitea": data.get("gitea", False),
            }
            databases_to_install = [db for db, status in databases_to_install.items() if status]
            for db_name in databases_to_install:
                print(f"Installing {db_name} database...")
                db_init = Install(user, password, host, port, db_name, admin_database)
                db_init.restore_postgres_dump(db_name)
                print(f"{db_name} database restored successfully!")
            
            db_properties_path = get_db_properties_path()
            encryption = Encryption(self.jwt)
            encrypted_password = encryption.encrypt_text(password)
            config_content = f"""# FRAMEWORK SETTINGS
[framework]
user={user}
password={encrypted_password}
host={host}
port={port}
database={admin_database}
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

    async def repository(self, req: Request):
        try:
            database_to_export = ["liberty", "libnsx1", "libnjde", "libnetl", "nomasx1"]
            for database in database_to_export:
                models = Models(self.apiController, database)
                models.create_model()

                if database == "nomasx1":
                    dump = Dump(self.apiController, database)
                    tables = ["settings_applications", "settings_users"]
                    dump.extract_table_to_json(tables)
                else:
                    dump = Dump(self.apiController, database)
                    dump.extract_schema_to_json()

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
