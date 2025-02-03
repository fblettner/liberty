import os
from pathlib import Path

# Get the base directory of the package
BASE_DIR = Path(__file__).resolve().parent

# Define paths to configuration files
INI_PATH = BASE_DIR / "files/liberty.ini"
DB_PROPERTIES_PATH = BASE_DIR / "files/db.properties"
SECRETS_FILE = BASE_DIR / "files/secrets.json"
ENCRYPTED_SECRETS_FILE = BASE_DIR /  "files/secrets.json.enc"
KEY_FILE = BASE_DIR /  "files/encryption.key"

def get_ini_path():
    return str(INI_PATH)

def get_db_properties_path():
    return str(DB_PROPERTIES_PATH)

def get_secrets_path():
    return str(SECRETS_FILE)

def get_encrypted_path():
    return str(ENCRYPTED_SECRETS_FILE)

def get_key_path():
    return str(KEY_FILE)
