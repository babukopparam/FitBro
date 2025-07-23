from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class AssessmentTemplate(Base):
    __tablename__ = "assessment_templates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    template_json = Column(Text, nullable=False)  # JSON string: list of attributes
    gym_id = Column(Integer, ForeignKey("gyms.id"), nullable=True)  # Null for FitBro master templates
    is_master = Column(Boolean, default=True)
    # Optionally: gym = relationship("Gym")
