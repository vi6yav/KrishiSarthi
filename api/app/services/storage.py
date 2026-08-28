from datetime import date
import requests

WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

# Reference: typical shelf life in days for common perishable crops,
# at ambient (room) temperature vs proper cold storage (~4-10°C).
# Source: FAO post-harvest handling guidelines — general reference figures.
SHELF_LIFE_TABLE = {
    "Tomato":       {"ambient_days": 7,  "cold_storage_days": 21},
    "Onion":        {"ambient_days": 30, "cold_storage_days": 150},
    "Potato":       {"ambient_days": 30, "cold_storage_days": 120},
    "Banana":       {"ambient_days": 5,  "cold_storage_days": 14},
    "Mango":        {"ambient_days": 7,  "cold_storage_days": 21},
    "Leafy Greens": {"ambient_days": 2,  "cold_storage_days": 10},
    "Cabbage":      {"ambient_days": 10, "cold_storage_days": 60},
}


def get_current_temperature(latitude: float, longitude: float) -> float | None:
    try:
        params = {"latitude": latitude, "longitude": longitude, "current": "temperature_2m", "timezone": "auto"}
        response = requests.get(WEATHER_URL, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        return data.get("current", {}).get("temperature_2m")
    except Exception:
        return None


def get_spoilage_risk(crop: str, harvest_date: str, has_cold_storage: bool, latitude: float, longitude: float):
    crop_data = SHELF_LIFE_TABLE.get(crop)
    if not crop_data:
        return None

    days_since_harvest = (date.today() - date.fromisoformat(harvest_date)).days
    if days_since_harvest < 0:
        return None

    base_shelf_life = crop_data["cold_storage_days"] if has_cold_storage else crop_data["ambient_days"]

    # If stored at ambient temperature and it's genuinely hot outside,
    # shelf life shrinks faster than the baseline assumes.
    current_temp = get_current_temperature(latitude, longitude)
    adjusted_shelf_life = base_shelf_life
    if not has_cold_storage and current_temp is not None and current_temp >= 32:
        adjusted_shelf_life = round(base_shelf_life * 0.7)

    days_remaining = adjusted_shelf_life - days_since_harvest
    percent_remaining = max(0, (days_remaining / adjusted_shelf_life) * 100) if adjusted_shelf_life > 0 else 0

    if days_remaining <= 0:
        risk_level = "critical"
    elif percent_remaining <= 25:
        risk_level = "high"
    elif percent_remaining <= 50:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "crop": crop,
        "days_since_harvest": days_since_harvest,
        "has_cold_storage": has_cold_storage,
        "current_temp_c": current_temp,
        "estimated_shelf_life_days": adjusted_shelf_life,
        "days_remaining": max(0, days_remaining),
        "risk_level": risk_level,
    }