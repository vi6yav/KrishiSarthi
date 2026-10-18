from fastapi import APIRouter, HTTPException, Query, Request

from app.limiter import limiter
from app.services.storage import get_spoilage_risk

router = APIRouter()


@router.get("/ping")
def ping():
    return {"module": "cold-storage", "status": "connected"}


@router.get("/risk")
@limiter.limit("20/minute")
def get_risk(
    request: Request,
    crop: str,
    harvest_date: str,
    has_cold_storage: bool = False,
    latitude: float = Query(ge=-90, le=90),
    longitude: float = Query(ge=-180, le=180),
):
    result = get_spoilage_risk(
        crop=crop,
        harvest_date=harvest_date,
        has_cold_storage=has_cold_storage,
        latitude=latitude,
        longitude=longitude,
    )

    if result is None:
        raise HTTPException(
            status_code=400,
            detail=f"No shelf-life data for crop '{crop}', or invalid harvest_date. Supported crops: Tomato, Onion, Potato, Banana, Mango, Leafy Greens, Cabbage.",
        )

    return result