from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os

from database import get_db
import models
from dependencies import get_current_user
from services.google_fit_service import get_auth_url, exchange_code_for_token, sync_user_data

router = APIRouter(prefix="/api/fit", tags=["Google Fit"])


def get_frontend_redirect(path: str) -> str:
    frontend_base = os.environ.get("FRONTEND_URL", "https://health-for-her-frontend.onrender.com").rstrip("/")
    return f"{frontend_base}{path}"


@router.get("/login")
def login_google_fit(request: Request):
    """Redirects the user to the Google OAuth consent screen."""
    base_url = str(request.base_url)
    url = get_auth_url(base_url)
    return RedirectResponse(url=url)


@router.get("/callback")
async def callback_google_fit(request: Request, code: str, db: Session = Depends(get_db)):
    """Handles the callback from Google, exchanges the code, and saves the refresh token."""
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found to link to.")

    base_url = str(request.base_url)

    try:
        tokens = await exchange_code_for_token(code, base_url)
        
        user.google_fit_refresh_token = tokens.get("refresh_token", user.google_fit_refresh_token)
        user.google_fit_access_token = tokens.get("access_token")
        
        expires_in = tokens.get("expires_in", 3599)
        user.google_fit_token_expiry = datetime.now() + timedelta(seconds=expires_in)
        
        db.commit()
        
        # Trigger an initial sync
        await sync_user_data(user, db)
        
        # Redirect back to production frontend settings page
        return RedirectResponse(url=get_frontend_redirect("/settings?fit_linked=true"))
    except Exception as e:
        print(f"Error during Google Fit callback: {e}")
        return RedirectResponse(url=get_frontend_redirect("/settings?fit_linked=error"))


@router.post("/sync")
async def manual_sync(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Manually triggers a sync for the current user."""
    success = await sync_user_data(current_user, db)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to sync Google Fit data. Is it linked?")
    return {"message": "Sync successful"}


@router.get("/metrics")
def get_daily_metrics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Returns the user's daily metrics."""
    metrics = db.query(models.DailyMetrics).filter(models.DailyMetrics.user_id == current_user.id).order_by(models.DailyMetrics.date.desc()).limit(7).all()
    return metrics
