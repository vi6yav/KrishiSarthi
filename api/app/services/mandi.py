import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY")
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

# Saved copy of mandi prices, used when the live government API can't be reached
SNAPSHOT_PATH = Path(__file__).resolve().parent.parent / "data" / "mandi_snapshot.json"


def fetch_mandi_prices(state: str | None = None, commodity: str | None = None, limit: int = 20):
    params = {
        "api-key": DATA_GOV_API_KEY,
        "format": "json",
        "limit": limit,
    }

    if state:
        params["filters[state.keyword]"] = state
    if commodity:
        params["filters[commodity]"] = commodity

    last_error = None
    for attempt in range(3):
        try:
            response = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=25)
            response.raise_for_status()
            data = response.json()
            return data.get("records", [])
        except requests.exceptions.RequestException as e:
            last_error = e
            time.sleep(1)

    raise last_error


def load_snapshot():
    try:
        with open(SNAPSHOT_PATH, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def filter_snapshot(snapshot: dict, state: str | None, commodity: str | None, limit: int):
    def matches(value, wanted):
        return not wanted or wanted.strip().lower() in (value or "").lower()

    records = snapshot.get("records", [])
    found = [r for r in records if matches(r.get("state"), state) and matches(r.get("commodity"), commodity)]
    return found[:limit]