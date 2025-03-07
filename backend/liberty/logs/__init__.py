import os
from pathlib import Path

# Get the base directory of the package
BASE_DIR = Path(__file__).resolve().parent

# Define paths to configuration files
LOGS_TEXT_PATH = BASE_DIR / "files/logs-frontend-text.log"
LOGS_JSON_PATH = BASE_DIR / "files/logs-frontend-json.log"


def get_logs_text_path():
    """Return the absolute path to logs-frontend-text.log"""
    return str(LOGS_TEXT_PATH)

def get_logs_json_path():
    """Return the absolute path to logs-frontend-json.log"""
    return str(LOGS_JSON_PATH)