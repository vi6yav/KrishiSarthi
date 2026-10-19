"""Run this on YOUR laptop (in India), where data.gov.in is reachable:

    cd api
    python scripts/make_mandi_snapshot.py

It saves today's mandi prices to app/data/mandi_snapshot.json.
"""
import json
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.mandi import BASE_URL, DATA_GOV_API_KEY, HEADERS  # noqa: E402

PAGE_SIZE = 1000
MAX_PAGES = 8
FIELDS = ["state", "district", "market", "commodity", "variety", "arrival_date", "min_price", "max_price", "modal_price"]

if not DATA_GOV_API_KEY:
    sys.exit("DATA_GOV_API_KEY is missing. Put it in api/.env first.")

records = []
for page in range(MAX_PAGES):
    params = {"api-key": DATA_GOV_API_KEY, "format": "json", "limit": PAGE_SIZE, "offset": page * PAGE_SIZE}
    response = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=60)
    response.raise_for_status()
    batch = response.json().get("records", [])
    records.extend({k: r.get(k) for k in FIELDS} for r in batch)
    print(f"page {page + 1}: {len(batch)} records (total {len(records)})")
    if len(batch) < PAGE_SIZE:
        break
    time.sleep(1)

if not records:
    sys.exit("No records came back. Check your key and internet, then try again.")

out = Path(__file__).resolve().parent.parent / "app" / "data" / "mandi_snapshot.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({"fetched_at": datetime.now().strftime("%d %b %Y, %I:%M %p"), "records": records}, ensure_ascii=False), encoding="utf-8")
print(f"Saved {len(records)} records to {out}")