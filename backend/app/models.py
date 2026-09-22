"""SQLAlchemy models for ProcurePro.

Business models (Standards, Tenders, Compliance Checks, etc.) will be defined here.
"""

from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from app.db import Base


class HealthRecord(Base):
    """Optional audit model tracking system health or diagnostic pings."""
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), nullable=False, default="ok")
    checked_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )
