from fastapi import APIRouter, HTTPException, UploadFile, File

from app.services.pest import predict_disease

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
MAX_FILE_SIZE_MB = 10


@router.get("/ping")
def ping():
    return {"module": "pest-prediction", "status": "connected"}


@router.post("/detect")
async def detect_disease(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Please upload a JPEG, PNG, or WEBP image.",
        )

    image_bytes = await file.read()

    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Please upload an image under {MAX_FILE_SIZE_MB}MB.",
        )

    try:
        result = predict_disease(image_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    return result