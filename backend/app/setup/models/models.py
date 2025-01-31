import os
from pathlib import Path

# Get the base directory of the package
BASE_DIR = Path(__file__).resolve().parent

# Define paths to configuration files
MODELS_PATH = BASE_DIR 

def get_models_path():
    """Return the absolute path """
    return str(MODELS_PATH)