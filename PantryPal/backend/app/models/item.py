from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String, Integer, Text, ForeignKey, select, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class ItemCategory(str, Enum):
    PRODUCE = "Produce"
    DAIRY = "Dairy"
    MEAT_SEAFOOD = "Meat & Seafood"
    DRY_GOODS = "Dry Goods"
    CANNED_GOODS = "Canned Goods"
    BEVERAGES = "Beverages"
    FROZEN_FOODS = "Frozen Foods"
    OTHER = "Other"

class Item(Base):
    __tablename__ = "items"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[ItemCategory] = mapped_column(String(50))
    unit_of_measure: Mapped[str] = mapped_column(String(50))
    par_level: Mapped[int] = mapped_column(Integer)
    current_quantity: Mapped[int] = mapped_column(Integer)
    created_by: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    creator = relationship("User", back_populates="items")
    count_items = relationship("CountItem", back_populates="item")

    @property
    def is_low_stock(self) -> bool:
        """Check if item is below par level."""
        return self.current_quantity < self.par_level

    @classmethod
    def get_by_id(cls, db, item_id: UUID) -> Optional["Item"]:
        """Get an item by ID."""
        return db.get(cls, item_id)

    @classmethod
    def get_by_id_sync(cls, db, item_id: UUID) -> Optional["Item"]:
        """Get an item by ID (sync version - alias for compatibility)."""
        return db.get(cls, item_id)

    @classmethod
    def get_low_stock(cls, db) -> list["Item"]:
        """Get all items that are below their par level."""
        stmt = select(cls).where(cls.current_quantity < cls.par_level)
        result = db.execute(stmt)
        return result.scalars().all()