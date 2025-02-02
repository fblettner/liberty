import os
import subprocess
from fastapi import HTTPException

ALEMBIC_CONFIG = "alembic.ini"  # Adjust if needed

def alembic_upgrade():
    """Run Alembic upgrade to the latest version."""
    try:
        result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True, check=True)
        return {"message": "Database upgraded successfully!", "output": result.stdout}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Alembic upgrade failed: {e.stderr}")

def alembic_downgrade(version: str):
    """Downgrade the database to a specific version."""
    try:
        result = subprocess.run(["alembic", "downgrade", version], capture_output=True, text=True, check=True)
        return {"message": f"Database downgraded to {version}!", "output": result.stdout}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Alembic downgrade failed: {e.stderr}")

def alembic_revision(message: str):
    """Generate a new Alembic migration with a message."""
    try:
        result = subprocess.run(["alembic", "revision", "--autogenerate", "-m", message], capture_output=True, text=True, check=True)
        return {"message": "Alembic migration created!", "output": result.stdout}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Alembic revision failed: {e.stderr}")

def alembic_current():
    """Get the current Alembic migration version."""
    try:
        result = subprocess.run(["alembic", "current"], capture_output=True, text=True, check=True)
        unique_versions = sorted(set(result.stdout.strip().split("\n")))

        return {
            "message": "Current Alembic versions fetched!",
            "versions": unique_versions,  # Return a clean list
        }
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Alembic current failed: {e.stderr}")