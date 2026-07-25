from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from database import SessionLocal
import models
from datetime import datetime, date, timedelta
from services.telegram_service import send_telegram_message, send_telegram_photo
import random
import os

scheduler = AsyncIOScheduler()

async def process_notifications():
    db = SessionLocal()
    try:
        users = db.query(models.User).filter(
            models.User.telegram_chat_id.isnot(None),
            models.User.telegram_bot_token.isnot(None)
        ).all()

        now = datetime.now()
        current_date = now.date()
        current_time_str = now.strftime("%I:%M %p").lstrip("0") # e.g. "8:30 AM"
        current_hour = now.hour
        current_minute = now.minute

        for user in users:
            bot_token = user.telegram_bot_token
            chat_ids = user.telegram_chat_id.split(",") if user.telegram_chat_id else []
            settings = db.query(models.Settings).filter(models.Settings.user_id == user.id).first()
            if not settings or not chat_ids:
                continue

            async def broadcast_msg(text):
                for cid in chat_ids:
                    await send_telegram_message(bot_token, cid, text)
            
            async def broadcast_photo(photo_path, caption):
                for cid in chat_ids:
                    await send_telegram_photo(bot_token, cid, photo_path, caption)

            # 1. ⏰ EXACT TIME REMINDERS (MEDICINES)
            medicines = db.query(models.Medicine).filter(models.Medicine.user_id == user.id, models.Medicine.is_active == True).all()
            for med in medicines:
                if med.reminder_time:
                    try:
                        med_hour, med_min = map(int, med.reminder_time.split(':'))
                        # Exact match
                        if current_hour == med_hour and current_minute == med_min:
                            if med.last_reminded_date != current_date:
                                await broadcast_msg(f"💊 <b>guddu jii {med.name}, ye wala tablet lo munnaa, merii pyaari bacchi ❤️</b>")
                                med.last_reminded_date = current_date
                        
                        # 🚨 MISSED MEDICINE ALERT (1 hour later)
                        expected_time = datetime(now.year, now.month, now.day, med_hour, med_min)
                        one_hour_later = expected_time + timedelta(hours=1)
                        if current_hour == one_hour_later.hour and current_minute == one_hour_later.minute:
                            log = db.query(models.MedicineLog).filter(
                                models.MedicineLog.medicine_id == med.id,
                                models.MedicineLog.date == current_date,
                                models.MedicineLog.taken == True
                            ).first()
                            if not log and med.last_missed_alert_date != current_date:
                                await broadcast_msg(f"⚠️ <b>guddu!!! abi tume logich ny kare na jii medicine abi ny liye lagtaa...leloo ba munna agar liye rehtoo update kardo jii 🥺</b>")
                                med.last_missed_alert_date = current_date
                    except Exception as e:
                        print(f"Error processing medicine {med.id}: {e}")

            # 2. ⏰ EXACT TIME REMINDERS (SCHEDULE & MEALS)
            tasks = db.query(models.ScheduleTask).filter(models.ScheduleTask.user_id == user.id, models.ScheduleTask.date == current_date).all()
            for task in tasks:
                if task.time_label and task.time_label.upper() == current_time_str.upper():
                    if not task.is_reminded:
                        # Custom formatting for meals
                        if any(x in task.title.lower() for x in ["tiffin", "breakfast", "lunch", "dinner", "meal"]):
                            await broadcast_msg(f"🍽️ <b>munna mammu karloo ba dekhoo time huaa jaldii utnaa ❤️</b>")
                        else:
                            await broadcast_msg(f"{task.icon or '📅'} <b>guddu jii dekho time hua, {task.title} karna hai ba jaldii karloo! ❤️</b>")
                        task.is_reminded = True

            # 3. 💧 HOURLY WATER REMINDER
            if current_minute == 0 and 8 <= current_hour <= 23:
                if not settings.last_water_reminded_at or settings.last_water_reminded_at.hour != current_hour or settings.last_water_reminded_at.date() != current_date:
                    await broadcast_msg("💧 <b>merii sonparii, paani piyoo ba ek ghanta hua dekoo aur log kardoo jii nakko bhuloo ❤️</b>")
                    settings.last_water_reminded_at = now

            # 4. 📝 DAILY HEALTH PROMPTS
            # Morning Sleep Log (8:00 AM)
            if current_hour == 8 and current_minute == 0 and settings.last_sleep_prompt_date != current_date:
                await broadcast_msg("🌅 <b>guddu jii! subha hogayi ba, kaisa soye rat me? chalo jaldi app me log kardo munnaa ❤️</b>")
                settings.last_sleep_prompt_date = current_date

            # Evening Mood Log (8:00 PM)
            if current_hour == 20 and current_minute == 0 and settings.last_mood_prompt_date != current_date:
                await broadcast_msg("😊 <b>merii sonparii, kaisa feel karre abi? mood kaisa hai ba tumhara, log kardo jii jaldii ❤️</b>")
                settings.last_mood_prompt_date = current_date

            # Night Journal (11:30 PM)
            if current_hour == 23 and current_minute == 30 and settings.last_journal_prompt_date != current_date:
                await broadcast_msg("📖 <b>munna, chalo din khatam horra, aaj kya kya acha laga journal me likho ba, merii pyaari bacchi ✨</b>")
                settings.last_journal_prompt_date = current_date

            # 5. 💡 AI HEALTH TIP (10:00 AM)
            if current_hour == 10 and current_minute == 0 and settings.last_ai_tip_date != current_date:
                tips = [
                    "guddu suno jii! ek health tip hai tumhare liye: Deep breathing kara karo 5 minute tak naturally theek feel hota! ye try karo ba ❤️",
                    "guddu suno jii! ek health tip hai tumhare liye: thoda dhoop (sunlight) lere? subha ki dhoop bhot achi hoti ba ❤️",
                    "guddu suno jii! ek health tip hai tumhare liye: rest karna bhot zaroori hai, araam se so jao ba theek hai? ❤️",
                    "guddu suno jii! ek health tip hai tumhare liye: 10 minute thehel liya karo, theek se blood circulation hota ba ❤️",
                    "guddu suno jii! ek health tip hai tumhare liye: paani pite raho ba, jaldi recovery hoti is se! ❤️"
                ]
                await broadcast_msg(f"💡 <b>{random.choice(tips)}</b>")
                settings.last_ai_tip_date = current_date

            # 6. 🌙 BEDTIME WIND-DOWN (12:30 AM)
            if current_hour == 0 and current_minute == 30:
                if not hasattr(settings, 'last_winddown_date') or getattr(settings, 'last_winddown_date', None) != current_date:
                    await broadcast_msg("🌙 <b>chalo guddu, bhot time hua! phone rakho aur so jao ba. sweet dreams merii sonparii, kal milte jii! ❤️</b>")
                    settings.last_winddown_date = current_date 

            # 7. 💝 SPONTANEOUS LOVE MESSAGE (Randomly between 11 AM and 7 PM)
            if 11 <= current_hour <= 19 and settings.last_love_message_date != current_date:
                if random.randint(1, 120) == 1:
                    messages = db.query(models.LoveMessage).all()
                    if messages:
                        msg = random.choice(messages)
                        await broadcast_msg(f"💝 <b>suno guddu jii! {msg.message} ❤️</b>")
                        settings.last_love_message_date = current_date

            # 8. 📸 MEMORY DROP (Gallery)
            if 14 <= current_hour <= 16 and settings.last_gallery_drop_date != current_date:
                if random.randint(1, 100) == 1:
                    photos = db.query(models.GalleryItem).filter(models.GalleryItem.user_id == user.id, models.GalleryItem.file_type == 'image').all()
                    if photos:
                        photo = random.choice(photos)
                        caption = "📸 <i>dekho munna, ye photo dekhe? bhot pyaari lagri tum isme ❤️</i>"
                        if photo.caption:
                            caption += f"\n\n{photo.caption}"
                        
                        abs_path = os.path.join(os.path.dirname(__file__), photo.file_path.lstrip("/"))
                        await broadcast_photo(abs_path, caption)
                        settings.last_gallery_drop_date = current_date

        db.commit()
    except Exception as e:
        print(f"Scheduler Error: {e}")
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(process_notifications, CronTrigger(minute="*"))
    scheduler.start()
    print("APScheduler started for Telegram notifications!")

def stop_scheduler():
    scheduler.shutdown()
