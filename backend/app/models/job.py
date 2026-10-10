from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, Float
from sqlalchemy.orm import relationship
from ..database import Base

class TargetJob(Base):
    __tablename__ = "target_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True, index=True)

    job_title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    url = Column(String, nullable=True)

    overall_match = Column(Float, nullable=True)
    skill_match = Column(Float, nullable=True)
    keyword_match = Column(Float, nullable=True)
    experience_match = Column(Float, nullable=True)

    matched_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    partial_matches = Column(JSON, default=list)
    skill_gaps = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="target_jobs")
    resume = relationship("Resume", back_populates="target_jobs")
