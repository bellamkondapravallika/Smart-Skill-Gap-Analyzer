from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class OAuthLoginRequest(BaseModel):
    provider: str # "google" | "github"
    code: Optional[str] = None
    access_token: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    target_role: Optional[str] = "Frontend Developer"
    experience_level: Optional[str] = "1–2 years"
    goals: Optional[List[str]] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class OAuthStatusResponse(BaseModel):
    google_configured: bool
    github_configured: bool
