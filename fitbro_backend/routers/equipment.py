from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas import EquipmentRead, EquipmentCreate
from ..models import Equipment
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/equipment", tags=["Equipment"])

@router.get("/", response_model=List[EquipmentRead])
def list_equipment(db: Session = Depends(get_db)):
    return db.query(Equipment).all()

@router.post("/", response_model=EquipmentRead)
def create_equipment(payload: EquipmentCreate, db: Session = Depends(get_db)):
    obj = Equipment(**payload.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
