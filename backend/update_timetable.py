import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal
import models
from datetime import date

def update_schedule_and_medicines():
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.username == "asifa").first()
    
    if not user:
        print("User not found.")
        return

    user_id = user.id

    # 1. Delete existing schedule tasks and medicines
    db.query(models.ScheduleTask).filter(models.ScheduleTask.user_id == user_id).delete()
    db.query(models.Medicine).filter(models.Medicine.user_id == user_id).delete()
    db.commit()

    # 2. Add new Schedule Tasks
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

    for t in tasks_data:
        task = models.ScheduleTask(user_id=user_id, date=date.today(), **t)
        db.add(task)

    # 3. Add new Medicines
    medicines_data = [
        {"name": "Morning Tablets", "dosage": "Prescribed dose", "instructions": "Take tablets 15 mins after tiffin", "time_of_day": "morning", "reminder_time": "11:00"},
        {"name": "ORS", "dosage": "1 Sachet", "instructions": "Drink ORS if feeling low", "time_of_day": "afternoon", "reminder_time": "15:30"},
        {"name": "Night Medicine", "dosage": "Prescribed dose", "instructions": "Take before sleeping", "time_of_day": "night", "reminder_time": "23:00"},
    ]

    for m in medicines_data:
        medicine = models.Medicine(user_id=user_id, **m)
        db.add(medicine)

    db.commit()
    print("✅ Schedule and medicines successfully updated to match the handwritten timetable!")

if __name__ == "__main__":
    update_schedule_and_medicines()
