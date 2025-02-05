import logging

from app.setup.services.install import Install
from app.utils.jwt import JWT
logger = logging.getLogger(__name__)

from app.config import get_db_properties_path
from app.controllers.api_controller import ApiController
from app.setup.data import get_data_path
import json
import datetime
import os
from sqlalchemy import create_engine, MetaData, Table, text
from sqlalchemy.dialects.postgresql import insert

EXCLUDED_TABLES = {"ly_applications", "ly_users"} 

# Custom JSON Encoder to Convert Dates
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime.datetime, datetime.date)):
            return obj.isoformat()  # Convert datetime to string
        return super().default(obj)

class Dump: 
    def __init__(self, apiController: ApiController, database, jwt: JWT):
        db_properties_path = get_db_properties_path()
        self.config = apiController.queryRest.load_db_properties(db_properties_path)
        self.database = database
        self.apiController = apiController
        self.jwt = jwt

        # Database configuration
        DATABASE_URL = f"postgresql+psycopg2://{database}:{self.config["password"]}@{self.config["host"]}:{self.config["port"]}/{database}"

        try:
            self.engine = create_engine(DATABASE_URL, echo=False, isolation_level="AUTOCOMMIT")
            self.metadata = MetaData()
            self.metadata.reflect(bind=self.engine)
            self.database = database
        except Exception as e:
            logging.error(f"Error connecting to database: {str(e)}")
            raise e

    def extract_schema_to_json(self):
        """Extract all data from database tables and save to JSON."""
        all_data = {}

        for table_name, table in self.metadata.tables.items():
            if table_name in EXCLUDED_TABLES:
                logging.debug(f"Skipping table: {table_name}")
                continue  # Skip this iteration

            logging.debug(f"Extracting data from table: {table_name}")
            
            # Reflect table
            mapped_table = Table(table_name, self.metadata, autoload_with=self.engine)
            
            # Fetch all rows
            with self.engine.connect() as connection:
                result = connection.execute(mapped_table.select())
                rows = [dict(row) for row in result.mappings()]
            
            # Store data in dictionary
            all_data[table_name] = rows

        # Save to JSON file with DateTimeEncoder
        with open(get_data_path(self.database), "w", encoding="utf-8") as json_file:
            json.dump(all_data, json_file, indent=4, ensure_ascii=False, cls=DateTimeEncoder)

        logging.debug(f"Data successfully exported to {f"{self.database}.json"}")


    def extract_table_to_json(self, tables):
        """Extract all data from database tables and save to JSON."""

        try:
            all_data = {}
            for table_name in tables:
                logging.debug(f"Extracting data from table: {table_name}")
                normalized_metadata_tables = {name.lower(): name for name in self.metadata.tables.keys()}
                
                if table_name.lower() not in normalized_metadata_tables:
                    raise ValueError(f"Table '{table_name}' not found in the database!")

                actual_table_name = normalized_metadata_tables[table_name.lower()]
                mapped_table = self.metadata.tables[actual_table_name]  

                # Fetch all rows
                with self.engine.connect() as connection:
                    result = connection.execute(mapped_table.select())
                    rows = [dict(row) for row in result.mappings()]

                all_data[table_name] = rows



            # Save to JSON file with DateTimeEncoder
            with open(get_data_path(self.database), "w", encoding="utf-8") as json_file:
                json.dump(all_data, json_file, indent=4, ensure_ascii=False, cls=DateTimeEncoder)

            logging.debug(f"Data successfully exported to {f"{self.database}.json"}")

        except Exception as e:
            logging.error(f"Error processing table {table_name}: {str(e)}")


    def upload_json_to_database(self):     
        """Upload JSON data to the database."""
        logging.warning(f"Uploading database: {self.database}")

        # Create an engine for the admin database
        db_properties_path = get_db_properties_path()
        config = self.apiController.queryRest.load_db_properties(db_properties_path)
        # Database configuration
        ADMIN_DATABASE_URL = f"postgresql+psycopg2://{config["user"]}:{config["password"]}@{config["host"]}:{config["port"]}/{self.database}"
        admin_engine = create_engine(ADMIN_DATABASE_URL, isolation_level="AUTOCOMMIT") 

        # Step 1: Disable foreign key checks
        with admin_engine.connect() as conn:
            conn.execute(text("SET session_replication_role = 'replica'"))
            tables = conn.execute(text(f"SELECT tablename FROM pg_tables WHERE schemaname = '{self.database}'")).fetchall()
            for table in tables:
                conn.execute(text(f"ALTER TABLE {self.database}.{table[0]} DISABLE TRIGGER ALL"))
                conn.execute(text(f"ALTER TABLE {self.database}.{table[0]} OWNER TO {self.database}"))
            print("Foreign key constraints disabled.")

        # Load JSON data
        with open(get_data_path(self.database), "r", encoding="utf-8") as file:
            data = json.load(file)

        with self.engine.begin() as conn:
            # Step 2: Insert Data into Tables
            for table_name, records in data.items():
                if table_name in EXCLUDED_TABLES:
                    logging.debug(f"Skipping table: {table_name}")
                    continue  # Skip this iteration

                logging.debug(f"Uploading data to table: {table_name}")

                table = Table(table_name, self.metadata, autoload_with=self.engine)
                primary_keys = [col.name for col in table.primary_key.columns]  # Get primary keys

                if not primary_keys:
                    logging.debug("Skipping {table_name}, no primary key detected!")
                    continue

                for record in records:
                    stmt = insert(table).values(**record)
                    upsert_stmt = stmt.on_conflict_do_update(
                        index_elements=primary_keys,  # Conflict resolution based on primary keys
                        set_={col.name: stmt.excluded[col.name] for col in table.columns if col.name not in primary_keys}
                    )

                    conn.execute(upsert_stmt)  # Execute UPSERT           

        # Step 3: Enable foreign key checks
        with admin_engine.connect() as conn:
            conn.execute(text("SET session_replication_role = 'origin'"))
            tables = conn.execute(text(f"SELECT tablename FROM pg_tables WHERE schemaname = '{self.database}'")).fetchall()
            for table in tables:
                conn.execute(text(f"ALTER TABLE {self.database}.{table[0]} ENABLE TRIGGER ALL"))
            print("Foreign key constraints enabled.")
            
        db_password = Install(self.database, self.config["password"], self.config["host"], self.config["port"], self.database, self.config["database"], self.jwt, self.config["password"])
        db_password.update_database_settings(self.database)            
        logging.warning("Data upload completed successfully!")
