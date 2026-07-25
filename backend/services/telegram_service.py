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

async def get_chat_id_from_updates(bot_token: str):
    """
    Fetches the latest updates from the bot and returns the chat_id
    of the most recent message, ideally one containing '/start'.
    """
    if not bot_token:
        return None
        
    url = f"{TELEGRAM_API_URL}{bot_token}/getUpdates"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if data.get("ok") and data.get("result"):
                results = data["result"]
                # We want to find the most recent message
                # Sort by update_id just in case
                results.sort(key=lambda x: x.get("update_id", 0), reverse=True)
                
                for update in results:
                    if "message" in update and "chat" in update["message"]:
                        chat_id = str(update["message"]["chat"]["id"])
                        text = update["message"].get("text", "")
                        
                        # Prioritize a /start message, otherwise take the latest message
                        if "/start" in text:
                            return chat_id
                            
                # If no /start found, just return the chat_id of the most recent message
                if results and "message" in results[0] and "chat" in results[0]["message"]:
                    return str(results[0]["message"]["chat"]["id"])
                    
            return None
    except Exception as e:
        print(f"Failed to fetch updates from Telegram: {e}")
        return None
