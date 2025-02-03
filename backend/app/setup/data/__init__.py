import os
from pathlib import Path

# Get the base directory of the package
BASE_DIR = Path(__file__).resolve().parent

# Define paths to configuration files
DATA_PATH = BASE_DIR 

def get_data_path(database):
    """Return the absolute path to database dump file"""
    return str(BASE_DIR / f"{database}.json")