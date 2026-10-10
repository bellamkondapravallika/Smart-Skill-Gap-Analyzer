from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True) # nullable for OAuth
    oauth_provider = Column(String, nullable=True)  # "google", "github", or None
    target_role = Column(String, default="Frontend Developer")
    experience_level = Column(String, default="1–2 years")
    goals = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    target_jobs = relationship("TargetJob", back_populates="user", cascade="all, delete-orphan")
