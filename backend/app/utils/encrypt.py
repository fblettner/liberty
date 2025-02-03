import os
import base64
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from app.utils.jwt import JWT

class Encryption:
    def __init__(self, jwt: JWT):
        self.jwt = jwt

    def encrypt_text(self, text):
        masterkey = self.jwt.get_secret_key("MASTER_KEY").encode("utf-8") 
        ENCRYPTION_PREFIX = "ENC:"

        if text.startswith(ENCRYPTION_PREFIX):
            # Remove the prefix
            return text    

        # random initialization vector
        iv = os.urandom(16)
        
        # random salt
        salt = os.urandom(64)
        
        # derive encryption key: 32 byte key length
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA512(),
            length=32,
            salt=salt,
            iterations=2145,
            backend=default_backend()
        )
        key = kdf.derive(masterkey)
        
        # AES 256 GCM Mode
        encryptor = Cipher(
            algorithms.AES(key),
            modes.GCM(iv),
            backend=default_backend()
        ).encryptor()
        
        # encrypt the given text
        encrypted = encryptor.update(text.encode('utf-8')) + encryptor.finalize()
        
        # extract the auth tag
        tag = encryptor.tag
        
        # generate output
        encryptedData = base64.b64encode(salt + iv + tag + encrypted).decode('utf-8')
        return ENCRYPTION_PREFIX + encryptedData

    def decrypt_text(self, encdata):
        masterkey = self.jwt.get_secret_key("MASTER_KEY").encode("utf-8") 
        ENCRYPTION_PREFIX = "ENC:"

        if encdata.startswith(ENCRYPTION_PREFIX):
            # Remove the prefix
            encdata = encdata[len(ENCRYPTION_PREFIX):]
        else:
            raise ValueError("Data is not encrypted or has an invalid format.")
        # base64 decoding
        b_data = base64.b64decode(encdata)
        
        # convert data to buffers
        salt = b_data[:64]
        iv = b_data[64:80]
        tag = b_data[80:96]
        text = b_data[96:]
        
        # derive key using; 32 byte key length
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA512(),
            length=32,
            salt=salt,
            iterations=2145,
            backend=default_backend()
        )
        key = kdf.derive(masterkey)
        
        # AES 256 GCM Mode
        decryptor = Cipher(
            algorithms.AES(key),
            modes.GCM(iv, tag),
            backend=default_backend()
        ).decryptor()
        
        # decrypt the given text
        decrypted = decryptor.update(text) + decryptor.finalize()
        
        return decrypted.decode('utf-8')