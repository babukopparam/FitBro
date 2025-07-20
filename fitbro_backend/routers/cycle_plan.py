from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas.cycle_plan import CyclePlanCreate, CyclePlanUpdate, CyclePlanRead
from ..models.cycle_plan import CyclePlan
from ..database import get_db

router = APIRouter(prefix="/cycle-plans", tags=["Cycle Plans"])

@router.get("/", response_model=List[CyclePlanRead])
def list_cycle_plans(member_id: int = None, db: Session = Depends(get_db)):
    q = db.query(CyclePlan).filter(CyclePlan.is_deleted == False)
    if member_id:
        q = q.filter(CyclePlan.member_id == member_id)
    return q.all()

@router.post("/", response_model=CyclePlanRead)
def create_cycle_plan(payload: CyclePlanCreate, db: Session = Depends(get_db)):
    # Only one active per member
    if payload.status == "Active":
        exists = db.query(CyclePlan).filter(
            CyclePlan.member_id == payload.member_id,
            CyclePlan.status == "Active",
            CyclePlan.is_deleted == False
        ).first()
        if exists:
            raise HTTPException(400, "Member already has an active cycle")
    obj = CyclePlan(**payload.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{cycle_id}", response_model=CyclePlanRead)
def update_cycle_plan(cycle_id: int, payload: CyclePlanUpdate, db: Session = Depends(get_db)):
    obj = db.query(CyclePlan).filter(CyclePlan.id == cycle_id, CyclePlan.is_deleted == False).first()
    if not obj:
        raise HTTPException(404, "Not found")
    # Only one active per member
    if payload.status == "Active":
        exists = db.query(CyclePlan).filter(
            CyclePlan.member_id == payload.member_id,
            CyclePlan.status == "Active",
            CyclePlan.id != cycle_id,
            CyclePlan.is_deleted == False
        ).first()
        if exists:
            raise HTTPException(400, "Member already has an active cycle")
    for k, v in payload.dict().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{cycle_id}/delete", response_model=CyclePlanRead)
def soft_delete_cycle_plan(cycle_id: int, db: Session = Depends(get_db)):
    obj = db.query(CyclePlan).filter(CyclePlan.id == cycle_id).first()
    if not obj:
        raise HTTPException(404, "Not found")
    obj.is_deleted = True
    db.commit()
    db.refresh(obj)
    return obj
