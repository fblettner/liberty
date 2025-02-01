import logging
import subprocess

from backend.app.postgres.dump.dump import get_dump_path
from backend.app.setup.data.data import get_data_path
from backend.app.utils.encrypt import Encryption
from backend.app.utils.jwt import JWT
logger = logging.getLogger(__name__)
import json
import datetime
import os
from sqlalchemy import create_engine, MetaData, Table, delete, text, update
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import insert

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


    def upload_json_to_database(self, database):     
        DATABASE_URL = f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{database}"
        engine = create_engine(DATABASE_URL, echo=False, isolation_level="AUTOCOMMIT") 
        metadata = MetaData()
        metadata.reflect(bind=engine)
       
        # Load JSON data
        with open(os.path.join(os.path.dirname(__file__),f"{get_data_path()}/{database}.json"), "r", encoding="utf-8") as file:
            data = json.load(file)

        with engine.begin() as conn:
            # 🚀 Step 1: Disable Foreign Keys Temporarily
            conn.execute(text("SET session_replication_role = 'replica';"))

            # 🚀 Step 2: Insert Data into Tables
            for table_name, records in data.items():
                if table_name in EXCLUDED_TABLES:
                    logging.warning(f"Skipping table: {table_name}")
                    continue  # Skip this iteration

                logging.warning(f"Uploading data to table: {table_name}")

                table = Table(table_name, metadata, autoload_with=engine)
                primary_keys = [col.name for col in table.primary_key.columns]  # Get primary keys

                if not primary_keys:
                    logging.warning("Skipping {table_name}, no primary key detected!")
                    continue

                for record in records:
                    stmt = insert(table).values(**record)

                    upsert_stmt = stmt.on_conflict_do_update(
                        index_elements=primary_keys,  # Conflict resolution based on primary keys
                        set_={col.name: stmt.excluded[col.name] for col in table.columns if col.name not in primary_keys}
                    )

                    conn.execute(upsert_stmt)  # Execute UPSERT

            # 🚀 Step 3: Enable Foreign Keys Again
            conn.execute(text("SET session_replication_role = 'origin';"))

        logging.warning("Data upload completed successfully!")


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
            logging.warning(f"Dump file {dump_file} not found!")
            return

        logging.warning(f"Restoring database {database} from {dump_file}...")

        try:
            command = [
                "/Library/PostgreSQL/16/bin/pg_restore",
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
        DATABASE_URL = f"postgresql+psycopg2://{self.user}:{self.password}@{self.host}:{self.port}/{database}"
        engine = create_engine(DATABASE_URL, echo=False, isolation_level="AUTOCOMMIT") 

        databases_to_update = ["liberty", "libnsx1", "libnjde", "libnetl", "nomajde", "nomasx1"]
        
        """Update a row in the table using SQLAlchemy ORM"""
        try:
            metadata = MetaData()
            table = Table("ly_applications", metadata, autoload_with=engine)
            encryption = Encryption(self.jwt)
            encrypted_password = encryption.encrypt_text(self.password)

            """Update a row using SQLAlchemy Core"""
            with engine.connect() as connection:
                stmt = update(table).where(table.c.apps_pool.in_(databases_to_update)).values(apps_password=encrypted_password)
                connection.execute(stmt)
                logging.warning(f"Paswword updated successfully for database {database}!")
                stmt = update(table).where(table.c.apps_pool.in_(databases_to_update)).values(apps_host=self.host)
                connection.execute(stmt)
                logging.warning(f"Hostname updated successfully for database {database}!")
                stmt = update(table).where(table.c.apps_pool.in_(databases_to_update)).values(apps_port=self.port)
                connection.execute(stmt)
                logging.warning(f"Port updated successfully for database {database}!")            

            table = Table("ly_users", metadata, autoload_with=engine)
            encryption = Encryption(self.jwt)
            encrypted_admin_password = encryption.encrypt_text(self.admin_password)

            """Update a row using SQLAlchemy Core"""
            with engine.connect() as connection:
                stmt = update(table).where(table.c.usr_id=="admin").values(usr_password=encrypted_admin_password)
                connection.execute(stmt)
                logging.warning(f"Admin paswword updated successfully for database {database}!")
                stmt = delete(table).where(table.c.usr_id=="demo")
                connection.execute(stmt)
                logging.warning(f"Demo user deleted successfully for database {database}!")                


        except Exception as e:
            logging.error(f"Update failed: {e}")

