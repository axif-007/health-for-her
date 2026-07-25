from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
import random

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def get_greeting():
    hour = datetime.now().hour
    if hour < 12:
        return "Good Morning"
    elif hour < 17:
        return "Good Afternoon"
    else:
        return "Good Evening"


@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    user_id = current_user.id

    # Water today
    water_logs = db.query(models.WaterLog).filter(
        models.WaterLog.user_id == user_id,
        models.WaterLog.date == today
    ).all()
    water_today_ml = sum(w.amount_ml for w in water_logs)

    # Medicines
    medicines = db.query(models.Medicine).filter(
        models.Medicine.user_id == user_id,
        models.Medicine.is_active == True
    ).all()
    medicines_total = len(medicines)
    medicine_logs_today = db.query(models.MedicineLog).filter(
        models.MedicineLog.user_id == user_id,
        models.MedicineLog.date == today,
        models.MedicineLog.taken == True
    ).count()

    # Mood today
    mood_log = db.query(models.MoodLog).filter(
        models.MoodLog.user_id == user_id,
        models.MoodLog.date == today
    ).first()

    # Sleep
    sleep_log = db.query(models.SleepLog).filter(
        models.SleepLog.user_id == user_id,
        models.SleepLog.date == today
    ).first()

    # Recovery
    recovery_log = db.query(models.RecoveryLog).filter(
        models.RecoveryLog.user_id == user_id,
        models.RecoveryLog.date == today
    ).first()
    recovery_pct = recovery_log.recovery_percentage if recovery_log else 65.0

    # Calories today
    meal_logs = db.query(models.MealLog).filter(
        models.MealLog.user_id == user_id,
        models.MealLog.date == today
    ).all()
    calories_today = sum(m.calories for m in meal_logs if m.calories)

    # Steps
    steps_today = recovery_log.steps_walked if recovery_log else None

    # Settings
    settings = db.query(models.Settings).filter(models.Settings.user_id == user_id).first()
    water_goal = settings.water_goal_ml if settings else 3000.0

    # Health score calculation
    health_score = calculate_health_score(
        water_today_ml, water_goal,
        medicine_logs_today, medicines_total,
        sleep_log.total_hours if sleep_log else None,
        recovery_pct
    )

    # Random love message
    love_msgs = db.query(models.LoveMessage).all()
    love_message = random.choice(love_msgs).message if love_msgs else "I'm proud of you ❤️"

    # Random quote
    quotes = db.query(models.Quote).all()
    daily_quote = random.choice(quotes).text if quotes else "Keep going, you're doing amazing ✨"

    return schemas.DashboardStats(
        greeting=get_greeting(),
        date=today.strftime("%A, %d %B %Y"),
        time=datetime.now().strftime("%I:%M %p"),
        recovery_percentage=recovery_pct,
        water_today_ml=water_today_ml,
        water_goal_ml=water_goal,
        medicines_taken=medicine_logs_today,
        medicines_total=medicines_total,
        mood_today=mood_log.mood if mood_log else None,
        sleep_hours=sleep_log.total_hours if sleep_log else None,
        calories_today=calories_today if calories_today > 0 else None,
        steps_today=steps_today,
        health_score=health_score,
        daily_quote=daily_quote,
        love_message=love_message,
    )


def calculate_health_score(water_ml, water_goal, meds_taken, meds_total, sleep_hrs, recovery_pct):
    score = 0.0
    # Water: 25 points
    if water_goal > 0:
        score += min(25.0, (water_ml / water_goal) * 25)
    # Medicine: 25 points
    if meds_total > 0:
        score += (meds_taken / meds_total) * 25
    # Sleep: 25 points
    if sleep_hrs:
        score += min(25.0, (sleep_hrs / 8.0) * 25)
    else:
        score += 12.5  # default half
    # Recovery: 25 points
    score += (recovery_pct / 100) * 25
    return round(score, 1)


@router.get("/love-message")
def get_random_love_message(db: Session = Depends(get_db)):
    msgs = db.query(models.LoveMessage).all()
    if not msgs:
        return {"message": "You are loved ❤️", "category": "general"}
    msg = random.choice(msgs)
    return {"message": msg.message, "category": msg.category}


@router.get("/quote")
def get_random_quote(category: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Quote)
    if category:
        query = query.filter(models.Quote.category == category)
    quotes = query.all()
    if not quotes:
        return {"text": "Keep going, you're amazing ✨", "author": "With Love"}
    q = random.choice(quotes)
    return {"text": q.text, "author": q.author, "category": q.category}
