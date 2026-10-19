import time
from datetime import datetime, timedelta

import requests

WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
BACKUP_URL = "https://api.met.no/weatherapi/locationforecast/2.0/compact"
BACKUP_HEADERS = {"User-Agent": "KrishiSarthi/1.0 github.com/vi6yav/KrishiSarthi"}

# Remember recent weather answers for 30 minutes, so repeated checks don't hit the weather service again
CACHE_SECONDS = 30 * 60
_cache = {}


def _fetch_open_meteo(latitude: float, longitude: float):
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "precipitation_sum,temperature_2m_max",
        "forecast_days": 5,
        "timezone": "auto",
    }

    last_error = None
    for wait in (0, 2, 4):  # up to 3 tries; the free service sometimes answers "too many requests" for a few seconds
        if wait:
            time.sleep(wait)
        try:
            response = requests.get(WEATHER_URL, params=params, timeout=10)
            response.raise_for_status()
            daily = response.json().get("daily", {})
            return daily.get("time", []), daily.get("precipitation_sum", []), daily.get("temperature_2m_max", [])
        except requests.exceptions.RequestException as e:
            last_error = e
    raise last_error


def _fetch_backup(latitude: float, longitude: float):
    """Backup weather service (MET Norway), used only if Open-Meteo keeps refusing us."""
    params = {"lat": round(latitude, 4), "lon": round(longitude, 4)}
    response = requests.get(BACKUP_URL, params=params, headers=BACKUP_HEADERS, timeout=10)
    response.raise_for_status()
    timeseries = response.json()["properties"]["timeseries"]

    offset = timedelta(hours=round(longitude / 15))  # rough local time from longitude
    rain = {}
    temps = {}
    covered_until = None

    for entry in timeseries:
        moment = datetime.fromisoformat(entry["time"].replace("Z", "+00:00"))
        day = (moment + offset).date().isoformat()

        temperature = entry["data"]["instant"]["details"].get("air_temperature")
        if temperature is not None:
            temps[day] = max(temps.get(day, temperature), temperature)

        # Count each hour of rain once: use hourly values when present, 6-hour blocks later on
        if covered_until is None or moment >= covered_until:
            next_1 = entry["data"].get("next_1_hours")
            next_6 = entry["data"].get("next_6_hours")
            if next_1:
                amount, covered_until = next_1["details"].get("precipitation_amount", 0), moment + timedelta(hours=1)
            elif next_6:
                amount, covered_until = next_6["details"].get("precipitation_amount", 0), moment + timedelta(hours=6)
            else:
                continue
            rain[day] = rain.get(day, 0) + amount

    days = sorted(temps)[:5]
    return days, [round(rain.get(d, 0), 1) for d in days], [round(temps[d], 1) for d in days]


def _get_weather(latitude: float, longitude: float):
    key = (round(latitude, 1), round(longitude, 1))
    cached = _cache.get(key)
    if cached and time.time() - cached[0] < CACHE_SECONDS:
        return cached[1]

    try:
        weather = _fetch_open_meteo(latitude, longitude)
    except Exception:
        weather = _fetch_backup(latitude, longitude)  # if this also fails, the error goes to the caller

    if len(_cache) > 200:
        _cache.clear()
    _cache[key] = (time.time(), weather)
    return weather


def get_irrigation_recommendation(latitude: float, longitude: float):
    dates, rainfall, max_temps = _get_weather(latitude, longitude)

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