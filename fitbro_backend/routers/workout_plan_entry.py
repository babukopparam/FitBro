from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ..schemas.workout_plan_entry import (
    WorkoutPlanEntryCreate, WorkoutPlanEntryRead, WorkoutPlanEntryUpdate
)
from ..models.workout_plan_entry import WorkoutPlanEntry
from ..database import get_db

router = APIRouter(
    prefix="/workout-plan-entries",
    tags=["workout-plan-entries"]
)

@router.post("/", response_model=WorkoutPlanEntryRead)
def create_entry(payload: WorkoutPlanEntryCreate, db: Session = Depends(get_db)):
    obj = WorkoutPlanEntry(**payload.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/", response_model=List[WorkoutPlanEntryRead])
def list_entries(
    member_id: Optional[int] = None,
    cycle_plan_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    q = db.query(WorkoutPlanEntry)
    if cycle_plan_id:
        q = q.filter(WorkoutPlanEntry.cycle_plan_id == cycle_plan_id)
    if member_id:
        from ..models.cycle_plan import CyclePlan
        q = q.join(CyclePlan, WorkoutPlanEntry.cycle_plan_id == CyclePlan.id).filter(CyclePlan.member_id == member_id)
    return q.all()

@router.get("/{entry_id}", response_model=WorkoutPlanEntryRead)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(WorkoutPlanEntry).filter(WorkoutPlanEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@router.put("/{entry_id}", response_model=WorkoutPlanEntryRead)
def update_entry(entry_id: int, payload: WorkoutPlanEntryUpdate, db: Session = Depends(get_db)):
    entry = db.query(WorkoutPlanEntry).filter(WorkoutPlanEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(WorkoutPlanEntry).filter(WorkoutPlanEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"ok": True}

# In your FastAPI backend
@router.post("/swap-workout-day")
def swap_workout_day(cycle_plan_id: int, from_date: str, to_date: str, db: Session = Depends(get_db)):
    # Fetch all entries for from_date and to_date (for this cycle_plan_id)
    entries_from = db.query(WorkoutPlanEntry).filter(
        WorkoutPlanEntry.cycle_plan_id == cycle_plan_id,
        WorkoutPlanEntry.day_date == from_date
    ).all()
    entries_to = db.query(WorkoutPlanEntry).filter(
        WorkoutPlanEntry.cycle_plan_id == cycle_plan_id,
        WorkoutPlanEntry.day_date == to_date
    ).all()
    # Swap the dates
    for e in entries_from:
        e.day_date = "__SWAP_TEMP__"
    for e in entries_to:
        e.day_date = from_date
    for e in entries_from:
        e.day_date = to_date
    db.commit()
    return {"status": "success"}
