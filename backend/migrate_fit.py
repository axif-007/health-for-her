from database import engine, Base
from sqlalchemy import text
import models

def migrate():
    # Add new columns to users table
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN google_fit_refresh_token VARCHAR"))
            print("Added google_fit_refresh_token to users")
        except Exception as e:
            print(f"Column might already exist: {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN google_fit_access_token VARCHAR"))
            print("Added google_fit_access_token to users")
        except Exception as e:
            print(f"Column might already exist: {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN google_fit_token_expiry DATETIME"))
            print("Added google_fit_token_expiry to users")
        except Exception as e:
            print(f"Column might already exist: {e}")

    # Create daily_metrics table
    Base.metadata.create_all(bind=engine)
    print("Database migration for Google Fit completed!")

if __name__ == "__main__":
    migrate()
