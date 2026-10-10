from .auth import router as auth_router
from .resumes import router as resumes_router
from .jobs import router as jobs_router
from .skill_gaps import router as skill_gaps_router
from .roadmap import router as roadmap_router
from .interview import router as interview_router

__all__ = [
    "auth_router",
    "resumes_router",
    "jobs_router",
    "skill_gaps_router",
    "roadmap_router",
    "interview_router"
]
