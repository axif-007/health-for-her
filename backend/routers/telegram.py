from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
import models
from schemas import UserOut
from services.telegram_service import get_chat_id_from_updates, send_telegram_message

router = APIRouter(prefix="/api/telegram", tags=["telegram"])

@router.post("/link", response_model=UserOut)
async def link_telegram_account(
    bot_token: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Links the user's Telegram account by fetching the latest updates from the bot
    and extracting the chat_id. Requires the user to provide the bot token.
    """
    if not bot_token:
        raise HTTPException(status_code=400, detail="Bot token is required")

    chat_id = await get_chat_id_from_updates(bot_token)
    
    if not chat_id:
        raise HTTPException(
            status_code=404, 
            detail="Could not find your Telegram chat. Please make sure you sent '/start' to the bot and try again."
        )

    # Save to database by appending the new ID if it's not already there
    existing_ids = current_user.telegram_chat_id.split(",") if current_user.telegram_chat_id else []
    if chat_id not in existing_ids:
        existing_ids.append(chat_id)
        
    current_user.telegram_bot_token = bot_token
    current_user.telegram_chat_id = ",".join(existing_ids)
    db.commit()
    db.refresh(current_user)

    # Send a confirmation message via Telegram only to the newly linked chat
    success = await send_telegram_message(
        bot_token, 
        chat_id, 
        "🎉 <b>Successfully Linked!</b>\n\nI am Asifa's Recovery Companion Bot! I will now send reminders, love notes, and health tips right here. ❤️"
    )

    if not success:
        raise HTTPException(
            status_code=500,
            detail="Successfully linked in database, but failed to send the confirmation message on Telegram."
        )

    return current_user

@router.post("/unlink", response_model=UserOut)
async def unlink_telegram_account(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Removes the Telegram integration."""
    current_user.telegram_bot_token = None
    current_user.telegram_chat_id = None
    db.commit()
    db.refresh(current_user)
    return current_user
