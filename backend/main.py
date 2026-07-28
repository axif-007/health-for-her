from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Load .env file for local development (ignored in production — env vars set on Render dashboard)
from dotenv import load_dotenv
load_dotenv()

from database import engine
import models

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Asifa ❤️ – My Recovery Companion API",
    description="A personalized healthcare recovery companion API built with love for Asifa",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS — allow localhost (dev) + Render frontend URL (production)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]
if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for gallery uploads
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "gallery"), exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Import and include all routers
from routers import (
    auth, dashboard, medicines, water, meals, mood,
    symptoms, sleep, journal, recovery, gallery,
    timeline, achievements, settings, ai_assistant, schedule, telegram, google_fit, period
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(medicines.router)
app.include_router(water.router)
app.include_router(meals.router)
app.include_router(mood.router)
app.include_router(symptoms.router)
app.include_router(sleep.router)
app.include_router(journal.router)
app.include_router(recovery.router)
app.include_router(gallery.router)
app.include_router(timeline.router)
app.include_router(achievements.router)
app.include_router(settings.router)
app.include_router(ai_assistant.router)
app.include_router(schedule.router)
app.include_router(telegram.router)
app.include_router(google_fit.router)
app.include_router(period.router)

from scheduler import start_scheduler, stop_scheduler
from seed import seed

@app.on_event("startup")
async def startup_event():
    try:
        seed()
    except Exception as e:
        print(f"Startup seed notice: {e}")
    start_scheduler()

@app.on_event("shutdown")
async def shutdown_event():
    stop_scheduler()


@app.get("/")
def root():
    return {
        "message": "Asifa ❤️ Recovery Companion API is running with love!",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "love": "infinite ❤️"}
