from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/sleep", tags=["Sleep"])


@router.get("/today")
def get_today_sleep(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    log = db.query(models.SleepLog).filter(
        models.SleepLog.user_id == current_user.id,
        models.SleepLog.date == today
    ).first()
    return log


@router.post("/log", response_model=schemas.SleepLogOut)
def log_sleep(
    sleep_log: schemas.SleepLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.SleepLog).filter(
        models.SleepLog.user_id == current_user.id,
        models.SleepLog.date == sleep_log.date
    ).first()
    if existing:
        for field, value in sleep_log.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    log = models.SleepLog(user_id=current_user.id, **sleep_log.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/history")
def get_sleep_history(
    days: int = 7,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    logs = db.query(models.SleepLog).filter(
        models.SleepLog.user_id == current_user.id,
        models.SleepLog.date >= start_date,
        models.SleepLog.date <= end_date
    ).order_by(models.SleepLog.date).all()

    labels = [(start_date + timedelta(days=i)).strftime("%a") for i in range(days)]
    hours = []
    quality = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        log = next((l for l in logs if l.date == d), None)
        hours.append(log.total_hours if log and log.total_hours else 0)
        quality.append(log.quality if log and log.quality else 0)

    return {"labels": labels, "hours": hours, "quality": quality}
