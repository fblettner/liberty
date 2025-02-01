import logging
logger = logging.getLogger(__name__)

from backend.app.config import get_db_properties_path
from backend.app.controllers.api_controller import ApiController
from backend.app.setup.data.data import get_data_path
import json
import datetime
import os
from sqlalchemy import create_engine, MetaData, Table


EXCLUDED_TABLES = {"databasechangelog", "databasechangeloglock"}  # Add tables to exclude

# Custom JSON Encoder to Convert Dates
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime.datetime, datetime.date)):
            return obj.isoformat()  # Convert datetime to string
        return super().default(obj)

class Dump: 
    def __init__(self, apiController: ApiController, database):
        db_properties_path = get_db_properties_path()
        config = apiController.queryRest.load_db_properties(db_properties_path)
        self.database = database

        # Database configuration
        DATABASE_URL = f"postgresql+psycopg2://{database}:{config["password"]}@{config["host"]}:{config["port"]}/{database}"

        try:
            self.engine = create_engine(DATABASE_URL, echo=False)
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
                logging.warning(f"Skipping table: {table_name}")
                continue  # Skip this iteration

            logging.warning(f"Extracting data from table: {table_name}")
            
            # Reflect table
            mapped_table = Table(table_name, self.metadata, autoload_with=self.engine)
            
            # Fetch all rows
            with self.engine.connect() as connection:
                result = connection.execute(mapped_table.select())
                rows = [dict(row) for row in result.mappings()]
            
            # Store data in dictionary
            all_data[table_name] = rows

        # Save to JSON file with DateTimeEncoder
        with open(os.path.join(os.path.dirname(__file__),f"{get_data_path()}/{self.database}.json"), "w", encoding="utf-8") as json_file:
            json.dump(all_data, json_file, indent=4, ensure_ascii=False, cls=DateTimeEncoder)

        logging.warning(f"Data successfully exported to {f"{self.database}.json"}")


    def extract_table_to_json(self, tables):
        """Extract all data from database tables and save to JSON."""

        try:
            all_data = {}
            print(self.metadata.tables.items())
            for table_name in tables:
                logging.warning(f"Extracting data from table: {table_name}")
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
            with open(os.path.join(os.path.dirname(__file__),f"{get_data_path()}/{self.database}.json"), "w", encoding="utf-8") as json_file:
                json.dump(all_data, json_file, indent=4, ensure_ascii=False, cls=DateTimeEncoder)

            logging.warning(f"Data successfully exported to {f"{self.database}.json"}")

        except Exception as e:
            logging.error(f"Error processing table {table_name}: {str(e)}")