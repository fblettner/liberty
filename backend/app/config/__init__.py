import os
from pathlib import Path

# Get the base directory of the package
BASE_DIR = Path(__file__).resolve().parent

# Define paths to configuration files
DB_PROPERTIES_PATH = BASE_DIR / "db.properties"

def get_db_properties_path():
    """Return the absolute path to db.properties"""
    return str(DB_PROPERTIES_PATH)