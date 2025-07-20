# routers/gym.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..schemas.gym import GymRead, GymCreate, GymUpdate, GymAssignOwner
from ..models.gym import Gym
from ..models.user import User, RoleEnum
from ..database import get_db
from ..dependencies import require_roles
import shutil
import os

router = APIRouter(prefix="/gyms", tags=["Gyms"])

UPLOAD_DIR = "static/logos/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# List all gyms
@router.get("/", response_model=List[GymRead], dependencies=[Depends(require_roles("FitBro Admin", "FitBro Officer"))])
def list_gyms(db: Session = Depends(get_db)):
    return db.query(Gym).all()

# Get gym by ID
@router.get("/{gym_id}", response_model=GymRead, dependencies=[Depends(require_roles("FitBro Admin", "FitBro Officer", "Gym Owner"))])
def get_gym(gym_id: int, db: Session = Depends(get_db)):
    gym = db.query(Gym).get(gym_id)
    if not gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    return gym

# Create gym and owner user
@router.post("/", response_model=GymRead, dependencies=[Depends(require_roles("FitBro Admin"))])
def create_gym(payload: GymCreate, db: Session = Depends(get_db)):
    # Check if a gym with this name exists
    if db.query(Gym).filter(Gym.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Gym with this name already exists.")
    # Check if a user with this mobile exists
    if db.query(User).filter(User.mobile == payload.owner_mobile).first():
        raise HTTPException(status_code=400, detail="User with this mobile already exists.")

    gym = Gym(
        name=payload.name,
        address=payload.address,
        contract_start=payload.contract_start,
        contract_end=payload.contract_end,
        recurring_revenue_start=payload.recurring_revenue_start,
        owner_mobile=payload.owner_mobile,
        owner_name=payload.owner_name,     # <--- ADDED
        owner_email=payload.owner_email,   # <--- ADDED
        is_active=True,
        logo_url=None
    )
    db.add(gym)
    db.commit()
    db.refresh(gym)

    # Now create the gym owner user with default password 123456
    owner_user = User(
        name=payload.owner_name,
        mobile=payload.owner_mobile,
        email=payload.owner_email,
        password="123456",  # plain text, matches your login check
        role=RoleEnum.GYM_OWNER,
        gym_id=gym.id,
        is_active=True
    )
    db.add(owner_user)
    db.commit()
    db.refresh(owner_user)
    return gym

# Update gym
@router.put("/{gym_id}", response_model=GymRead, dependencies=[Depends(require_roles("FitBro Admin", "Gym Owner"))])
def update_gym(gym_id: int, payload: GymUpdate, db: Session = Depends(get_db)):
    gym = db.query(Gym).get(gym_id)
    if not gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(gym, k, v)
    db.commit()
    db.refresh(gym)
    return gym

# Assign/Reassign owner
@router.put("/{gym_id}/assign_owner", response_model=GymRead, dependencies=[Depends(require_roles("FitBro Admin"))])
def assign_owner(gym_id: int, payload: GymAssignOwner, db: Session = Depends(get_db)):
    gym = db.query(Gym).get(gym_id)
    if not gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    gym.owner_mobile = payload.owner_mobile
    db.commit()
    db.refresh(gym)
    # [Backlog] Optionally, trigger invitation or notification to new owner
    return gym

# Upload logo
@router.post("/{gym_id}/upload_logo", response_model=GymRead, dependencies=[Depends(require_roles("FitBro Admin", "Gym Owner"))])
def upload_logo(gym_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    gym = db.query(Gym).get(gym_id)
    if not gym:
        raise HTTPException(status_code=404, detail="Gym not found")
    filename = f"gym_{gym_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    gym.logo_url = f"/{UPLOAD_DIR}{filename}".replace("\\", "/")
    db.commit()
    db.refresh(gym)
    return gym
