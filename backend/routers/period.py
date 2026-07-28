from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from typing import List, Optional

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/period", tags=["Period & Cycle Companion"])


def calculate_cycle_details(log: models.PeriodLog):
    today = date.today()
    start = log.start_date
    cycle_len = log.cycle_length or 28
    period_len = log.period_length or 5

    # Days since period started
    days_since_start = (today - start).days

    # Current cycle day (1-indexed)
    cycle_day = (days_since_start % cycle_len) + 1

    # Next expected period
    cycles_completed = days_since_start // cycle_len
    next_period_start = start + timedelta(days=(cycles_completed + 1) * cycle_len)
    days_until_next = (next_period_start - today).days

    # Current phase calculation
    if cycle_day <= period_len:
        phase = "Menstrual Phase 🌸"
        phase_desc = "Day " + str(cycle_day) + " of period — rest, take it easy & stay warm!"
        phase_color = "#FF6B9D"
        care_tip = "Merii sonparii, aaj bilkul heavy kaam mat karoo. Warm water pouch use karoo aur rest karoo jii! ❤️"
    elif cycle_day <= (cycle_len // 2) - 2:
        phase = "Follicular Phase 🌱"
        phase_desc = "Energy is rising! Great time for gentle activities."
        phase_color = "#48CAE4"
        care_tip = "Energy wapas aarahi hai munna! Keep hydrated & eat nutritious meals. 💕"
    elif cycle_day <= (cycle_len // 2) + 2:
        phase = "Ovulation Phase 🌟"
        phase_desc = "Peak energy & fertile window."
        phase_color = "#F7B731"
        care_tip = "Peak energy day! Smile & enjoy your day guddu jii! ✨"
    else:
        phase = "Luteal Phase 🌙"
        phase_desc = "Winding down before next cycle. Take extra care of yourself."
        phase_color = "#7B4F9E"
        care_tip = "Next period aane wala hai munna, light tea piyoo aur achhi neend lo! 😴"

    # Ovulation & Fertile Window
    estimated_ovulation = start + timedelta(days=(cycles_completed * cycle_len) + (cycle_len - 14))
    if estimated_ovulation < today:
        estimated_ovulation = next_period_start - timedelta(days=14)

    fertile_start = estimated_ovulation - timedelta(days=5)
    fertile_end = estimated_ovulation + timedelta(days=1)

    return {
        "log": schemas.PeriodLogOut.model_validate(log),
        "cycle_day": cycle_day,
        "days_since_start": days_since_start,
        "is_on_period": cycle_day <= period_len,
        "phase": phase,
        "phase_desc": phase_desc,
        "phase_color": phase_color,
        "care_tip": care_tip,
        "next_period_date": next_period_start.isoformat(),
        "days_until_next": max(0, days_until_next),
        "estimated_ovulation_date": estimated_ovulation.isoformat(),
        "fertile_window_start": fertile_start.isoformat(),
        "fertile_window_end": fertile_end.isoformat()
    }


@router.post("/log", response_model=schemas.PeriodLogOut)
def create_or_update_log(
    payload: schemas.PeriodLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if a log for this exact start_date already exists
    existing = db.query(models.PeriodLog).filter(
        models.PeriodLog.user_id == current_user.id,
        models.PeriodLog.start_date == payload.start_date
    ).first()

    if existing:
        existing.end_date = payload.end_date or existing.end_date
        existing.cycle_length = payload.cycle_length or existing.cycle_length
        existing.period_length = payload.period_length or existing.period_length
        existing.flow_intensity = payload.flow_intensity or existing.flow_intensity
        existing.cramps_level = payload.cramps_level if payload.cramps_level is not None else existing.cramps_level
        existing.mood = payload.mood or existing.mood
        existing.notes = payload.notes or existing.notes
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_log = models.PeriodLog(
            user_id=current_user.id,
            start_date=payload.start_date,
            end_date=payload.end_date,
            cycle_length=payload.cycle_length or 28,
            period_length=payload.period_length or 5,
            flow_intensity=payload.flow_intensity or "medium",
            cramps_level=payload.cramps_level or 0,
            mood=payload.mood,
            notes=payload.notes
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        return new_log


@router.get("/latest")
def get_latest_cycle(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(models.PeriodLog).filter(
        models.PeriodLog.user_id == current_user.id
    ).order_by(models.PeriodLog.start_date.desc()).first()

    if not log:
        # Fallback default if none logged yet (defaulting to today 28-07-2026 as mentioned by user)
        default_log = models.PeriodLog(
            user_id=current_user.id,
            start_date=date.today(),
            cycle_length=28,
            period_length=5,
            flow_intensity="medium",
            cramps_level=2,
            mood="resting",
            notes="Period started today"
        )
        db.add(default_log)
        db.commit()
        db.refresh(default_log)
        log = default_log

    return calculate_cycle_details(log)


@router.get("/history", response_model=List[schemas.PeriodLogOut])
def get_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.PeriodLog).filter(
        models.PeriodLog.user_id == current_user.id
    ).order_by(models.PeriodLog.start_date.desc()).all()


@router.delete("/{log_id}")
def delete_log(
    log_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(models.PeriodLog).filter(
        models.PeriodLog.id == log_id,
        models.PeriodLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
    return {"message": "Period log deleted"}
