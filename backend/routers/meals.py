from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/meals", tags=["Meals"])


@router.get("/today")
def get_today_meals(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    logs = db.query(models.MealLog).filter(
        models.MealLog.user_id == current_user.id,
        models.MealLog.date == today
    ).all()
    by_type = {"breakfast": [], "lunch": [], "snack": [], "dinner": []}
    total_calories = 0
    total_protein = 0
    for log in logs:
        if log.meal_type in by_type:
            by_type[log.meal_type].append(schemas.MealLogOut.model_validate(log).model_dump())
        total_calories += log.calories or 0
        total_protein += log.protein or 0
    return {
        "by_type": by_type,
        "total_calories": total_calories,
        "total_protein": total_protein
    }


@router.post("/log", response_model=schemas.MealLogOut)
def log_meal(
    meal_log: schemas.MealLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = models.MealLog(user_id=current_user.id, **meal_log.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/history")
def get_meal_history(
    days: int = 7,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)
    labels = []
    calories = []
    for i in range(days):
        d = start_date + timedelta(days=i)
        logs = db.query(models.MealLog).filter(
            models.MealLog.user_id == current_user.id,
            models.MealLog.date == d
        ).all()
        labels.append(d.strftime("%a"))
        calories.append(sum(l.calories or 0 for l in logs))
    return {"labels": labels, "calories": calories}
