from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/schedule", tags=["Schedule"])


@router.get("/today")
def get_today_schedule(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    tasks = db.query(models.ScheduleTask).filter(
        models.ScheduleTask.user_id == current_user.id,
    ).all()
    
    # Group by period
    grouped = {"morning": [], "day": [], "evening": []}
    for task in tasks:
        period = task.period or "day"
        if period in grouped:
            grouped[period].append({
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "time_label": task.time_label,
                "icon": task.icon,
                "is_completed": task.is_completed,
                "notes": task.notes
            })
    
    total = len(tasks)
    completed = sum(1 for t in tasks if t.is_completed)
    return {
        "tasks": grouped,
        "total": total,
        "completed": completed,
        "percentage": round((completed / total) * 100) if total else 0
    }


@router.put("/complete/{task_id}")
def toggle_task(
    task_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(models.ScheduleTask).filter(
        models.ScheduleTask.id == task_id,
        models.ScheduleTask.user_id == current_user.id
    ).first()
    if not task:
        return {"error": "Task not found"}
    task.is_completed = not task.is_completed
    db.commit()
    return {"id": task.id, "is_completed": task.is_completed}


@router.post("/reset")
def reset_daily_tasks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = db.query(models.ScheduleTask).filter(
        models.ScheduleTask.user_id == current_user.id
    ).all()
    for t in tasks:
        t.is_completed = False
    db.commit()
    return {"message": "Tasks reset for new day"}
