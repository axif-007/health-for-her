from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/mood", tags=["Mood"])


@router.get("/today")
def get_today_mood(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    log = db.query(models.MoodLog).filter(
        models.MoodLog.user_id == current_user.id,
        models.MoodLog.date == today
    ).first()
    return log


@router.post("/log", response_model=schemas.MoodLogOut)
def log_mood(
    mood_log: schemas.MoodLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.MoodLog).filter(
        models.MoodLog.user_id == current_user.id,
        models.MoodLog.date == mood_log.date
    ).first()
    if existing:
        for field, value in mood_log.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    log = models.MoodLog(user_id=current_user.id, **mood_log.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/history")
def get_mood_history(
    days: int = 7,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    logs = db.query(models.MoodLog).filter(
        models.MoodLog.user_id == current_user.id,
        models.MoodLog.date >= start_date,
        models.MoodLog.date <= end_date
    ).order_by(models.MoodLog.date).all()
    
    mood_map = {"excellent": 5, "happy": 4, "normal": 3, "sad": 2, "weak": 1}
    labels = [(start_date + timedelta(days=i)).strftime("%a") for i in range(days)]
    values = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        log = next((l for l in logs if l.date == d), None)
        values.append(mood_map.get(log.mood, 0) if log else 0)
    
    return {"labels": labels, "values": values, "logs": [schemas.MoodLogOut.model_validate(l).model_dump() for l in logs]}


@router.get("/analytics")
def get_mood_analytics(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(models.MoodLog).filter(models.MoodLog.user_id == current_user.id).all()
    counts = {"excellent": 0, "happy": 0, "normal": 0, "sad": 0, "weak": 0}
    for log in logs:
        if log.mood in counts:
            counts[log.mood] += 1
    return {"counts": counts, "total": len(logs)}
