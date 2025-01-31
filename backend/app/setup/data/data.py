import os
from pathlib import Path

# Get the base directory of the package
BASE_DIR = Path(__file__).resolve().parent

# Define paths to configuration files
DATA_PATH = BASE_DIR 

def get_data_path():
    """Return the absolute path """
    return str(DATA_PATH)