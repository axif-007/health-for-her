from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum, Date
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class SeverityEnum(str, enum.Enum):
    mild = "mild"
    moderate = "moderate"
    severe = "severe"


class MoodEnum(str, enum.Enum):
    excellent = "excellent"
    happy = "happy"
    normal = "normal"
    sad = "sad"
    weak = "weak"


class MealTypeEnum(str, enum.Enum):
    breakfast = "breakfast"
    lunch = "lunch"
    snack = "snack"
    dinner = "dinner"


class MedicineTimeEnum(str, enum.Enum):
    morning = "morning"
    afternoon = "afternoon"
    night = "night"


# ─── Users ────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="Asifa")
    avatar = Column(String, nullable=True)
    blood_group = Column(String, default="B+")
    date_of_birth = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    doctor_name = Column(String, nullable=True)
    hospital = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    is_active = Column(Boolean, default=True)
    telegram_chat_id = Column(String, nullable=True)
    telegram_bot_token = Column(String, nullable=True)

    # Google Fit Integrations
    google_fit_refresh_token = Column(String, nullable=True)
    google_fit_access_token = Column(String, nullable=True)
    google_fit_token_expiry = Column(DateTime, nullable=True)

    medicines = relationship("Medicine", back_populates="user")
    medicine_logs = relationship("MedicineLog", back_populates="user")
    water_logs = relationship("WaterLog", back_populates="user")
    meal_logs = relationship("MealLog", back_populates="user")
    mood_logs = relationship("MoodLog", back_populates="user")
    sleep_logs = relationship("SleepLog", back_populates="user")
    symptom_logs = relationship("SymptomLog", back_populates="user")
    recovery_logs = relationship("RecoveryLog", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")
    gallery_items = relationship("GalleryItem", back_populates="user")
    timeline_events = relationship("TimelineEvent", back_populates="user")
    settings = relationship("Settings", back_populates="user", uselist=False)


# ─── Medicines ────────────────────────────────────────────────────────────────
class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    dosage = Column(String, nullable=True)
    instructions = Column(Text, nullable=True)
    time_of_day = Column(String, nullable=False)  # morning/afternoon/night
    reminder_time = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    last_reminded_date = Column(Date, nullable=True)
    last_missed_alert_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="medicines")
    logs = relationship("MedicineLog", back_populates="medicine")


class MedicineLog(Base):
    __tablename__ = "medicine_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    date = Column(Date, nullable=False)
    last_missed_alert_date = Column(Date, nullable=True)
    taken = Column(Boolean, default=False)
    taken_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="medicine_logs")
    medicine = relationship("Medicine", back_populates="logs")


# ─── Water ────────────────────────────────────────────────────────────────────
class WaterLog(Base):
    __tablename__ = "water_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    amount_ml = Column(Float, default=0.0)
    logged_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="water_logs")


# ─── Meals ────────────────────────────────────────────────────────────────────
class Meal(Base):
    __tablename__ = "meals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    meal_type = Column(String, nullable=False)
    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    is_healthy = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    logs = relationship("MealLog", back_populates="meal")


class MealLog(Base):
    __tablename__ = "meal_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    meal_id = Column(Integer, ForeignKey("meals.id"), nullable=True)
    date = Column(Date, nullable=False)
    meal_type = Column(String, nullable=False)
    custom_name = Column(String, nullable=True)
    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="meal_logs")
    meal = relationship("Meal", back_populates="logs")


# ─── Mood ─────────────────────────────────────────────────────────────────────
class MoodLog(Base):
    __tablename__ = "mood_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    mood = Column(String, nullable=False)
    energy_level = Column(Integer, nullable=True)  # 1-10
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="mood_logs")


# ─── Sleep ────────────────────────────────────────────────────────────────────
class SleepLog(Base):
    __tablename__ = "sleep_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    bed_time = Column(String, nullable=True)
    wake_time = Column(String, nullable=True)
    total_hours = Column(Float, nullable=True)
    quality = Column(Integer, nullable=True)  # 1-5
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="sleep_logs")


# ─── Symptoms ─────────────────────────────────────────────────────────────────
class SymptomLog(Base):
    __tablename__ = "symptom_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    fever = Column(String, nullable=True)
    headache = Column(String, nullable=True)
    weakness = Column(String, nullable=True)
    vomiting = Column(String, nullable=True)
    loose_motion = Column(String, nullable=True)
    body_pain = Column(String, nullable=True)
    appetite = Column(String, nullable=True)
    sleep_quality = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="symptom_logs")


