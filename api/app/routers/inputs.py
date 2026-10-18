import logging
from typing import Literal

from fastapi import APIRouter, HTTPException, Query, Request

from app.limiter import limiter
from app.services.fertilizer import get_fertilizer_recommendation
from app.services.irrigation import get_irrigation_recommendation

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/ping")
def ping():
    return {"module": "input-optimization", "status": "connected"}


@router.get("/recommendation")
@limiter.limit("20/minute")
def get_recommendation(
    request: Request,
    crop: str,
    growth_stage: Literal["sowing", "tillering", "flowering"],
    soil_type: Literal["sandy", "loamy", "clay"],
    area_acres: float = Query(gt=0),
    latitude: float = Query(ge=-90, le=90),
    longitude: float = Query(ge=-180, le=180),
):
    fertilizer = get_fertilizer_recommendation(crop, growth_stage, soil_type, area_acres)
    if not fertilizer:
        raise HTTPException(
            status_code=400,
            detail=f"No fertilizer data available for crop '{crop}' at stage '{growth_stage}'. Supported crops: Wheat, Rice, Maize, Cotton.",
        )

    try:
        irrigation = get_irrigation_recommendation(latitude, longitude)
    except Exception:
        logger.exception("Weather fetch failed")
        raise HTTPException(
            status_code=502,
            detail="Could not fetch weather data. Please try again in a moment.",
        )

    return {
        "fertilizer": fertilizer,
        "irrigation": irrigation,
    }