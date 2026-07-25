import sys
import httpx

token = "8925728420:AAHbYcwLJ0RsrBNv0NXXLeRon5lBCaeybH8"
url = f"https://api.telegram.org/bot{token}/getUpdates"

def test_bot():
    try:
        response = httpx.get(url)
        print("Status Code:", response.status_code)
        print("Response JSON:", response.json())
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_bot()
