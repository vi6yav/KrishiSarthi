from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    module = Column(String, nullable=False)       # e.g. "pest", "prices", "inputs", "storage"
    summary = Column(String, nullable=False)       # e.g. "Wheat Brown Rust detected (99.4%)"
    detail = Column(String, nullable=True)         # optional extra info, e.g. raw value
    created_at = Column(DateTime(timezone=True), server_default=func.now())