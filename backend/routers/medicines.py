from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta, datetime
from typing import List, Optional

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])


@router.get("/", response_model=List[schemas.MedicineOut])
def get_medicines(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Medicine).filter(
        models.Medicine.user_id == current_user.id,
        models.Medicine.is_active == True
    ).all()


@router.post("/", response_model=schemas.MedicineOut)
def create_medicine(
    medicine: schemas.MedicineCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_medicine = models.Medicine(user_id=current_user.id, **medicine.model_dump())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine


@router.delete("/{medicine_id}")
def delete_medicine(
    medicine_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    medicine = db.query(models.Medicine).filter(
        models.Medicine.id == medicine_id,
        models.Medicine.user_id == current_user.id
    ).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    medicine.is_active = False
    db.commit()
    return {"message": "Medicine removed"}


@router.get("/logs/today", response_model=List[dict])
def get_today_logs(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    medicines = db.query(models.Medicine).filter(
        models.Medicine.user_id == current_user.id,
        models.Medicine.is_active == True
    ).all()

    result = []
    for med in medicines:
        log = db.query(models.MedicineLog).filter(
            models.MedicineLog.medicine_id == med.id,
            models.MedicineLog.date == today
        ).first()
        result.append({
            "medicine": schemas.MedicineOut.model_validate(med).model_dump(),
            "taken": log.taken if log else False,
            "taken_at": log.taken_at.isoformat() if log and log.taken_at else None,
            "log_id": log.id if log else None
        })
    return result


@router.post("/logs/take/{medicine_id}")
def take_medicine(
    medicine_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    medicine = db.query(models.Medicine).filter(
        models.Medicine.id == medicine_id,
        models.Medicine.user_id == current_user.id
    ).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    log = db.query(models.MedicineLog).filter(
        models.MedicineLog.medicine_id == medicine_id,
        models.MedicineLog.date == today
    ).first()

    if log:
        log.taken = True
        log.taken_at = datetime.now()
    else:
        log = models.MedicineLog(
            user_id=current_user.id,
            medicine_id=medicine_id,
            date=today,
            taken=True,
            taken_at=datetime.now()
        )
        db.add(log)
    db.commit()
    return {"message": "Medicine marked as taken ❤️", "taken_at": datetime.now().isoformat()}


@router.get("/logs/history")
def get_medicine_history(
    days: int = 7,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    logs = db.query(models.MedicineLog).filter(
        models.MedicineLog.user_id == current_user.id,
        models.MedicineLog.date >= start_date,
        models.MedicineLog.date <= end_date
    ).all()

    # Group by date
    by_date = {}
    for log in logs:
        d = str(log.date)
        if d not in by_date:
            by_date[d] = {"taken": 0, "missed": 0}
        if log.taken:
            by_date[d]["taken"] += 1
        else:
            by_date[d]["missed"] += 1
    
    return by_date


@router.get("/stats/weekly")
def get_weekly_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    end_date = date.today()
    start_date = end_date - timedelta(days=6)
    total_meds = db.query(models.Medicine).filter(
        models.Medicine.user_id == current_user.id,
        models.Medicine.is_active == True
    ).count()

    labels = []
    taken_counts = []
    
    for i in range(7):
        d = start_date + timedelta(days=i)
        labels.append(d.strftime("%a"))
        taken = db.query(models.MedicineLog).filter(
            models.MedicineLog.user_id == current_user.id,
            models.MedicineLog.date == d,
            models.MedicineLog.taken == True
        ).count()
        taken_counts.append(taken)
    
    return {
        "labels": labels,
        "taken": taken_counts,
        "total_per_day": total_meds
    }
