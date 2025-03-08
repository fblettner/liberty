import logging

from liberty.framework.config import get_encrypted_path, get_key_path, get_secrets_path
logger = logging.getLogger(__name__)
from fastapi import  Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt  # PyJWT
from datetime import datetime, timedelta, timezone
from pathlib import Path
from cryptography.fernet import Fernet
import os
import json

SECRETS_FILE = get_secrets_path()
ENCRYPTED_SECRETS_FILE = get_encrypted_path()
KEY_FILE = get_key_path()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 240
oauth2_scheme = HTTPBearer()

class JWT:

    def __init__(self):
        # OAuth2 schema
        self.init_encryption_files()

    def init_encryption_files(self):
        if not Path(ENCRYPTED_SECRETS_FILE).exists():
            self.create_secrets_file(SECRETS_FILE)

        # Generate the encryption key if it doesn't exist
        if not Path(KEY_FILE).exists():
            key = self.generate_key(KEY_FILE)
        else:
            with open(KEY_FILE, "rb") as f:
                key = f.read()

        # Encrypt the secrets file if the encrypted file doesn’t exist
        if not Path(ENCRYPTED_SECRETS_FILE).exists():
            self.encrypt_secrets(SECRETS_FILE, ENCRYPTED_SECRETS_FILE, key)
            os.remove(SECRETS_FILE)
        else:
            logging.warning("Encrypted secrets already exist. Decrypting...")

    # Set file permissions (Read/Write for owner only: 600)
    def set_secure_permissions(self, file_path: str):
        os.chmod(file_path, 0o600)  # Owner can read/write, no permissions for group/others

    # Step 1: Generate an encryption key
    def generate_key(self, key_file: str):
        key = Fernet.generate_key()
        with open(key_file, "wb") as f:
            f.write(key)
        self.set_secure_permissions(key_file)
        logging.warning(f"Encryption key saved and permissions secured: {key_file}")
        return key

    # Step 2: Create secrets.json if it doesn't exist
    def create_secrets_file(self, secrets_file: str):
        default_secrets = {
            "SECRET_KEY": Fernet.generate_key().decode(),  
            "MASTER_KEY": "3zTvzr3p67VC61jmV54rIYu1545x4TlY",  
        }
        with open(secrets_file, "w") as f:
            json.dump(default_secrets, f, indent=4)
        self.set_secure_permissions(secrets_file)
        logging.warning(f"Created default secrets file: {secrets_file}")

    # Step 3: Encrypt secrets file
    def encrypt_secrets(self, secrets_file: str, encrypted_file: str, key: bytes):
        with open(secrets_file, "r") as f:
            secrets = f.read()
        fernet = Fernet(key)
        encrypted_secrets = fernet.encrypt(secrets.encode())
        with open(encrypted_file, "wb") as f:
            f.write(encrypted_secrets)
        self.set_secure_permissions(encrypted_file)
        logging.warning(f"Secrets encrypted and saved: {encrypted_file}")

    # Step 4: Decrypt secrets at runtime
    def decrypt_secrets(self, encrypted_file: str, key_file: str):
        with open(key_file, "rb") as f:
            key = f.read()
        fernet = Fernet(key)

        with open(encrypted_file, "rb") as f:
            encrypted_secrets = f.read()
        decrypted_secrets = fernet.decrypt(encrypted_secrets).decode()
        return json.loads(decrypted_secrets)


    # Decrypt and load the secrets
    def get_secret_key(self, key):
        secrets = self.decrypt_secrets(ENCRYPTED_SECRETS_FILE, KEY_FILE)
        return secrets.get(key)

    # Generate a token
    def create_access_token(self, data: dict, expires_delta: timedelta | None = None):
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})

        return jwt.encode(to_encode, self.get_secret_key("SECRET_KEY"), algorithm=ALGORITHM)


    # Dependency to verify token
    def is_valid_jwt(self, token: HTTPAuthorizationCredentials = Depends(oauth2_scheme)):
        try:
            token_str = token.credentials
            payload = jwt.decode(token_str, self.get_secret_key("SECRET_KEY"), algorithms=[ALGORITHM])
            user: str = payload.get("sub")
            if user is None:
                raise HTTPException(status_code=401, detail="Invalid token")
            return user
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
