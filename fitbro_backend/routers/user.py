from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas import UserRead, UserCreate
from ..models import User
from ..database import get_db
from ..dependencies import get_current_user, require_roles

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserRead], dependencies=[Depends(require_roles("FitBro Admin", "FitBro Officer"))])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/", response_model=UserRead, dependencies=[Depends(require_roles("FitBro Admin"))])
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = User(**payload.dict())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
