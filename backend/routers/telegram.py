from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from dependencies import get_current_user
import models
from schemas import UserOut
from services.telegram_service import get_all_chat_ids_from_updates, send_telegram_message

router = APIRouter(prefix="/api/telegram", tags=["telegram"])

@router.post("/link", response_model=UserOut)
async def link_telegram_account(
    bot_token: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Links Telegram chats by fetching all chat IDs that have messaged the bot
    and broadcasting notifications to all linked devices.
    """
    if not bot_token:
        raise HTTPException(status_code=400, detail="Bot token is required")

    found_chat_ids = await get_all_chat_ids_from_updates(bot_token)
    
    if not found_chat_ids:
        raise HTTPException(
            status_code=404, 
            detail="Could not find any Telegram chat. Please make sure both you and her have sent '/start' to the bot on Telegram and try again."
        )

    # Save to database by merging all unique chat IDs
    existing_ids = current_user.telegram_chat_id.split(",") if current_user.telegram_chat_id else []
    for cid in found_chat_ids:
        if cid not in existing_ids:
            existing_ids.append(cid)
        
    current_user.telegram_bot_token = bot_token
    current_user.telegram_chat_id = ",".join(existing_ids)
    db.commit()
    db.refresh(current_user)

    # Send confirmation message via Telegram to ALL linked chats
    for cid in existing_ids:
        await send_telegram_message(
            bot_token, 
            cid, 
            "🎉 <b>Successfully Linked!</b>\n\nI am Asifa's Recovery Companion Bot! Notifications are now live for this phone! ❤️"
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
