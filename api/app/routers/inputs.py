from fastapi import APIRouter, HTTPException, Query
from typing import Literal

from app.services.fertilizer import get_fertilizer_recommendation
from app.services.irrigation import get_irrigation_recommendation

router = APIRouter()


@router.get("/ping")
def ping():
    return {"module": "input-optimization", "status": "connected"}


@router.get("/recommendation")
def get_recommendation(
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
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch weather data: {str(e)}")

    return {
        "fertilizer": fertilizer,
        "irrigation": irrigation,
    }