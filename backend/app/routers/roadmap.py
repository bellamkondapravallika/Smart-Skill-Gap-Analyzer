from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.resume import Resume
from ..utils.security import get_current_user

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])

@router.get("/{resume_id}")
def get_roadmap(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    return {
        "resume_id": resume.id,
        "target_role": resume.target_role,
        "roadmap": resume.roadmap or []
    }

@router.put("/{resume_id}/toggle")
def toggle_milestone(
    resume_id: int,
    payload: dict, # { week_id, milestone_id }
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    week_id = payload.get("week_id")
    milestone_id = payload.get("milestone_id")

    updated_roadmap = []
    for week in (resume.roadmap or []):
        if week.get("id") == week_id:
            week_copy = dict(week)
            milestones = []
            for m in week_copy.get("milestones", []):
                m_copy = dict(m)
                if m_copy.get("id") == milestone_id:
                    m_copy["done"] = not m_copy.get("done", False)
                milestones.append(m_copy)
            week_copy["milestones"] = milestones
            week_copy["completed"] = all(m.get("done", False) for m in milestones)
            updated_roadmap.append(week_copy)
        else:
            updated_roadmap.append(week)

    resume.roadmap = updated_roadmap
    db.commit()
    db.refresh(resume)

    return {"message": "Milestone updated", "roadmap": updated_roadmap}
