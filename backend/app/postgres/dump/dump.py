import os
from pathlib import Path

# Get the base directory of the package
BASE_DIR = Path(__file__).resolve().parent

# Define paths to configuration files
LOGS_TEXT_PATH = BASE_DIR / "logs-frontend-text.log"
LOGS_JSON_PATH = BASE_DIR / "logs-frontend-json.log"


def get_dump_path(database):
    """Return the absolute path to database dump file"""
    return str(BASE_DIR / f"{database}.dump")

