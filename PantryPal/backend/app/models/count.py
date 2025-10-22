from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, DateTime, select, Date, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID, uuid4
from enum import Enum
from app.database import Base

class CountStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"

class Count(Base):
    __tablename__ = "counts"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    count_date: Mapped[date] = mapped_column(Date, index=True)
    status: Mapped[CountStatus] = mapped_column(String(20), server_default=CountStatus.DRAFT.value)
    created_by: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    reviewed_by: Mapped[Optional[UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_counts")
    reviewer = relationship("User", foreign_keys=[reviewed_by], back_populates="reviewed_counts")
    count_items = relationship("CountItem", back_populates="count", cascade="all, delete-orphan")

    @classmethod
    async def get_by_id(cls, db: AsyncSession, count_id: UUID) -> Optional["Count"]:
        """Get a count by ID."""
        return await db.get(cls, count_id)

    @classmethod
    def get_by_id_sync(cls, db: Session, count_id: UUID) -> Optional["Count"]:
        """Get a count by ID (sync version)."""
        return db.get(cls, count_id)

    @classmethod
    async def get_user_active_count(cls, db: AsyncSession, user_id: UUID, count_date: date) -> Optional["Count"]:
        """Get a user's active count for a specific date."""
        stmt = select(cls).where(
            (cls.created_by == user_id) & 
            (cls.count_date == count_date) &
            (cls.status == CountStatus.DRAFT)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    def get_user_active_count_sync(cls, db: Session, user_id: UUID, count_date: date) -> Optional["Count"]:
        """Get a user's active count for a specific date (sync version)."""
        stmt = select(cls).where(
            (cls.created_by == user_id) & 
            (cls.count_date == count_date) &
            (cls.status == CountStatus.DRAFT)
        )
        result = db.execute(stmt)
        return result.scalar_one_or_none()

class CountItem(Base):
    __tablename__ = "count_items"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    count_id: Mapped[UUID] = mapped_column(ForeignKey("counts.id"))
    item_id: Mapped[UUID] = mapped_column(ForeignKey("items.id"))
    expected_quantity: Mapped[int]
    actual_quantity: Mapped[int]
    discrepancy: Mapped[int]
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    count = relationship("Count", back_populates="count_items")
    item = relationship("Item", back_populates="count_items")

    @property
    def has_significant_discrepancy(self) -> bool:
        """Check if the discrepancy is more than 10% of expected quantity."""
        if self.expected_quantity == 0:
            return self.actual_quantity > 0
        return abs(self.discrepancy) > (self.expected_quantity * 0.1)