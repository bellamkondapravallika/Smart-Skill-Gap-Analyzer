from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    file_name = Column(String, nullable=False)
    file_size = Column(String, default="0 KB")
    file_type = Column(String, default="PDF")
    raw_text = Column(Text, nullable=False)
    candidate_name = Column(String, nullable=True)
    target_role = Column(String, default="Software Engineer")

    # Structured Extractions
    contact_info = Column(JSON, default=dict)
    sections = Column(JSON, default=dict)
    detected_skills = Column(JSON, default=dict)
    
    # Analysis & Scores
    scores = Column(JSON, default=dict) # overall, ats, jobMatch, skillsCount, categories
    summary_verdict = Column(Text, nullable=True)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    content_improvements = Column(JSON, default=list)

    # Generated Plan & Prep
    roadmap = Column(JSON, default=list)
    interview_questions = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resumes")
    target_jobs = relationship("TargetJob", back_populates="resume", cascade="all, delete-orphan")
