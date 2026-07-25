import sys
import os
import asyncio
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
import models
from services.telegram_service import send_telegram_message

async def send_demos():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(
            models.User.telegram_chat_id.isnot(None),
            models.User.telegram_bot_token.isnot(None)
        ).first()

        if not user:
            print("No linked Telegram user found!")
            return

        bot_token = user.telegram_bot_token
        chat_ids = user.telegram_chat_id.split(",") if user.telegram_chat_id else []

        async def broadcast_msg(text):
            for cid in chat_ids:
                await send_telegram_message(bot_token, cid, text)
                await asyncio.sleep(1)

        print(f"Sending demo notifications to {len(chat_ids)} devices...")

        # 1. Medicine
        await broadcast_msg("💊 <b>guddu jii Paracetamol, ye wala tablet lo munnaa, merii pyaari bacchi ❤️</b>")
        
        # 2. Missed Medicine
        await broadcast_msg("⚠️ <b>guddu!!! abi tume logich ny kare na jii medicine abi ny liye lagtaa...leloo ba munna agar liye rehtoo update kardo jii 🥺</b>")
        
        # 3. Schedule / Meal
        await broadcast_msg("🍽️ <b>munna mammu karloo ba dekhoo time huaa jaldii utnaa ❤️</b>")
        
        # 4. Water
        await broadcast_msg("💧 <b>merii sonparii, paani piyoo ba ek ghanta hua dekoo aur log kardoo jii nakko bhuloo ❤️</b>")
        
        # 5. Morning
        await broadcast_msg("🌅 <b>guddu jii! subha hogayi ba, kaisa soye rat me? chalo jaldi app me log kardo munnaa ❤️</b>")
        
        # 6. Evening
        await broadcast_msg("😊 <b>merii sonparii, kaisa feel karre abi? mood kaisa hai ba tumhara, log kardo jii jaldii ❤️</b>")
        
        # 7. Journal
        await broadcast_msg("📖 <b>munna, chalo din khatam horra, aaj kya kya acha laga journal me likho ba, merii pyaari bacchi ✨</b>")
        
        # 8. AI Tip
        await broadcast_msg("💡 <b>guddu suno jii! ek health tip hai tumhare liye: thoda dhoop (sunlight) lere? subha ki dhoop bhot achi hoti ba ❤️</b>")
        
        # 9. Wind down
        await broadcast_msg("🌙 <b>chalo guddu, bhot time hua! phone rakho aur so jao ba. sweet dreams merii sonparii, kal milte jii! ❤️</b>")
        
        # 10. Love Message
        await broadcast_msg("💝 <b>suno guddu jii! theek se rest karo ba, mai hamesha tumhare sath hu ❤️</b>")

        print("Done sending demos!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(send_demos())
