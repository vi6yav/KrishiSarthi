import logging

from fastapi import APIRouter, HTTPException, Query, Request

from app.limiter import limiter
from app.services.mandi import fetch_mandi_prices

logger = logging.getLogger(__name__)

router = APIRouter()

# MSP values (₹ per quintal) for 2025-26 season, common crops.
# Source: Ministry of Agriculture MSP announcements — update these each season.
MSP_TABLE = {
    # Kharif 2025-26 season
    "Paddy(Common)": 2369,
    "Paddy(Grade-A)": 2389,
    "Maize": 2400,
    "Bajra": 2775,
    "Ragi": 4886,
    "Jowar(Hybrid)": 3699,
    "Jowar(Maldandi)": 3749,
    "Cotton": 7710,
    "Sesamum(Sesame,Gingelly,Til)": 9267,
    "Groundnut": 7263,
    "Soyabean": 5328,
    "Sunflower Seed": 8300,
    "Arhar (Tur/Red Gram)(Whole)": 8000,
    "Green Gram (Moong)(Whole)": 8768,
    "Black Gram (Urad)(Whole)": 7400,
    # Rabi 2026-27 season
    "Wheat": 2585,
    "Barley": 2150,
    "Bengal Gram(Gram)(Whole)": 5875,
    "Masur Dal (Lentil)": 7000,
    "Mustard": 6200,
    "Safflower": 6540,
}


@router.get("/ping")
def ping():
    return {"module": "mandi-msp-prices", "status": "connected to data.gov.in"}


@router.get("/live")
@limiter.limit("20/minute")
def get_live_prices(
    request: Request,
    state: str | None = Query(default=None, max_length=50),
    commodity: str | None = Query(default=None, max_length=80),
    limit: int = Query(default=20, ge=1, le=100),
):
    try:
        records = fetch_mandi_prices(state=state, commodity=commodity, limit=limit)
    except Exception:
        logger.exception("Mandi price fetch failed")
        raise HTTPException(
            status_code=502,
            detail="Could not reach the mandi data source. Please try again in a moment.",
        )

    results = []
    for r in records:
        commodity_name = r.get("commodity", "")
        modal_price = r.get("modal_price")
        msp = MSP_TABLE.get(commodity_name)

        comparison = None
        if msp and modal_price:
            try:
                diff = float(modal_price) - msp
                comparison = "above_msp" if diff > 0 else "below_msp" if diff < 0 else "equal_to_msp"
            except (ValueError, TypeError):
                comparison = None

        results.append({
            "state": r.get("state"),
            "district": r.get("district"),
            "market": r.get("market"),
            "commodity": commodity_name,
            "variety": r.get("variety"),
            "arrival_date": r.get("arrival_date"),
            "min_price": r.get("min_price"),
            "max_price": r.get("max_price"),
            "modal_price": modal_price,
            "msp": msp,
            "comparison": comparison,
        })

    return {"count": len(results), "results": results}