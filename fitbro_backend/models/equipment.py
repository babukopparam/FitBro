from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    gym_id = Column(Integer, ForeignKey("gyms.id", ondelete="CASCADE"), nullable=True)
    manufacturer = Column(String(64), nullable=True)
    purchase_date = Column(Date, nullable=True)
    warranty_years = Column(Integer, nullable=True)
    status = Column(String(32), default="active")

    # Relationships
    exercises = relationship("Exercise", back_populates="equipment")
    gym = relationship("Gym", back_populates="equipment")
