import os
from pathlib import Path

# Get the base directory of the package
BASE_DIR = Path(__file__).resolve().parent

# Define paths to configuration files
CONFIG_PATH = BASE_DIR 

def get_config_path():
    """Return the absolute path to db.properties"""
    return str(CONFIG_PATH)

