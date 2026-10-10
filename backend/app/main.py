from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, resumes, jobs, skill_gaps, roadmap, interview

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Skill Gap Analyzer API",
    description="Production-grade Resume & Career Intelligence Platform Backend",
    version="2.0.0"
)

# CORS configuration to allow local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(skill_gaps.router, prefix="/api")
app.include_router(roadmap.router, prefix="/api")
app.include_router(interview.router, prefix="/api")

# Direct alias for /api/resume/improve-bullet (Requirement 21)
from .routers.resumes import api_improve_bullet, api_improve_project
from .schemas.resume import ImproveBulletResponse
app.post("/api/resume/improve-bullet", response_model=ImproveBulletResponse, tags=["Resumes"])(api_improve_bullet)
app.post("/api/resume/improve-project", tags=["Resumes"])(api_improve_project)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Smart Skill Gap Analyzer API",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
