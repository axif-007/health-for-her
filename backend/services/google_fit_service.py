import httpx
from datetime import datetime, timedelta
import urllib.parse
from sqlalchemy.orm import Session
import models

GOOGLE_CLIENT_ID = "872958533118-3afvibmm9d27gkv97alsgksh6iq64q4o.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "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"
REDIRECT_URI = "http://localhost:8001/api/fit/callback"
# If testing from frontend on port 5174, the redirect URI MUST match exactly what's registered in Google Console.
# The user registered http://localhost:8001/api/fit/callback

def get_auth_url():
    scopes = [
        "https://www.googleapis.com/auth/fitness.activity.read",
        "https://www.googleapis.com/auth/fitness.sleep.read",
        "https://www.googleapis.com/auth/fitness.body.read"
    ]
    
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(scopes),
        "access_type": "offline",
        "prompt": "consent"
    })
    return url

async def exchange_code_for_token(code: str):
    async with httpx.AsyncClient() as client:
        response = await client.post("https://oauth2.googleapis.com/token", data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": REDIRECT_URI
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
            { "dataTypeName": "com.google.active_minutes" }
        ],
        "bucketByTime": { "durationMillis": 86400000 },
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
            print("Google Fit API Error:", response.text)
            return []
        
        return response.json().get("bucket", [])

async def sync_user_data(user: models.User, db: Session):
    if not user.google_fit_refresh_token:
        return False
        
    # Refresh token to get a new access token
    token_data = await refresh_access_token(user.google_fit_refresh_token)
    if not token_data:
        return False
        
    access_token = token_data.get("access_token")
    
    # Fetch last 7 days
    end_time = datetime.now()
    start_time = end_time - timedelta(days=7)
    
    buckets = await fetch_fit_data(access_token, start_time, end_time)
    
    for bucket in buckets:
        start_millis = int(bucket.get("startTimeMillis", 0))
        bucket_date = datetime.fromtimestamp(start_millis / 1000.0).date()
        
        steps = 0
        calories = 0.0
        active_mins = 0
        
        for dataset in bucket.get("dataset", []):
            for point in dataset.get("point", []):
                for value in point.get("value", []):
                    val = value.get("intVal") or value.get("fpVal") or 0
                    ds_name = dataset.get("dataSourceId", "")
                    
                    if "step_count" in ds_name:
                        steps += val
                    elif "calories" in ds_name:
                        calories += val
                    elif "active_minutes" in ds_name:
                        active_mins += val

        # Update DB
        metric = db.query(models.DailyMetrics).filter(
            models.DailyMetrics.user_id == user.id,
            models.DailyMetrics.date == bucket_date
        ).first()
        
        if not metric:
            metric = models.DailyMetrics(user_id=user.id, date=bucket_date)
            db.add(metric)
            
        metric.steps = int(steps)
        metric.calories = float(calories)
        metric.active_minutes = int(active_mins)
        
    db.commit()
    return True
