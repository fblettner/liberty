import logging
logger = logging.getLogger(__name__)

from sqlalchemy import create_engine, text

import configparser
import os
from fastapi import Request
from fastapi.responses import JSONResponse

from app.setup.services.dump import Dump
from app.controllers.api_controller import ApiController  
from app.config import get_ini_path
from app.config import get_db_properties_path
from app.setup.services.install import Install
from app.setup.services.models import Models
from app.utils.encrypt import Encryption
from app.utils.jwt import JWT

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
            current_password = data.get("current_password")
            admin_password = data.get("admin_password")
            load_data = data.get("load_data", False)
            load_features = data.get("load_features", False)

            # Create all tables in the database
#            for table in Base.metadata.tables.values():
#                if not table.schema:
#                    table.schema = database  # 🔹 Assign schema to tables
#            Base.metadata.create_all(engine)
#            logging.warning("All tables have been successfully created!")

            # Database configuration
            ADMIN_DATABASE_URL = f"postgresql+psycopg2://{user}:{current_password}@{host}:{port}/{admin_database}"

                # Create an engine
            admin_engine = create_engine(ADMIN_DATABASE_URL, isolation_level="AUTOCOMMIT") 
            with admin_engine.connect() as conn:
                # Update role password
                conn.execute(text(f"ALTER ROLE {admin_database} WITH PASSWORD '{password}'"))
                logging.warning(f"Role '{admin_database}' password updated successfully.")   
                
            databases_to_install = {
                "liberty": True,
                "libnsx1": data.get("enterprise", False),
                "libnjde": data.get("enterprise", False),
                "libnetl": data.get("enterprise", False),
            }
            
            databases_to_install = [db for db, status in databases_to_install.items() if status]
            for db_name in databases_to_install:
                logging.warning(f"Installing {db_name} database...")
                if (load_data):
                    db_init = Install(user, password, host, port, db_name, admin_database, self.jwt, admin_password)
                    db_init.restore_postgres_dump(db_name)
                    logging.warning(f"{db_name} database restored successfully!")
                db_password = Install(db_name, password, host, port, db_name, admin_database, self.jwt, admin_password)
                db_password.update_database_settings(db_name)
                logging.warning(f"{db_name} settings updated successfully!")
            
            features_to_install = {
                "nomasx1": data.get("enterprise", False),
                "nomajde": data.get("enterprise", False),
                "airflow": data.get("airflow", False),
                "keycloak": data.get("keycloak", False),
                "gitea": data.get("gitea", False),
            }
            features_to_install = [db for db, status in features_to_install.items() if status]
            for db_name in features_to_install:
                logging.warning(f"Installing {db_name} database...")
                if load_features:
                    db_init = Install(user, password, host, port, db_name, admin_database, self.jwt, admin_password)
                    db_init.restore_postgres_dump(db_name)
                    logging.warning(f"{db_name} database restored successfully!")
                db_password = Install(db_name, password, host, port, db_name, admin_database, self.jwt, admin_password)
                db_password.update_database_settings(db_name)
                logging.warning(f"{db_name} settings updated successfully!")

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
            self.config = configparser.ConfigParser()
            self.config.read(get_ini_path())
            database_to_export = self.config["repository"]["databases"].split(", ")
            for database in database_to_export:
                model_enabled = self.config[database].getboolean("model")
                data_enabled = self.config[database].getboolean("data")
                tables = self.config[database].get("tables", "").split(", ") if self.config[database].get("tables") else []

                if model_enabled:
                    models = Models(self.apiController, database)
                    models.create_model()

                if data_enabled:
                    dump = Dump(self.apiController, database, self.jwt)
                    if tables and tables != [""]:  # Ensure it's not an empty list
                        dump.extract_table_to_json(tables)
                    else:
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
