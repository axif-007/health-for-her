import httpx
import asyncio
import json

async def check():
    url = "https://api.telegram.org/bot8925728420:AAHbYcwLJ0RsrBNv0NXXLeRon5lBCaeybH8/getUpdates"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=10)
            print("STATUS:", resp.status_code)
            print("BODY:", json.dumps(resp.json(), indent=2))
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    asyncio.run(check())
