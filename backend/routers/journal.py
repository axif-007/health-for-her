from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from database import get_db
from dependencies import get_current_user
import models, schemas
from typing import List

router = APIRouter(prefix="/api/journal", tags=["Journal"])


@router.get("/today")
def get_today_journal(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()
    return db.query(models.JournalEntry).filter(
        models.JournalEntry.user_id == current_user.id,
        models.JournalEntry.date == today
    ).first()


@router.post("/entry", response_model=schemas.JournalEntryOut)
def save_journal(
    entry: schemas.JournalEntryCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.JournalEntry).filter(
        models.JournalEntry.user_id == current_user.id,
        models.JournalEntry.date == entry.date
    ).first()
    if existing:
        for field, value in entry.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing
    journal = models.JournalEntry(user_id=current_user.id, **entry.model_dump())
    db.add(journal)
    db.commit()
    db.refresh(journal)
    return journal


@router.get("/history")
def get_journal_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entries = db.query(models.JournalEntry).filter(
        models.JournalEntry.user_id == current_user.id
    ).order_by(models.JournalEntry.date.desc()).limit(30).all()
    return entries
