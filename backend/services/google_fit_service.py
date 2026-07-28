import httpx
from datetime import datetime, timedelta
import urllib.parse
from sqlalchemy.orm import Session
import models
import os

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "872958533118-3afvibmm9d27gkv97alsgksh6iq64q4o.apps.googleusercontent.com")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "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")

def get_redirect_uri(base_url: str = None) -> str:
    """Returns the callback URI dynamically based on environment or request host."""
    if os.environ.get("BACKEND_URL"):
        return f"{os.environ.get('BACKEND_URL').rstrip('/')}/api/fit/callback"
    if base_url and "localhost" not in base_url:
        return f"{base_url.rstrip('/')}/api/fit/callback"
    # Production fallback URL on Render
    return "https://health-for-her-backend.onrender.com/api/fit/callback"

def get_auth_url(base_url: str = None):
    scopes = [
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.sleep.read",
        "https://www.googleapis.com/auth/fitness.body.read"
    ]
    redirect_uri = get_redirect_uri(base_url)
    
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join(scopes),
        "access_type": "offline",
        "prompt": "consent"
    })
    return url

async def exchange_code_for_token(code: str, base_url: str = None):
    redirect_uri = get_redirect_uri(base_url)
    async with httpx.AsyncClient() as client:
        response = await client.post("https://oauth2.googleapis.com/token", data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        })
        response.raise_for_status()
        return response.json()

async def refresh_access_token(refresh_token: str):
    async with httpx.AsyncClient() as client:
        response = await client.post("https://oauth2.googleapis.com/token", data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        })
        if response.status_code != 200:
            return None
        return response.json()

async def fetch_fit_data(access_token: str, start_time: datetime, end_time: datetime):
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    
    body = {
        "aggregateBy": [
            { "dataTypeName": "com.google.step_count.delta" },
            { "dataTypeName": "com.google.calories.expended" },
            { "dataTypeName": "com.google.distance.delta" },
            { "dataTypeName": "com.google.active_minutes" }
        ],
        "bucketByTime": { "durationMillis": 86400000 }, # 1 day
        "startTimeMillis": int(start_time.timestamp() * 1000),
        "endTimeMillis": int(end_time.timestamp() * 1000)
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            headers=headers,
            json=body
        )
        if response.status_code != 200:
            print(f"Error fetching Google Fit data: {response.text}")
            return None
        return response.json()

async def sync_user_data(user: models.User, db: Session):
    if not user.google_fit_refresh_token:
        return False
        
    tokens = await refresh_access_token(user.google_fit_refresh_token)
    if not tokens:
        return False
        
    access_token = tokens.get("access_token")
    user.google_fit_access_token = access_token
    db.commit()

    # Sync last 7 days
    end_time = datetime.now()
    start_time = end_time - timedelta(days=7)
    
    data = await fetch_fit_data(access_token, start_time, end_time)
    if not data:
        return False
        
    for bucket in data.get("bucket", []):
        start_ms = int(bucket.get("startTimeMillis", 0))
        bucket_date = datetime.fromtimestamp(start_ms / 1000).date()
        
        steps = 0
        calories = 0.0
        distance = 0.0
        active_mins = 0
        
        for dataset in bucket.get("dataset", []):
            type_name = dataset.get("dataSourceId", "")
            for point in dataset.get("point", []):
                for val in point.get("value", []):
                    if "step_count" in type_name or "step" in dataset.get("dataTypeName", ""):
                        steps += val.get("intVal", 0)
                    elif "calories" in type_name or "calories" in dataset.get("dataTypeName", ""):
                        calories += val.get("fpVal", 0.0)
                    elif "distance" in type_name or "distance" in dataset.get("dataTypeName", ""):
                        distance += val.get("fpVal", 0.0) / 1000.0 # to km
                    elif "active_minutes" in type_name or "active" in dataset.get("dataTypeName", ""):
                        active_mins += val.get("intVal", 0)
                        
        metric = db.query(models.DailyMetrics).filter(
            models.DailyMetrics.user_id == user.id,
            models.DailyMetrics.date == bucket_date
        ).first()
        
        if not metric:
            metric = models.DailyMetrics(
                user_id=user.id,
                date=bucket_date,
                steps=steps,
                calories=round(calories, 1),
                distance_km=round(distance, 2),
                active_minutes=active_mins
            )
            db.add(metric)
        else:
            metric.steps = max(metric.steps, steps)
            metric.calories = max(metric.calories, round(calories, 1))
            metric.distance_km = max(metric.distance_km, round(distance, 2))
            metric.active_minutes = max(metric.active_minutes, active_mins)
            
    db.commit()
    return True
