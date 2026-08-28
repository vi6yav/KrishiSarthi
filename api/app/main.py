from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import user, activity  # noqa: F401 — imported so SQLAlchemy registers the tables
from app.routers import pest, prices, inputs, storage, auth, activity as activity_router

# Creates the actual tables in krishisarthi.db, if they don't already exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KrishiSarthi AI Service",
    description="AI microservice powering pest prediction, input optimization, "
                 "mandi price comparison, and cold storage management for KrishiSarthi.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(activity_router.router, prefix="/api/activity", tags=["Activity"])
app.include_router(pest.router, prefix="/api/pest", tags=["Pest Prediction"])
app.include_router(prices.router, prefix="/api/prices", tags=["Mandi & MSP Prices"])
app.include_router(inputs.router, prefix="/api/inputs", tags=["Input Optimization"])
app.include_router(storage.router, prefix="/api/storage", tags=["Cold Storage"])


@app.get("/")
def root():
    return {"status": "ok", "service": "KrishiSarthi AI Service"}


@app.get("/health")
def health():
    return {"status": "healthy"}