from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/symptoms", tags=["Symptoms"])


@router.post("/log", response_model=schemas.SymptomLogOut)
def log_symptoms(
    symptom_log: schemas.SymptomLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_id == current_user.id,
        models.SymptomLog.date == symptom_log.date
    ).first()
    if existing:
        for field, value in symptom_log.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing
    log = models.SymptomLog(user_id=current_user.id, **symptom_log.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/today")
def get_today_symptoms(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    return db.query(models.SymptomLog).filter(
        models.SymptomLog.user_id == current_user.id,
        models.SymptomLog.date == today
    ).first()


@router.get("/history")
def get_symptom_history(
    days: int = 7,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    logs = db.query(models.SymptomLog).filter(
        models.SymptomLog.user_id == current_user.id,
        models.SymptomLog.date >= start_date,
        models.SymptomLog.date <= end_date
    ).order_by(models.SymptomLog.date.desc()).all()
    return logs
