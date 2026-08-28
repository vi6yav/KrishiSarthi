from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

# bcrypt is the actual hashing algorithm; passlib gives us a clean interface to it
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In a real production app this would come from an environment variable,
# never hardcoded. Fine for local hackathon development.
SECRET_KEY = "krishisarthi-dev-secret-change-this-later"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # tokens stay valid for 24 hours


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)