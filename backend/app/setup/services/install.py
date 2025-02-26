import logging
logger = logging.getLogger(__name__)

import subprocess
import configparser
import json
import datetime
import os
from sqlalchemy import create_engine, MetaData, Table, delete, text, update

from app.config import get_ini_path
from app.postgres.dump import get_dump_path
from app.utils.encrypt import Encryption
from app.utils.jwt import JWT

EXCLUDED_TABLES = {"databasechangelog", "databasechangeloglock"}  # Add tables to exclude

# Custom JSON Encoder to Convert Dates
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime.datetime, datetime.date)):
            return obj.isoformat()  # Convert datetime to string
        return super().default(obj)
    
class Install: 
    def __init__(self, user, password, host, port, database, admin_database, jwt: JWT, admin_password):
        self.jwt = jwt
        self.database = database
        self.admin_database = admin_database
        self.user = user
        self.password = password
        self.admin_password = admin_password
        self.host = host
        self.port = port


    def restore_postgres_dump(self, database):
        """Restores a PostgreSQL dump using `pg_restore`."""
        
        # Database configuration
        ADMIN_DATABASE_URL = f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.admin_database}"

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
            result = conn.execute(text(f"SELECT 1 FROM pg_roles WHERE rolname = '{database}'"))
            role_exists = result.scalar()

            if not role_exists:
                logging.warning(f"Creating role '{database}' with password...")
                conn.execute(text(f"CREATE ROLE {database} WITH LOGIN PASSWORD '{self.password}'"))
            else:
                logging.warning(f"Role '{database}' already exists. Skipping creation.")

            # 🚀 Grant privileges to the role
            conn.execute(text(f'GRANT ALL PRIVILEGES ON DATABASE "{database}" TO {database}'))
            logging.warning(f"Granted privileges to role '{database}' on database '{database}'.")    

        dump_file = get_dump_path(database)
        if not os.path.exists(dump_file):
            logging.error(f"Dump file {dump_file} not found!")
            return

        logging.warning(f"Restoring database {database} from {dump_file}...")

        try:
            pg_path = subprocess.run(["which", "pg_restore"], capture_output=True, text=True).stdout.strip()
            command = [
                pg_path, 
                "--clean",  
                "--if-exists",  
                "-U", self.user,
                "-h", self.host,
                "-p", str(self.port),
                "-d", database,
                dump_file
            ]
            subprocess.run(command, check=True, env={"PGPASSWORD": self.password})

            logging.warning("Database restored successfully!")

        except subprocess.CalledProcessError as e:
            logging.error(f"Restore failed: {e}")

    def restore_postgres_dump_for_upgrade(self, database):
        """Restores a PostgreSQL dump using `pg_restore`."""
        
        # Database configuration
        ADMIN_DATABASE_URL = f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{self.admin_database}"

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
            result = conn.execute(text(f"SELECT 1 FROM pg_roles WHERE rolname = '{database}'"))
            role_exists = result.scalar()

            if not role_exists:
                logging.warning(f"Creating role '{database}' with password...")
                conn.execute(text(f"CREATE ROLE {database} WITH LOGIN PASSWORD '{self.password}'"))
            else:
                logging.warning(f"Role '{database}' already exists. Skipping creation.")

            # 🚀 Grant privileges to the role
            conn.execute(text(f'GRANT ALL PRIVILEGES ON DATABASE "{database}" TO {database}'))
            logging.warning(f"Granted privileges to role '{database}' on database '{database}'.")    


        if not db_exists:
            try:
                dump_file = get_dump_path(database)
                if not os.path.exists(dump_file):
                    logging.error(f"Dump file {dump_file} not found!")
                    return

                logging.warning(f"{database} does not exist. Restoring database {database} from {dump_file}...")
                pg_path = subprocess.run(["which", "pg_restore"], capture_output=True, text=True).stdout.strip()
                command = [
                    pg_path, 
                    "--clean",  
                    "--if-exists",  
                    "-U", self.user,
                    "-h", self.host,
                    "-p", str(self.port),
                    "-d", database,
                    dump_file
                ]
                subprocess.run(command, check=True, env={"PGPASSWORD": self.password})

                logging.warning("Database restored successfully!")

            except subprocess.CalledProcessError as e:
                logging.error(f"Restore failed: {e}")

    def update_database_settings(self, database):     
        try:
            self.config = configparser.ConfigParser()
            self.config.read(get_ini_path())
            databases_to_update = self.config["repository"]["databases"].split(", ")    
        
            if database in databases_to_update:
                DATABASE_URL = f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{database}"
                engine = create_engine(DATABASE_URL, echo=False, isolation_level="AUTOCOMMIT") 

                metadata = MetaData()
                table = Table("ly_applications", metadata, autoload_with=engine)
                encryption = Encryption(self.jwt)
                encrypted_password = encryption.encrypt_text(self.password)

                with engine.connect() as connection:
                    stmt = update(table).where(table.c.apps_pool.in_(databases_to_update)).values(apps_password=encrypted_password)
                    connection.execute(stmt)
                    logging.debug(f"Paswword updated successfully for database {database}!")
                    stmt = update(table).where(table.c.apps_pool.in_(databases_to_update)).values(apps_host=self.host)
                    connection.execute(stmt)
                    logging.debug(f"Hostname updated successfully for database {database}!")
                    stmt = update(table).where(table.c.apps_pool.in_(databases_to_update)).values(apps_port=self.port)
                    connection.execute(stmt)
                    logging.debug(f"Port updated successfully for database {database}!")            

                table = Table("ly_users", metadata, autoload_with=engine)
                encryption = Encryption(self.jwt)
                encrypted_admin_password = encryption.encrypt_text(self.admin_password)

                with engine.connect() as connection:
                    stmt = update(table).where(table.c.usr_id=="admin").values(usr_password=encrypted_admin_password)
                    connection.execute(stmt)
                    logging.debug(f"Admin paswword updated successfully for database {database}!")
                    stmt = delete(table).where(table.c.usr_id=="demo")
                    connection.execute(stmt)
                    logging.debug(f"Demo user deleted successfully for database {database}!")                


        except Exception as e:
            logging.error(f"Update failed: {e}")




        