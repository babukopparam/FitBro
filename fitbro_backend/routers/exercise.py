from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas import ExerciseRead, ExerciseCreate, ExerciseUpdate
from ..models import Exercise
from ..database import get_db
from ..dependencies import get_current_user, require_roles

router = APIRouter(prefix="/exercises", tags=["Exercises"])

@router.get("/", response_model=List[ExerciseRead])
def list_exercises(db: Session = Depends(get_db)):
    return db.query(Exercise).all()

@router.post("/", response_model=ExerciseRead, dependencies=[Depends(require_roles("FitBro Admin", "Gym Owner", "Gym Instructor"))])
def create_exercise(payload: ExerciseCreate, db: Session = Depends(get_db)):
    ex = Exercise(**payload.dict())
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return ex

@router.put("/{exercise_id}", response_model=ExerciseRead, dependencies=[Depends(require_roles("FitBro Admin", "Gym Owner", "Gym Instructor"))])
def update_exercise(exercise_id: int, payload: ExerciseCreate, db: Session = Depends(get_db)):
    ex = db.query(Exercise).get(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(ex, k, v)
    db.commit()
    db.refresh(ex)
    return ex

@router.patch("/{exercise_id}", response_model=ExerciseRead, dependencies=[Depends(require_roles("FitBro Admin", "Gym Owner", "Gym Instructor"))])
def patch_exercise(exercise_id: int, payload: ExerciseUpdate, db: Session = Depends(get_db)):
    ex = db.query(Exercise).get(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    for k, v in payload.dict(exclude_unset=True).items():
        setattr(ex, k, v)
    db.commit()
    db.refresh(ex)
    return ex

@router.delete("/{exercise_id}", status_code=204, dependencies=[Depends(require_roles("FitBro Admin", "Gym Owner", "Gym Instructor"))])
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    ex = db.query(Exercise).get(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    db.delete(ex)
    db.commit()
