from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("/", response_model=schemas.SettingsOut)
def get_settings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(models.Settings).filter(models.Settings.user_id == current_user.id).first()
    if not settings:
        settings = models.Settings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/", response_model=schemas.SettingsOut)
def update_settings(
    update: schemas.SettingsUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(models.Settings).filter(models.Settings.user_id == current_user.id).first()
    if not settings:
        settings = models.Settings(user_id=current_user.id)
        db.add(settings)
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return settings
