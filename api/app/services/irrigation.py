import requests

WEATHER_URL = "https://api.open-meteo.com/v1/forecast"


def get_irrigation_recommendation(latitude: float, longitude: float):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "precipitation_sum,temperature_2m_max",
        "forecast_days": 5,
        "timezone": "auto",
    }

    response = requests.get(WEATHER_URL, params=params, timeout=15)
    response.raise_for_status()
    data = response.json()

    daily = data.get("daily", {})
    dates = daily.get("time", [])
    rainfall = daily.get("precipitation_sum", [])
    max_temps = daily.get("temperature_2m_max", [])

    total_rain_next_5_days = sum(rainfall) if rainfall else 0
    avg_max_temp = sum(max_temps) / len(max_temps) if max_temps else None

    if total_rain_next_5_days >= 15:
        recommendation = "skip_irrigation"
        reason = f"Significant rain expected ({round(total_rain_next_5_days, 1)}mm over next 5 days) — irrigation can be delayed."
    elif total_rain_next_5_days >= 5:
        recommendation = "light_irrigation"
        reason = f"Some rain expected ({round(total_rain_next_5_days, 1)}mm) — light irrigation may still be needed."
    else:
        recommendation = "irrigate_now"
        reason = f"Little to no rain expected ({round(total_rain_next_5_days, 1)}mm over next 5 days) — irrigation recommended."

    return {
        "recommendation": recommendation,
        "reason": reason,
        "total_rain_mm_next_5_days": round(total_rain_next_5_days, 1),
        "avg_max_temp_c": round(avg_max_temp, 1) if avg_max_temp else None,
        "forecast": [
            {"date": dates[i], "rain_mm": rainfall[i], "max_temp_c": max_temps[i]}
            for i in range(len(dates))
        ],
    }