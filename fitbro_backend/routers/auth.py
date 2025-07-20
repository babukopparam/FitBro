# fitbro_backend/routers/auth.py

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta

from ..models import User
from ..database import get_db
from ..config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_HOURS

router = APIRouter()

@router.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.mobile == form_data.username).first()
    if not user or user.password != form_data.password:
        raise HTTPException(status_code=401, detail="Invalid mobile or password")
    token_data = {
        "sub": user.mobile,
        "role": user.role.value,   # <<--- FIXED
        "name": user.name,
        "exp": int((datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)).timestamp())
    }
    print("-------------------------USING SECRET KEY:", SECRET_KEY)
    print("-------------------------USING ALGORITHM:", ALGORITHM)
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.value,    # <<--- FIXED
        "name": user.name
    }
