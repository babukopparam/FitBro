# fitbro_backend/jwt_handler.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from .config import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        print(" ------------ inside get_current_user, token: -----------", token)
        print("-------------------------USING SECRET KEY:", SECRET_KEY)
        print("-------------------------USING ALGORITHM:", ALGORITHM)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("DEBUG - Decoded payload:", payload)
        mobile = payload.get("sub")
        role = payload.get("role")
        name = payload.get("name")
        if mobile is None or role is None:
            raise credentials_exception
        return {"mobile": mobile, "role": role, "name": name}
    except JWTError as e:
        print("JWT decode error:", e)
        raise credentials_exception
