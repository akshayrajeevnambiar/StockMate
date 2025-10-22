from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Enum as SQLAEnum, select, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from enum import Enum
from app.database import Base

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    STAFF = "staff"

class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    # Use enum values (e.g. 'admin') rather than enum names (e.g. 'ADMIN') so DB rows match
    role: Mapped[UserRole] = mapped_column(
        SQLAEnum(UserRole, values_callable=lambda enum: [e.value for e in enum])
    )
    is_active: Mapped[bool] = mapped_column(Boolean, server_default='true')
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    items = relationship("Item", back_populates="creator")
    created_counts = relationship("Count", back_populates="creator", foreign_keys="[Count.created_by]")
    reviewed_counts = relationship("Count", back_populates="reviewer", foreign_keys="[Count.reviewed_by]")
    @classmethod
    def get_by_id(cls, db: Session, user_id: UUID) -> Optional["User"]:
        """Get a user by ID."""
        return db.get(cls, user_id)

    @classmethod
    def get_by_email(cls, db: Session, email: str) -> Optional["User"]:
        """Get a user by email."""
        stmt = select(cls).where(cls.email == email)
        result = db.execute(stmt)
        return result.scalar_one_or_none()