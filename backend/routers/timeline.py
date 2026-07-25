from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
import models, schemas

router = APIRouter(prefix="/api/timeline", tags=["Timeline"])


@router.get("/", response_model=List[schemas.TimelineEventOut])
def get_timeline(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.TimelineEvent).filter(
        models.TimelineEvent.user_id == current_user.id
    ).order_by(models.TimelineEvent.event_date).all()


@router.post("/", response_model=schemas.TimelineEventOut)
def create_event(
    event: schemas.TimelineEventCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_event = models.TimelineEvent(user_id=current_user.id, **event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(models.TimelineEvent).filter(
        models.TimelineEvent.id == event_id,
        models.TimelineEvent.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": "Event deleted"}
