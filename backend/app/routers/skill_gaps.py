from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.resume import Resume
from ..models.job import TargetJob
from ..utils.security import get_current_user

router = APIRouter(prefix="/skill-gaps", tags=["Skill Gaps"])

@router.get("/{resume_id}")
def get_skill_gaps(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found."
        )

    # Check for target job
    target_job = db.query(TargetJob).filter(
        TargetJob.resume_id == resume.id
    ).order_by(TargetJob.id.desc()).first()

    if not target_job:
        return {
            "hasTargetJob": False,
            "message": "No target job added yet. Add a job description to calculate personalized skill gaps.",
            "detectedSkills": resume.detected_skills or {},
            "skillGaps": []
        }

    return {
        "hasTargetJob": True,
        "jobTitle": target_job.job_title,
        "company": target_job.company,
        "overallMatch": target_job.overall_match,
        "matchedSkills": target_job.matched_skills or [],
        "missingSkills": target_job.missing_skills or [],
        "partialMatches": target_job.partial_matches or [],
        "skillGaps": target_job.skill_gaps or [],
        "detectedSkills": resume.detected_skills or {}
    }
