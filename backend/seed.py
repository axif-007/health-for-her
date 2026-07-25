"""
Seed script — run once to populate the database with:
  - Default user: asifa / asifa123
  - Default medicines
  - Default love messages & quotes
  - Default schedule tasks
  - Default timeline events
  - Default achievements
  - Default settings
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal, Base
import models
from auth import get_password_hash
from datetime import date, datetime


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # ── User ──────────────────────────────────────────────────────────────────
    if not db.query(models.User).filter(models.User.username == "asifa").first():
        user = models.User(
            username="asifa",
            email="asifa@recovery.com",
            hashed_password=get_password_hash("asifa123"),
            full_name="Asifa",
            blood_group="B+",
            doctor_name="Dr. Ahmed",
            hospital="City Hospital",
            emergency_contact="+92-300-0000000",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id
        print(f"✅ Created user: asifa (id={user_id})")
    else:
        user = db.query(models.User).filter(models.User.username == "asifa").first()
        user_id = user.id
        print(f"ℹ️  User asifa already exists (id={user_id})")

    # ── Settings ──────────────────────────────────────────────────────────────
    if not db.query(models.Settings).filter(models.Settings.user_id == user_id).first():
        settings = models.Settings(user_id=user_id)
        db.add(settings)
        db.commit()
        print("✅ Created default settings")

    # ── Medicines ─────────────────────────────────────────────────────────────
    medicines_data = [
        {"name": "Morning Tablets", "dosage": "Prescribed dose", "instructions": "Take tablets 15 mins after tiffin", "time_of_day": "morning", "reminder_time": "11:00"},
        {"name": "ORS", "dosage": "1 Sachet", "instructions": "Drink ORS if feeling low", "time_of_day": "afternoon", "reminder_time": "15:30"},
        {"name": "Night Medicine", "dosage": "Prescribed dose", "instructions": "Take before sleeping", "time_of_day": "night", "reminder_time": "23:00"},
    ]
    if db.query(models.Medicine).filter(models.Medicine.user_id == user_id).count() == 0:
        for m in medicines_data:
            medicine = models.Medicine(user_id=user_id, **m)
            db.add(medicine)
        db.commit()
        print(f"✅ Created {len(medicines_data)} medicines")

    # ── Schedule Tasks ─────────────────────────────────────────────────────────
    tasks_data = [
        {"title": "Wake up, brush, wash", "time_label": "7:30 AM", "period": "morning", "icon": "🌅", "description": "Wake up naturally"},
        {"title": "Drink warm water", "time_label": "7:35 AM", "period": "morning", "icon": "🍋", "description": "1 glass warm water with lemon"},
        {"title": "Getting ready", "time_label": "7:45 AM", "period": "morning", "icon": "👗", "description": "Getting ready for the day"},
        {"title": "Have tiffin", "time_label": "8:30 AM", "period": "morning", "icon": "🥪", "description": "Healthy tiffin"},
        {"title": "Office time - travel", "time_label": "8:30 AM", "period": "morning", "icon": "🚗", "description": "Travel and office time (8:30-9:30 AM)"},
        {"title": "Take your tablets", "time_label": "11:00 AM", "period": "morning", "icon": "💊", "description": "Morning tablets"},
        {"title": "Have your lunch", "time_label": "1:30 PM", "period": "day", "icon": "🍽️", "description": "Nutritious lunch"},
        {"title": "Drink ORS", "time_label": "3:30 PM", "period": "day", "icon": "🥤", "description": "Drink ORS if feeling low"},
        {"title": "Snack time", "time_label": "6:30 PM", "period": "evening", "icon": "☕", "description": "Evening snacks"},
        {"title": "Reach home & rest", "time_label": "8:00 PM", "period": "evening", "icon": "🛋️", "description": "Rest and family time"},
        {"title": "Do some walking", "time_label": "9:30 PM", "period": "evening", "icon": "🚶‍♀️", "description": "Evening walk"},
        {"title": "Help ammi in Dinner", "time_label": "9:45 PM", "period": "evening", "icon": "👩‍🍳", "description": "Family time / Kitchen"},
        {"title": "Have your Dinner", "time_label": "10:30 PM", "period": "evening", "icon": "🍲", "description": "Dinner time"},
        {"title": "Do some walking", "time_label": "10:45 PM", "period": "evening", "icon": "🚶‍♀️", "description": "Post-dinner walk"},
        {"title": "Take your Medicine", "time_label": "11:00 PM", "period": "night", "icon": "💊", "description": "Night medicine"},
        {"title": "Have your milk boiled", "time_label": "11:15 PM", "period": "night", "icon": "🥛", "description": "Warm milk"},
        {"title": "Just us ❤️", "time_label": "11:30 PM", "period": "night", "icon": "💝", "description": "Time with you (11:30 PM - 12:30 AM)"},
    ]
    if db.query(models.ScheduleTask).filter(models.ScheduleTask.user_id == user_id).count() == 0:
        for t in tasks_data:
            task = models.ScheduleTask(user_id=user_id, date=date.today(), **t)
            db.add(task)
        db.commit()
        print(f"✅ Created {len(tasks_data)} schedule tasks")

    # ── Timeline Events ────────────────────────────────────────────────────────
    timeline_data = [
        {"title": "First Meeting", "description": "The day our journey began ❤️", "icon": "💝", "color": "#FF6B9D", "is_milestone": True, "event_date": "2023-01-15"},
        {"title": "First Chat", "description": "When words became our bridge 💬", "icon": "💬", "color": "#9B59B6", "event_date": "2023-01-16"},
        {"title": "First Call", "description": "Hearing your voice for the first time 📞", "icon": "📞", "color": "#3498DB", "is_milestone": True, "event_date": "2023-01-20"},
        {"title": "First Photo Together", "description": "A memory to cherish forever 📸", "icon": "📸", "color": "#E67E22", "is_milestone": True, "event_date": "2023-02-14"},
        {"title": "Recovery Journey Begins", "description": "Starting this healing journey together 🌸", "icon": "🌸", "color": "#E91E8C", "is_milestone": True, "event_date": "2024-01-01"},
        {"title": "Future Dreams", "description": "Our beautiful future together 🌟", "icon": "🌟", "color": "#F1C40F", "is_milestone": True, "event_date": "2025-12-31"},
    ]
    if db.query(models.TimelineEvent).filter(models.TimelineEvent.user_id == user_id).count() == 0:
        for t in timeline_data:
            event = models.TimelineEvent(user_id=user_id, **t)
            db.add(event)
        db.commit()
        print(f"✅ Created {len(timeline_data)} timeline events")

    # ── Love Messages ──────────────────────────────────────────────────────────
    love_messages = [
        {"message": "I'm proud of you for taking your medicine today ❤️", "category": "medicine"},
        {"message": "You're one step closer to recovery, my love 🌸", "category": "general"},
        {"message": "Seeing you healthy is my favorite dream ✨", "category": "general"},
        {"message": "Allah is with you, and so am I 🤲", "category": "general"},
        {"message": "Drink some water, beautiful 💧", "category": "water"},
        {"message": "Your smile is my medicine ❤️", "category": "general"},
        {"message": "Take care of yourself because you're precious 💎", "category": "general"},
        {"message": "Every heartbeat reminds me how much I care about you 💓", "category": "general"},
        {"message": "You're stronger than yesterday, I believe in you 💪", "category": "motivation"},
        {"message": "Don't forget to smile today, beautiful 😊", "category": "general"},
        {"message": "I'll always be beside you ❤️", "category": "general"},
        {"message": "One more step toward recovery, you're amazing 🌟", "category": "motivation"},
        {"message": "Your health is the most important thing to me 🏥", "category": "general"},
        {"message": "Rest well tonight, you deserve it 🌙", "category": "general"},
        {"message": "Every glass of water is a step toward healing 💧", "category": "water"},
        {"message": "You make recovery look beautiful 🌺", "category": "general"},
        {"message": "Keep going, you're doing amazing ✨", "category": "motivation"},
        {"message": "I love you more than words can express ❤️", "category": "general"},
        {"message": "Your recovery journey is our journey together 🤝", "category": "general"},
        {"message": "Allah ka shukar hai, you're getting better every day 🤲", "category": "general"},
    ]
    if db.query(models.LoveMessage).count() == 0:
        for lm in love_messages:
            msg = models.LoveMessage(**lm)
            db.add(msg)
        db.commit()
        print(f"✅ Created {len(love_messages)} love messages")

    # ── Quotes ────────────────────────────────────────────────────────────────
    quotes_data = [
        {"text": "The body heals with play, the mind heals with laughter, and the spirit heals with joy.", "author": "Proverb", "category": "healing"},
        {"text": "Healing is not linear. It's okay to have setbacks.", "author": "Unknown", "category": "healing"},
        {"text": "Take care of your body. It's the only place you have to live.", "author": "Jim Rohn", "category": "healing"},
        {"text": "إِنَّ مَعَ الْعُسْرِ يُسْرًا — Verily, with hardship comes ease.", "author": "Quran 94:6", "category": "islamic"},
        {"text": "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ — And when I am ill, it is He who cures me.", "author": "Quran 26:80", "category": "islamic"},
        {"text": "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ وَاشْفِهِ — O Allah, Lord of mankind, remove the illness and heal her.", "author": "Dua for Healing", "category": "islamic"},
        {"text": "Strength grows in the moments when you think you can't go on but you keep going.", "author": "Unknown", "category": "motivation"},
        {"text": "You are braver than you believe, stronger than you seem.", "author": "A.A. Milne", "category": "motivation"},
        {"text": "Every day is a new beginning. Take a deep breath and start again.", "author": "Unknown", "category": "healing"},
        {"text": "Your present circumstances don't determine where you can go; they merely determine where you start.", "author": "Nido Qubein", "category": "motivation"},
        {"text": "Love is the best medicine ❤️", "author": "Unknown", "category": "love"},
        {"text": "In the middle of difficulty lies opportunity — and healing.", "author": "Albert Einstein", "category": "healing"},
    ]
    if db.query(models.Quote).count() == 0:
        for q in quotes_data:
            quote = models.Quote(**q)
            db.add(quote)
        db.commit()
        print(f"✅ Created {len(quotes_data)} quotes")

    # ── Achievements (predefined) ──────────────────────────────────────────────
    achievements_data = [
        {"title": "First Step", "description": "Logged your first recovery entry", "icon": "🌸", "badge_type": "flower"},
        {"title": "Medicine Hero", "description": "Took all medicines for a full day", "icon": "💊", "badge_type": "badge"},
        {"title": "Water Champion", "description": "Reached 3L water goal", "icon": "💧", "badge_type": "star"},
        {"title": "Sleep Guardian", "description": "Slept 8+ hours for 3 consecutive days", "icon": "🌙", "badge_type": "star"},
        {"title": "Perfect Day", "description": "Completed all daily goals in one day", "icon": "⭐", "badge_type": "star"},
        {"title": "Weekly Champion", "description": "Completed all goals for a full week", "icon": "🏆", "badge_type": "badge"},
    ]
    if db.query(models.Achievement).filter(models.Achievement.user_id == user_id).count() == 0:
        first = models.Achievement(user_id=user_id, **achievements_data[0])
        db.add(first)
        db.commit()
        print(f"✅ Created initial achievement")

    db.close()
    print("\n🎉 Database seeded successfully! Login with: asifa / asifa123")


if __name__ == "__main__":
    seed()
