from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/recovery", tags=["Recovery"])


@router.post("/log", response_model=schemas.RecoveryLogOut)
def log_recovery(
    recovery_log: schemas.RecoveryLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.RecoveryLog).filter(
        models.RecoveryLog.user_id == current_user.id,
        models.RecoveryLog.date == recovery_log.date
    ).first()
    if existing:
        for field, value in recovery_log.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing
    log = models.RecoveryLog(user_id=current_user.id, **recovery_log.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/today")
def get_today_recovery(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    return db.query(models.RecoveryLog).filter(
        models.RecoveryLog.user_id == current_user.id,
        models.RecoveryLog.date == today
    ).first()


@router.get("/history")
def get_recovery_history(
    days: int = 30,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    logs = db.query(models.RecoveryLog).filter(
        models.RecoveryLog.user_id == current_user.id,
        models.RecoveryLog.date >= start_date,
        models.RecoveryLog.date <= end_date
    ).order_by(models.RecoveryLog.date).all()

    labels = [str(l.date) for l in logs]
    return {
        "labels": labels,
        "recovery": [l.recovery_percentage for l in logs],
        "energy": [l.energy_level for l in logs],
        "strength": [l.strength_level for l in logs],
        "temperature": [l.temperature for l in logs],
        "weight": [l.weight for l in logs],
    }
