# schemas/equipment.py - FIXED (Added missing EquipmentUpdate)
from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class EquipmentBase(BaseModel):
    name: str
    category: Optional[str]
    manufacturer: Optional[str]

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentRead(EquipmentBase):
    id: int

    class Config:
        orm_mode = True

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None

class GymEquipmentBase(BaseModel):
    equipment_id: int
    bought_date: Optional[date]
    valid_before: Optional[date]
    status: Optional[str]

class GymEquipmentCreate(GymEquipmentBase):
    gym_id: int

class GymEquipmentRead(GymEquipmentBase):
    id: int
    gym_id: int

    class Config:
        orm_mode = True

class GymEquipmentUpdate(BaseModel):
    equipment_id: Optional[int] = None
    bought_date: Optional[date] = None
    valid_before: Optional[date] = None
    status: Optional[str] = None