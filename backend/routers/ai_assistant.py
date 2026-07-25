from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta
import random

from database import get_db
from dependencies import get_current_user
import models

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])


@router.get("/summary")
def get_daily_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    user_id = current_user.id

    # Gather data
    water_logs = db.query(models.WaterLog).filter(
        models.WaterLog.user_id == user_id, models.WaterLog.date == today).all()
    water_ml = sum(w.amount_ml for w in water_logs)

    meds_taken = db.query(models.MedicineLog).filter(
        models.MedicineLog.user_id == user_id, models.MedicineLog.date == today, models.MedicineLog.taken == True).count()
    meds_total = db.query(models.Medicine).filter(
        models.Medicine.user_id == user_id, models.Medicine.is_active == True).count()

    mood = db.query(models.MoodLog).filter(
        models.MoodLog.user_id == user_id, models.MoodLog.date == today).first()

    sleep = db.query(models.SleepLog).filter(
        models.SleepLog.user_id == user_id, models.SleepLog.date == today).first()

    recovery = db.query(models.RecoveryLog).filter(
        models.RecoveryLog.user_id == user_id, models.RecoveryLog.date == today).first()

    # Generate insights
    insights = []
    recommendations = []

    if water_ml < 1500:
        insights.append("⚠️ You've drunk less than half your daily water goal.")
        recommendations.append("💧 Try to drink a glass of water every hour.")
    elif water_ml >= 3000:
        insights.append("✅ Amazing! You've completed your water goal today!")
    else:
        insights.append(f"💧 You've had {water_ml/1000:.1f}L of water. Keep going!")

    if meds_total > 0:
        pct = (meds_taken / meds_total) * 100
        if pct == 100:
            insights.append("✅ All medicines taken! You're doing great!")
        elif pct >= 50:
            insights.append(f"💊 {meds_taken}/{meds_total} medicines taken. Don't forget the rest.")
            recommendations.append("💊 Check your medicine reminder for remaining doses.")
        else:
            insights.append("⚠️ You haven't taken most of your medicines today.")
            recommendations.append("💊 Please take your medicines as prescribed.")

    if mood:
        mood_messages = {
            "excellent": "You're feeling excellent! Keep this positive energy! ✨",
            "happy": "You're feeling happy today! Wonderful! 😊",
            "normal": "Feeling normal is okay. Take it one step at a time. 💪",
            "sad": "I'm sorry you're feeling sad. Remember, I'm always here for you. ❤️",
            "weak": "Feeling weak today — please rest well and stay hydrated. 🛋️"
        }
        insights.append(mood_messages.get(mood.mood, "Thank you for logging your mood today."))
    else:
        recommendations.append("😊 Don't forget to log your mood today!")

    if sleep:
        if sleep.total_hours and sleep.total_hours >= 8:
            insights.append(f"✅ Great sleep! {sleep.total_hours} hours of rest!")
        elif sleep.total_hours:
            insights.append(f"😴 You slept {sleep.total_hours} hours. Try to get 8 hours.")
    else:
        recommendations.append("🌙 Log your sleep to track your rest pattern.")

    # Recovery prediction
    prediction = None
    if recovery:
        rp = recovery.recovery_percentage
        if rp >= 80:
            prediction = "🌟 You're recovering beautifully! Almost there!"
        elif rp >= 50:
            prediction = "💪 Steady progress! Keep following your routine."
        else:
            prediction = "🌸 You're in early recovery. Every day counts. Be patient."

    # Personalized tip
    tips = [
        "🍃 Include green vegetables in your lunch today.",
        "☀️ A short walk in fresh air can boost your energy.",
        "🧘 Deep breathing for 5 minutes can reduce stress.",
        "🍋 Add lemon to your water for extra vitamin C.",
        "📖 Reading something positive before sleep improves rest quality.",
        "🙏 Gratitude journaling can uplift your mood significantly.",
        "🌸 Remember: healing takes time. Be gentle with yourself.",
        "💊 Consistency with medicines is the key to faster recovery.",
    ]

    return {
        "date": str(today),
        "insights": insights,
        "recommendations": recommendations,
        "recovery_prediction": prediction,
        "daily_tip": random.choice(tips),
        "love_note": "You are doing amazing, Asifa. I am so proud of you ❤️"
    }


@router.get("/food-suggestions")
def get_food_suggestions(
    current_user: models.User = Depends(get_current_user)
):
    return {
        "breakfast": [
            {"name": "Oatmeal with banana", "reason": "Easy to digest, energy-boosting"},
            {"name": "Toast with egg", "reason": "High protein for recovery"},
            {"name": "Yogurt with honey", "reason": "Probiotics for gut health"},
        ],
        "lunch": [
            {"name": "Chicken soup", "reason": "Anti-inflammatory, easy on stomach"},
            {"name": "Rice with dal", "reason": "Light and nutritious"},
            {"name": "Grilled vegetables", "reason": "Rich in vitamins"},
        ],
        "snack": [
            {"name": "Apple or banana", "reason": "Natural energy boost"},
            {"name": "Dates with milk", "reason": "Islamic sunnah, energy rich"},
            {"name": "Nuts (almonds/walnuts)", "reason": "Healthy fats and protein"},
        ],
        "dinner": [
            {"name": "Khichdi", "reason": "Light and easy to digest"},
            {"name": "Soup with bread", "reason": "Gentle on the stomach"},
            {"name": "Boiled rice with vegetables", "reason": "Balanced and light"},
        ],
        "avoid": [
            "Spicy and oily foods",
            "Cold drinks and ice cream",
            "Fried foods",
            "Too much sugar",
            "Caffeinated drinks"
        ]
    }


@router.get("/wellness-tips")
def get_wellness_tips():
    tips = [
        {"category": "hydration", "tip": "Drink warm water in the morning to kickstart digestion.", "icon": "💧"},
        {"category": "medicine", "tip": "Take medicines at the same time daily for best results.", "icon": "💊"},
        {"category": "sleep", "tip": "Sleep before 10 PM to maximize healing hormones.", "icon": "🌙"},
        {"category": "nutrition", "tip": "Eat 5-6 small meals instead of 3 large ones.", "icon": "🥗"},
        {"category": "movement", "tip": "Even a short 10-minute walk helps circulation.", "icon": "🚶"},
        {"category": "mental", "tip": "Positive thoughts speed up physical recovery.", "icon": "🧠"},
        {"category": "islamic", "tip": "Recite Ayat ul Kursi for spiritual healing and protection.", "icon": "🤲"},
        {"category": "rest", "tip": "Rest is not laziness — it's part of recovery.", "icon": "🛋️"},
    ]
    return {"tips": tips}
