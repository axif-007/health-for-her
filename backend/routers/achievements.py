from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/achievements", tags=["Achievements"])


@router.get("/", response_model=List[schemas.AchievementOut])
def get_achievements(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Achievement).filter(
        models.Achievement.user_id == current_user.id
    ).order_by(models.Achievement.unlocked_at.desc()).all()


@router.post("/unlock")
def unlock_achievement(
    title: str,
    description: str = None,
    icon: str = "⭐",
    badge_type: str = "badge",
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Avoid duplicates
    existing = db.query(models.Achievement).filter(
        models.Achievement.user_id == current_user.id,
        models.Achievement.title == title
    ).first()
    if existing:
        return {"message": "Already unlocked", "achievement": schemas.AchievementOut.model_validate(existing)}
    
    achievement = models.Achievement(
        user_id=current_user.id,
        title=title,
        description=description,
        icon=icon,
        badge_type=badge_type
    )
    db.add(achievement)
    db.commit()
    db.refresh(achievement)
    return {"message": "Achievement unlocked! 🎉", "achievement": schemas.AchievementOut.model_validate(achievement)}
