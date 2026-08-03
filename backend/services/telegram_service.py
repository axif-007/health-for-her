import httpx
import os
import asyncio

TELEGRAM_API_URL = "https://api.telegram.org/bot"

async def send_telegram_message(bot_token: str, chat_id: str, text: str):
    """Sends a text message to a specific Telegram chat."""
    if not bot_token or not chat_id:
        return False
    
    url = f"{TELEGRAM_API_URL}{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=10.0)
            response.raise_for_status()
            return True
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")
        return False

async def send_telegram_photo(bot_token: str, chat_id: str, photo_path: str, caption: str = ""):
    """Sends a photo to a specific Telegram chat."""
    if not bot_token or not chat_id or not os.path.exists(photo_path):
        return False
        
    url = f"{TELEGRAM_API_URL}{bot_token}/sendPhoto"
    
    try:
        async with httpx.AsyncClient() as client:
            with open(photo_path, "rb") as photo_file:
                files = {"photo": photo_file}
                data = {"chat_id": chat_id, "caption": caption, "parse_mode": "HTML"}
                response = await client.post(url, data=data, files=files, timeout=20.0)
                response.raise_for_status()
                return True
    except Exception as e:
        print(f"Failed to send Telegram photo: {e}")
        return False

async def get_all_chat_ids_from_updates(bot_token: str):
    """
    Fetches ALL unique chat_ids of users who have sent messages or /start to the bot.
    """
    if not bot_token:
        return []
        
    url = f"{TELEGRAM_API_URL}{bot_token}/getUpdates"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            chat_ids = []
            if data.get("ok") and data.get("result"):
                for update in data["result"]:
                    if "message" in update and "chat" in update["message"]:
                        cid = str(update["message"]["chat"]["id"])
                        if cid not in chat_ids:
                            chat_ids.append(cid)
            return chat_ids
    except Exception as e:
        print(f"Failed to fetch updates from Telegram: {e}")
        return []

async def get_chat_id_from_updates(bot_token: str):
    ids = await get_all_chat_ids_from_updates(bot_token)
    return ids[-1] if ids else None

