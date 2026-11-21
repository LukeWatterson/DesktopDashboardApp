import requests
import os
from dotenv import load_dotenv

load_dotenv()

lat = os.getenv("WEATHER_LAT")
lon = os.getenv("WEATHER_LON")
key = os.getenv("WEATHER_API_KEY")

def get_weather():
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=metric"

    response = requests.get(url, timeout=10)

    response.raise_for_status()
    data = response.json()
    return {
        "temperature": round(data["main"]["temp"]),
        "feels_like": round(data["main"]["feels_like"]),
        "humidity": data["main"]["humidity"],
        "description": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"],
        "wind_speed": data["wind"]["speed"],
        "location": data["name"],
        "rain": data.get("rain", {}).get("1h", 0)
    }