# ─── Recovery ─────────────────────────────────────────────────────────────────
class RecoveryLog(Base):
    __tablename__ = "recovery_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    recovery_percentage = Column(Float, default=0.0)
    energy_level = Column(Integer, nullable=True)  # 1-10
    strength_level = Column(Integer, nullable=True)  # 1-10
    temperature = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    steps_walked = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="recovery_logs")


# ─── Journal ──────────────────────────────────────────────────────────────────
class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    how_feel = Column(Text, nullable=True)
    what_made_smile = Column(Text, nullable=True)
    grateful_for = Column(Text, nullable=True)
    todays_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="journal_entries")


# ─── Achievements ─────────────────────────────────────────────────────────────
class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    badge_type = Column(String, nullable=True)  # heart/star/flower/badge
    unlocked_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="achievements")


# ─── Gallery ──────────────────────────────────────────────────────────────────
class GalleryItem(Base):
    __tablename__ = "gallery_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)       # Cloudinary URL in production
    file_type = Column(String, default="image")
    caption = Column(String, nullable=True)
    is_favourite = Column(Boolean, default=False)
    cloudinary_public_id = Column(String, nullable=True)  # For deletion from Cloudinary
    uploaded_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="gallery_items")


# ─── Timeline ─────────────────────────────────────────────────────────────────
class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(String, nullable=True)
    icon = Column(String, nullable=True)
    color = Column(String, nullable=True)
    is_milestone = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="timeline_events")


# ─── Notifications ────────────────────────────────────────────────────────────
class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=True)
    notif_type = Column(String, default="reminder")  # reminder/love/achievement
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())


# ─── Settings ─────────────────────────────────────────────────────────────────
class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    theme = Column(String, default="light")
    dark_mode = Column(Boolean, default=False)
    music_enabled = Column(Boolean, default=True)
    language = Column(String, default="en")
    water_goal_ml = Column(Float, default=3000.0)
    sleep_goal_hours = Column(Float, default=8.0)
    calorie_goal = Column(Float, default=2000.0)
    reminder_frequency_minutes = Column(Integer, default=60)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Telegram Notification Tracking Fields
    last_water_reminded_at = Column(DateTime, nullable=True)
    last_sleep_prompt_date = Column(Date, nullable=True)
    last_mood_prompt_date = Column(Date, nullable=True)
    last_journal_prompt_date = Column(Date, nullable=True)
    last_love_message_date = Column(Date, nullable=True)
    last_ai_tip_date = Column(Date, nullable=True)
    last_gallery_drop_date = Column(Date, nullable=True)

    user = relationship("User", back_populates="settings")


# ─── Love Messages & Quotes ───────────────────────────────────────────────────
class LoveMessage(Base):
    __tablename__ = "love_messages"
    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text, nullable=False)
    category = Column(String, default="general")  # general/medicine/water/motivation
    created_at = Column(DateTime, server_default=func.now())


class Quote(Base):
    __tablename__ = "quotes"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    author = Column(String, nullable=True)
    category = Column(String, default="healing")  # healing/islamic/motivation/love
    created_at = Column(DateTime, server_default=func.now())


# ─── Schedule Tasks ───────────────────────────────────────────────────────────
class ScheduleTask(Base):
    __tablename__ = "schedule_tasks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    time_label = Column(String, nullable=True)
    period = Column(String, nullable=True)  # morning/day/evening
    icon = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)
    date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    is_reminded = Column(Boolean, default=False)

# --- Google Fit Metrics -------------------------------------------------------
class DailyMetrics(Base):
    __tablename__ = "daily_metrics"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False, index=True)
    
    steps = Column(Integer, default=0)
    calories = Column(Float, default=0.0)
    distance_km = Column(Float, default=0.0)
    active_minutes = Column(Integer, default=0)
    sleep_minutes = Column(Integer, default=0)

    user = relationship("User")


# ─── Period / Cycle Companion ──────────────────────────────────────────────────
class PeriodLog(Base):
    __tablename__ = "period_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True)
    cycle_length = Column(Integer, default=28)
    period_length = Column(Integer, default=5)
    flow_intensity = Column(String, default="medium")  # light / medium / heavy
    cramps_level = Column(Integer, default=0)        # 0-5 scale
    mood = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User")

