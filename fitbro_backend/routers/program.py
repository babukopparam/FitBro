from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..schemas import ProgramRead, ProgramCreate
from ..models import Program, Workout
from ..database import get_db
from ..dependencies import require_roles

router = APIRouter(
    prefix="/programs",
    tags=["Programs"]
)

# List all programs
@router.get("/", response_model=List[ProgramRead])
def list_programs(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(
        "FitBro Admin", "FitBro Officer", "Gym Owner", "Gym Instructor", "Gym Officer", "Gym Member"
    ))
):
    return db.query(Program).all()

# Get single program
@router.get("/{program_id}", response_model=ProgramRead)
def get_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(
        "FitBro Admin", "FitBro Officer", "Gym Owner", "Gym Instructor", "Gym Officer", "Gym Member"
    ))
):
    program = db.query(Program).get(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program

# Create program - Correctly maps workout IDs to ORM objects
@router.post("/", response_model=ProgramRead)
def create_program(
    payload: ProgramCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("FitBro Admin", "Gym Owner", "Gym Instructor"))
):
    data = payload.dict(exclude_unset=True)
    workout_ids = data.pop("workouts", [])
    obj = Program(**data)

    # Correctly map workout IDs to ORM objects
    if workout_ids:
        workouts = db.query(Workout).filter(Workout.id.in_(workout_ids)).all()
        obj.workouts = workouts

    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

# Update program - Correctly updates workout associations
@router.put("/{program_id}", response_model=ProgramRead)
def update_program(
    program_id: int,
    payload: ProgramCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("FitBro Admin", "Gym Owner", "Gym Instructor"))
):
    program = db.query(Program).get(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    data = payload.dict(exclude_unset=True)
    workout_ids = data.pop("workouts", None)

    for k, v in data.items():
        setattr(program, k, v)

    if workout_ids is not None:
        # If workouts explicitly provided, update association
        workouts = db.query(Workout).filter(Workout.id.in_(workout_ids)).all() if workout_ids else []
        program.workouts = workouts

    db.commit()
    db.refresh(program)
    return program

# Delete program
@router.delete("/{program_id}")
def delete_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("FitBro Admin", "Gym Owner", "Gym Instructor"))
):
    program = db.query(Program).get(program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    db.delete(program)
    db.commit()
    return {"ok": True}
