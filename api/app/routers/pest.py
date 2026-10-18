import logging
import os

from fastapi import APIRouter, HTTPException, Request, UploadFile, File

from app.limiter import limiter
from app.services.pest import predict_disease

logger = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
MAX_FILE_SIZE_MB = 10
MAX_FILE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


@router.get("/ping")
def ping():
    return {"module": "pest-prediction", "status": "connected"}


@router.post("/detect")
@limiter.limit("6/minute")
async def detect_disease(request: Request, file: UploadFile = File(...)):
    # Switch: set PEST_ENABLED=false on the server to stop the AI model from loading
    if os.getenv("PEST_ENABLED", "true").lower() != "true":
        raise HTTPException(
            status_code=503,
            detail="Pest detection is temporarily unavailable. Please try again later.",
        )

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Please upload a JPEG, PNG, or WEBP image.",
        )

    # Read at most 1 byte more than the limit, so a huge file can't fill the server's memory
    image_bytes = await file.read(MAX_FILE_BYTES + 1)

    if len(image_bytes) > MAX_FILE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Please upload an image under {MAX_FILE_SIZE_MB}MB.",
        )

    try:
        result = predict_disease(image_bytes)
    except Exception:
        logger.exception("Pest prediction failed")
        raise HTTPException(
            status_code=500,
            detail="Prediction failed. Please try a different image.",
        )

    return result
