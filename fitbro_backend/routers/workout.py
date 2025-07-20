from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas import WorkoutRead, WorkoutCreate
from ..models import Workout
from ..database import get_db
from ..dependencies import get_current_user, require_roles

router = APIRouter(prefix="/workouts", tags=["Workouts"])

@router.get("/", response_model=List[WorkoutRead])
def list_workouts(db: Session = Depends(get_db)):
    return db.query(Workout).all()

@router.post("/", response_model=WorkoutRead, dependencies=[Depends(require_roles("FitBro Admin", "Gym Owner", "Gym Instructor"))])
def create_workout(payload: WorkoutCreate, db: Session = Depends(get_db)):
    try:
        print("-------------------PAYLOAD:", payload.dict())
        workout = Workout(**payload.dict())
        db.add(workout)
        db.commit()
        db.refresh(workout)
        print(" ------------ just created the workout", workout)
        return workout
    except Exception as e:
        print("ERROR in create_workout:", e)
        raise HTTPException(status_code=500, detail=str(e))

