from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas import WorkoutLogRead, WorkoutLogCreate, WorkoutLogUpdate
from ..models import WorkoutLog
from ..database import get_db

router = APIRouter(prefix="/workout-logs", tags=["WorkoutLogs"])

@router.get("/", response_model=List[WorkoutLogRead])
def list_logs(db: Session = Depends(get_db)):
    return db.query(WorkoutLog).all()

@router.post("/", response_model=WorkoutLogRead)
def create_log(payload: WorkoutLogCreate, db: Session = Depends(get_db)):
    log = WorkoutLog(**payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.patch("/{log_id}", response_model=WorkoutLogRead)
def update_log(log_id: int, payload: WorkoutLogUpdate, db: Session = Depends(get_db)):
    log = db.query(WorkoutLog).get(log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(log, k, v)
    db.commit()
    db.refresh(log)
    return log
