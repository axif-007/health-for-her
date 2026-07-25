from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ─── Auth ─────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str
    full_name: Optional[str] = "Asifa"


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserOut(BaseModel):
    id: int
    username: str
    full_name: Optional[str]
    email: Optional[str]
    blood_group: Optional[str]
    doctor_name: Optional[str]
    hospital: Optional[str]
    emergency_contact: Optional[str]
    created_at: Optional[datetime]
    telegram_chat_id: Optional[str] = None
    telegram_bot_token: Optional[str] = None
    google_fit_refresh_token: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    blood_group: Optional[str] = None
    doctor_name: Optional[str] = None
    hospital: Optional[str] = None
    emergency_contact: Optional[str] = None
    date_of_birth: Optional[str] = None


# ─── Medicines ────────────────────────────────────────────────────────────────
class MedicineCreate(BaseModel):
    name: str
    dosage: Optional[str] = None
    instructions: Optional[str] = None
    time_of_day: str
    reminder_time: Optional[str] = None


class MedicineOut(MedicineCreate):
    id: int
    user_id: int
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class MedicineLogCreate(BaseModel):
    medicine_id: int
    date: date
    taken: bool = False
    notes: Optional[str] = None


class MedicineLogOut(BaseModel):
    id: int
    medicine_id: int
    date: date
    taken: bool
    taken_at: Optional[datetime]
    notes: Optional[str]

    class Config:
        from_attributes = True


# ─── Water ────────────────────────────────────────────────────────────────────
class WaterLogCreate(BaseModel):
    date: date
    amount_ml: float


class WaterLogOut(BaseModel):
    id: int
    date: date
    amount_ml: float
    logged_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Meals ────────────────────────────────────────────────────────────────────
class MealLogCreate(BaseModel):
    date: date
    meal_type: str
    custom_name: Optional[str] = None
    meal_id: Optional[int] = None
    calories: Optional[float] = None
    protein: Optional[float] = None
    notes: Optional[str] = None


class MealLogOut(BaseModel):
    id: int
    date: date
    meal_type: str
    custom_name: Optional[str]
    calories: Optional[float]
    protein: Optional[float]
    notes: Optional[str]
    logged_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Mood ─────────────────────────────────────────────────────────────────────
class MoodLogCreate(BaseModel):
    date: date
    mood: str
    energy_level: Optional[int] = None
    notes: Optional[str] = None


class MoodLogOut(BaseModel):
    id: int
    date: date
    mood: str
    energy_level: Optional[int]
    notes: Optional[str]
    logged_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Sleep ────────────────────────────────────────────────────────────────────
class SleepLogCreate(BaseModel):
    date: date
    bed_time: Optional[str] = None
    wake_time: Optional[str] = None
    total_hours: Optional[float] = None
    quality: Optional[int] = None
    notes: Optional[str] = None


class SleepLogOut(BaseModel):
    id: int
    date: date
    bed_time: Optional[str]
    wake_time: Optional[str]
    total_hours: Optional[float]
    quality: Optional[int]
    notes: Optional[str]
    logged_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Symptoms ─────────────────────────────────────────────────────────────────
class SymptomLogCreate(BaseModel):
    date: date
    fever: Optional[str] = None
    headache: Optional[str] = None
    weakness: Optional[str] = None
    vomiting: Optional[str] = None
    loose_motion: Optional[str] = None
    body_pain: Optional[str] = None
    appetite: Optional[str] = None
    sleep_quality: Optional[str] = None
    notes: Optional[str] = None


class SymptomLogOut(SymptomLogCreate):
    id: int
    logged_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Recovery ─────────────────────────────────────────────────────────────────
class RecoveryLogCreate(BaseModel):
    date: date
    recovery_percentage: Optional[float] = None
    energy_level: Optional[int] = None
    strength_level: Optional[int] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None
    steps_walked: Optional[int] = None
    notes: Optional[str] = None


class RecoveryLogOut(RecoveryLogCreate):
    id: int
    logged_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Journal ──────────────────────────────────────────────────────────────────
class JournalEntryCreate(BaseModel):
    date: date
    how_feel: Optional[str] = None
    what_made_smile: Optional[str] = None
    grateful_for: Optional[str] = None
    todays_notes: Optional[str] = None


class JournalEntryOut(JournalEntryCreate):
    id: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Gallery ──────────────────────────────────────────────────────────────────
class GalleryItemOut(BaseModel):
    id: int
    filename: str
    file_path: str
    file_type: str
    caption: Optional[str]
    is_favourite: bool
    uploaded_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Timeline ─────────────────────────────────────────────────────────────────
class TimelineEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_milestone: bool = False


class TimelineEventOut(TimelineEventCreate):
    id: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Achievements ─────────────────────────────────────────────────────────────
class AchievementOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    icon: Optional[str]
    badge_type: Optional[str]
    unlocked_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Settings ─────────────────────────────────────────────────────────────────
class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    dark_mode: Optional[bool] = None
    music_enabled: Optional[bool] = None
    language: Optional[str] = None
    water_goal_ml: Optional[float] = None
    sleep_goal_hours: Optional[float] = None
    calorie_goal: Optional[float] = None
    reminder_frequency_minutes: Optional[int] = None


class SettingsOut(BaseModel):
    id: int
    theme: str
    dark_mode: bool
    music_enabled: bool
    language: str
    water_goal_ml: float
    sleep_goal_hours: float
    calorie_goal: float
    reminder_frequency_minutes: int

    class Config:
        from_attributes = True


# ─── Schedule ─────────────────────────────────────────────────────────────────
class ScheduleTaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    time_label: Optional[str] = None
    period: Optional[str] = None
    icon: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None


class ScheduleTaskOut(ScheduleTaskCreate):
    id: int
    is_completed: bool

    class Config:
        from_attributes = True


# ─── Notifications ────────────────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: int
    title: str
    message: Optional[str]
    notif_type: str
    is_read: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Dashboard ────────────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    greeting: str
    date: str
    time: str
    recovery_percentage: float
    water_today_ml: float
    water_goal_ml: float
    medicines_taken: int
    medicines_total: int
    mood_today: Optional[str]
    sleep_hours: Optional[float]
    calories_today: Optional[float]
    steps_today: Optional[int]
    health_score: float
    daily_quote: Optional[str]
    love_message: Optional[str]


# ─── Love Messages ────────────────────────────────────────────────────────────
class LoveMessageOut(BaseModel):
    id: int
    message: str
    category: str

    class Config:
        from_attributes = True


class QuoteOut(BaseModel):
    id: int
    text: str
    author: Optional[str]
    category: str

    class Config:
        from_attributes = True
