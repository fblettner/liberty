import logging

from liberty.framework.setup.models.liberty import Base
logger = logging.getLogger(__name__)

from sqlalchemy import create_engine, text

import configparser
import os
from fastapi import Request
from fastapi.responses import JSONResponse

from liberty.framework.setup.services.dump import Dump
from liberty.framework.controllers.api_controller import ApiController  
from liberty.framework.config import get_ini_path
from liberty.framework.config import get_db_properties_path
from liberty.framework.setup.services.install import Install
from liberty.framework.setup.services.models import Models
from liberty.framework.utils.encrypt import Encryption
from liberty.framework.utils.jwt import JWT

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
                "nomasx1": data.get("enterprise", False),
                "nomajde": data.get("enterprise", False),
                "airflow": data.get("airflow", False),
                "keycloak": data.get("keycloak", False),
                "gitea": data.get("gitea", False),
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
                config = self.apiController.api.load_db_properties(db_properties_path)
                await self.apiController.api.default_pool(config)
                
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
        

    async def restore(self, req: Request):
        try:
            data = await req.json()
            host = data.get("host")
            port = data.get("port")
            admin_database = data.get("database")
            user = data.get("user")
            password = data.get("password")
            current_password = data.get("current_password")
            admin_password = data.get("admin_password")

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
                "nomasx1": data.get("enterprise", False),
                "nomajde": data.get("enterprise", False),
                "airflow": data.get("airflow", False),
                "keycloak": data.get("keycloak", False),
                "gitea": data.get("gitea", False),
            }
            
            databases_to_install = [db for db, status in databases_to_install.items() if status]
            for db_name in databases_to_install:
                logging.warning(f"Restoring {db_name} database...")
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
                config = self.apiController.api.load_db_properties(db_properties_path)
                await self.apiController.api.default_pool(config)
                
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

    async def prepare(self, req: Request):
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
                "nomasx1": data.get("enterprise", False),
                "nomajde": data.get("enterprise", False),
                "airflow": data.get("airflow", False),
                "keycloak": data.get("keycloak", False),
                "gitea": data.get("gitea", False),
            }
            
            databases_to_install = [db for db, status in databases_to_install.items() if status]
            for db_name in databases_to_install:
                logging.warning(f"Preparing {db_name} database...")
                db_init = Install(user, password, host, port, db_name, admin_database, self.jwt, admin_password)
                db_init.restore_postgres_dump_for_upgrade(db_name)
                logging.warning(f"{db_name} database prepared successfully!")
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
                config = self.apiController.api.load_db_properties(db_properties_path)
                await self.apiController.api.default_pool(config)
                
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


    async def update(self, req: Request):
        try:
            data = await req.json()
            host = data.get("host")
            port = data.get("port")
            admin_database = data.get("database")
            user = data.get("user")
            password = data.get("password")
            current_password = data.get("current_password")
            admin_password = data.get("admin_password")

            # Database configuration
            ADMIN_DATABASE_URL = f"postgresql+psycopg2://{user}:{current_password}@{host}:{port}/{admin_database}"

            databases_to_update = {
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
            databases_to_update = [db for db, status in databases_to_update.items() if status]
            admin_engine = create_engine(ADMIN_DATABASE_URL, isolation_level="AUTOCOMMIT") 
            with admin_engine.connect() as conn:
                # Update role password
                for db_name in databases_to_update:
                    logging.warning(f"Updating {db_name} database...")
                    conn.execute(text(f"ALTER ROLE {db_name} WITH PASSWORD '{password}'"))
                    logging.warning(f"Role '{db_name}' password updated successfully.")   

            self.config = configparser.ConfigParser()
            self.config.read(get_ini_path())
            databases_to_update = self.config["repository"]["databases"].split(", ")    

            for db_name in databases_to_update:
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
                config = self.apiController.api.load_db_properties(db_properties_path)
                await self.apiController.api.default_pool(config)
                
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
        

    async def create_database(self, req: Request):
        try:
            data = await req.json()
            host = data.get("host")
            port = data.get("port")
            database = data.get("database")
            user = data.get("user")
            password = data.get("password")
        
            # Database configuration
            db_properties_path = get_db_properties_path()
            config = self.apiController.api.load_db_properties(db_properties_path)
            # Database configuration
            ADMIN_DATABASE_URL = f"postgresql+psycopg2://{config["user"]}:{config["password"]}@{config["host"]}:{config["port"]}/{config["database"]}"

                # Create an engine
            admin_engine = create_engine(ADMIN_DATABASE_URL, isolation_level="AUTOCOMMIT") 
            with admin_engine.connect() as conn:
                result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{database}'"))
                db_exists = result.scalar()

                if not db_exists:
                    logging.warning(f"Creating database '{database}'...")
                    conn.execute(text(f'CREATE DATABASE "{database}"'))
                else:
                    logging.warning(f"Database '{database}' already exists. Skipping creation.")
                # 🚀 Check if the role exists
                result = conn.execute(text(f"SELECT 1 FROM pg_roles WHERE rolname = '{user}'"))
                role_exists = result.scalar()

                if not role_exists:
                    logging.warning(f"Creating role '{user}' with password...")
                    conn.execute(text(f"CREATE ROLE {user} WITH LOGIN PASSWORD '{password}'"))
                else:
                    logging.warning(f"Role '{user}' already exists. Skipping creation.")

                # 🚀 Grant privileges to the role
                conn.execute(text(f'GRANT ALL PRIVILEGES ON DATABASE "{database}" TO {user}'))
                logging.warning(f"Granted privileges to role '{user}' on database '{database}'.")    

            # Create all tables in the database
            DATABASE_URL = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
            engine = create_engine(DATABASE_URL, echo=False, isolation_level="AUTOCOMMIT") 

            with engine.connect() as conn:
                result = conn.execute(text(f"SELECT 1 FROM information_schema.schemata WHERE schema_name = '{database}'"))
                schema_exists = result.scalar()

                if not schema_exists:
                    logging.warning(f"Creating schema '{user}'...")
                    conn.execute(text(f'CREATE SCHEMA "{user}" AUTHORIZATION {user}'))
                else:
                    logging.warning(f"Schema '{user}' already exists. Skipping creation.")

            for table in Base.metadata.tables.values():
                if not table.schema:
                    table.schema = database  
                    Base.metadata.create_all(engine)
            
            logging.warning("All tables have been successfully created!")        
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
        
    async def drop_database(self, req: Request):
        try:
            data = await req.json()
            database = data.get("database")
            user = data.get("user")
        
            # Database configuration
            db_properties_path = get_db_properties_path()
            config = self.apiController.api.load_db_properties(db_properties_path)
            # Database configuration
            ADMIN_DATABASE_URL = f"postgresql+psycopg2://{config["user"]}:{config["password"]}@{config["host"]}:{config["port"]}/{config["database"]}"

                # Create an engine
            admin_engine = create_engine(ADMIN_DATABASE_URL, isolation_level="AUTOCOMMIT") 
            with admin_engine.connect() as conn:
                # 🚀 Check if database exists
                result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{database}'"))
                db_exists = result.scalar()

                if db_exists:
                    logging.warning(f"Revoking new connections to database '{database}'...")
                    conn.execute(text(f"UPDATE pg_database SET datallowconn = FALSE WHERE datname = '{database}'"))

                    logging.warning(f"Terminating active connections to database '{database}'...")
                    conn.execute(text(f"""
                        SELECT pg_terminate_backend(pg_stat_activity.pid) 
                        FROM pg_stat_activity 
                        WHERE pg_stat_activity.datname = '{database}' 
                        AND pid <> pg_backend_pid();
                    """))

                    logging.warning(f"Dropping database '{database}'...")
                    conn.execute(text(f'DROP DATABASE "{database}"'))
                else:
                    logging.warning(f"Database '{database}' does not exist. Skipping drop.")

                # 🚀 Check if the role exists
                result = conn.execute(text(f"SELECT 1 FROM pg_roles WHERE rolname = '{user}'"))
                role_exists = result.scalar()

                if role_exists:
                    logging.warning(f"Dropping role '{user}'...")
                    conn.execute(text(f"DROP ROLE {user}"))
                else:
                    logging.warning(f"Role '{user}' does not exist. Skipping drop.")
            
            logging.warning("Database successfully dropped!")    
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