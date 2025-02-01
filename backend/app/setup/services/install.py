import logging

from backend.app.setup.data.data import get_data_path
logger = logging.getLogger(__name__)
import json
import datetime
import os
from sqlalchemy import create_engine, MetaData, Table, text
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
    def __init__(self, user, password, host, port, database):
        self.database = database
        self.DATABASE_URL = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
        self.engine = create_engine(self.DATABASE_URL, echo=False, isolation_level="AUTOCOMMIT") 
        self.metadata = MetaData()
        self.metadata.reflect(bind=self.engine)

    def upload_json_to_database(self, database):        
        # Load JSON data
        with open(os.path.join(os.path.dirname(__file__),f"{get_data_path()}/{database}.json"), "r", encoding="utf-8") as file:
            data = json.load(file)

        with self.engine.begin() as conn:
            # 🚀 Step 1: Disable Foreign Keys Temporarily
            conn.execute(text("SET session_replication_role = 'replica';"))

            # 🚀 Step 2: Insert Data into Tables
            for table_name, records in data.items():
                if table_name in EXCLUDED_TABLES:
                    logging.warning(f"Skipping table: {table_name}")
                    continue  # Skip this iteration

                logging.warning(f"Uploading data to table: {table_name}")

                table = Table(table_name, self.metadata, autoload_with=self.engine)
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