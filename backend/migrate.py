import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import engine

def migrate_db():
    with engine.begin() as conn:
        try:
            conn.exec_driver_sql("ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR")
            print("Added telegram_chat_id to users")
        except Exception as e:
            pass
        
        try:
            conn.exec_driver_sql("ALTER TABLE medicines ADD COLUMN last_reminded_date DATE")
            conn.exec_driver_sql("ALTER TABLE medicines ADD COLUMN last_missed_alert_date DATE")
            print("Added fields to medicines")
        except Exception as e:
            pass
            
        try:
            conn.exec_driver_sql("ALTER TABLE schedule_tasks ADD COLUMN is_reminded BOOLEAN DEFAULT 0")
            print("Added fields to schedule_tasks")
        except Exception as e:
            pass
            
        try:
            conn.exec_driver_sql("ALTER TABLE settings ADD COLUMN last_water_reminded_at DATETIME")
            conn.exec_driver_sql("ALTER TABLE settings ADD COLUMN last_sleep_prompt_date DATE")
            conn.exec_driver_sql("ALTER TABLE settings ADD COLUMN last_mood_prompt_date DATE")
            conn.exec_driver_sql("ALTER TABLE settings ADD COLUMN last_journal_prompt_date DATE")
            conn.exec_driver_sql("ALTER TABLE settings ADD COLUMN last_love_message_date DATE")
            conn.exec_driver_sql("ALTER TABLE settings ADD COLUMN last_ai_tip_date DATE")
            conn.exec_driver_sql("ALTER TABLE settings ADD COLUMN last_gallery_drop_date DATE")
            print("Added tracking fields to settings")
        except Exception as e:
            pass

    print("Migration complete!")

if __name__ == "__main__":
    migrate_db()
