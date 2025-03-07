import os
from pathlib import Path

# Get the base directory of the package
BASE_DIR = Path(__file__).resolve().parent


def get_dump_path(database):
    """Return the absolute path to database dump file"""
    return str(BASE_DIR / f"{database}.dump")
