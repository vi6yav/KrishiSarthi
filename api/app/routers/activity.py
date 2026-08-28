from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.activity import Activity
from app.models.user import User
from app.services.auth_dependency import get_current_user

router = APIRouter()


class ActivityCreate(BaseModel):
    module: str
    summary: str
    detail: Optional[str] = None


class ActivityOut(BaseModel):
    id: int
    module: str
    summary: str
    detail: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


@router.post("/log")
def log_activity(
    payload: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = Activity(
        user_id=current_user.id,
        module=payload.module,
        summary=payload.summary,
        detail=payload.detail,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return {"status": "logged", "id": activity.id}


@router.get("/recent")
def get_recent_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.created_at.desc())
        .limit(20)
        .all()
    )

    return {
        "activities": [
            {
                "id": a.id,
                "module": a.module,
                "summary": a.summary,
                "detail": a.detail,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in activities
        ]
    }