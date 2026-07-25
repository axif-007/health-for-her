from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/water", tags=["Water"])


@router.get("/today")
def get_today_water(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    logs = db.query(models.WaterLog).filter(
        models.WaterLog.user_id == current_user.id,
        models.WaterLog.date == today
    ).all()
    total = sum(w.amount_ml for w in logs)
    settings = db.query(models.Settings).filter(models.Settings.user_id == current_user.id).first()
    goal = settings.water_goal_ml if settings else 3000.0
    return {
        "total_ml": total,
        "goal_ml": goal,
        "percentage": min(100.0, round((total / goal) * 100, 1)),
        "glasses": int(total / 250),
        "logs": [{"id": l.id, "amount_ml": l.amount_ml, "logged_at": l.logged_at} for l in logs]
    }


@router.post("/add")
def add_water(
    log: schemas.WaterLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    water_log = models.WaterLog(user_id=current_user.id, **log.model_dump())
    db.add(water_log)
    db.commit()
    db.refresh(water_log)
    return {"message": "Water logged 💧", "log_id": water_log.id}


@router.get("/history")
def get_water_history(
    days: int = 7,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    
    labels = []
    amounts = []
    
    for i in range(days):
        d = start_date + timedelta(days=i)
        logs = db.query(models.WaterLog).filter(
            models.WaterLog.user_id == current_user.id,
            models.WaterLog.date == d
        ).all()
        total = sum(w.amount_ml for w in logs)
        labels.append(d.strftime("%a %d"))
        amounts.append(total)
    
    return {"labels": labels, "amounts": amounts}
