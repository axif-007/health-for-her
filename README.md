# Asifa ❤️ – My Recovery Companion

> A personalized healthcare recovery companion built with love for Asifa 🌸

---

## 🚀 Quick Start

### One-Click Launch (Windows)
Double-click **`start.bat`** in the project root. This will:
1. Seed the database (first time only)
2. Start the FastAPI backend on port 8001
3. Start the React frontend on port 5174

---

## 🔐 Default Login

| Field | Value |
|-------|-------|
| Username | `asifa` |
| Password | `asifa123` |

---

## 🛠 Manual Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed.py        # Run once to create DB + seed data
uvicorn main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev -- --port 5174
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend App | http://localhost:5174 |
| Backend API | http://localhost:8001 |
| Swagger Docs | http://localhost:8001/docs |

---

## 📁 Project Structure

```
health_for_her/
├── backend/
│   ├── main.py              # FastAPI app entry
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT utilities
│   ├── database.py          # SQLite setup
│   ├── seed.py              # DB seeder
│   ├── dependencies.py      # Auth middleware
│   └── routers/             # 16 API modules
│       ├── auth.py
│       ├── dashboard.py
│       ├── medicines.py
│       ├── water.py
│       ├── meals.py
│       ├── mood.py
│       ├── symptoms.py
│       ├── sleep.py
│       ├── journal.py
│       ├── recovery.py
│       ├── gallery.py
│       ├── timeline.py
│       ├── achievements.py
│       ├── settings.py
│       ├── ai_assistant.py
│       └── schedule.py
│
├── frontend/
│   └── src/
│       ├── pages/           # 20+ pages
│       ├── components/      # Reusable UI
│       ├── context/         # Auth context
│       └── App.jsx          # Router
│
└── start.bat               # One-click startup
```

---

## ❤️ Features

- 💊 **Medicine Tracker** – 3-time daily tracking with history
- 💧 **Water Tracker** – Interactive animated bottle
- 📅 **Schedule** – Beautiful timeline with confetti
- 😊 **Mood Tracker** – Emoji-based with weekly analytics
- 🌡️ **Symptom Tracker** – Severity levels (mild/moderate/severe)
- 🌙 **Sleep Tracker** – Auto-calculates hours + quality
- 📖 **Health Journal** – Daily Q&A with history
- 📈 **Recovery Progress** – Charts, BMI, temperature, weight
- 🤖 **AI Health Assistant** – Daily insights + food suggestions
- 🖼️ **Gallery** – Upload photos with lightbox
- 💝 **Memory Timeline** – Relationship milestones
- 🏆 **Achievements** – Unlock badges and rewards
- 🚨 **Emergency Page** – Medical info at a glance
- 📊 **Reports** – PDF export
- 🌟 **Motivation Center** – Love letters, Islamic duas, healing quotes
- ⚙️ **Settings** – Goals, profile, dark mode toggle

---

*Made with ❤️ exclusively for Asifa's recovery journey*
