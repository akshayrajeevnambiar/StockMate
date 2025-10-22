from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from uuid import UUID
from app.models.count import CountStatus

class CountItemBase(BaseModel):
    item_id: UUID
    actual_quantity: int = Field(..., ge=0)
    notes: Optional[str] = None

class CountItemCreate(CountItemBase):
    pass

class CountItemUpdate(BaseModel):
    actual_quantity: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None

class CountItemRead(CountItemBase):
    id: UUID
    count_id: UUID
    expected_quantity: int
    discrepancy: int
    has_significant_discrepancy: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CountBase(BaseModel):
    count_date: date = Field(default_factory=date.today)
    notes: Optional[str] = None

class CountCreate(CountBase):
    pass

class CountUpdate(BaseModel):
    count_date: Optional[date] = None
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None

class CountRead(CountBase):
    id: UUID
    status: CountStatus
    created_by: UUID
    submitted_at: Optional[datetime]
    reviewed_by: Optional[UUID]
    reviewed_at: Optional[datetime]
    rejection_reason: Optional[str]
    count_items: List[CountItemRead]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CountSubmit(BaseModel):
    notes: Optional[str] = None

class CountReview(BaseModel):
    approved: bool
    rejection_reason: Optional[str] = Field(None, min_length=1)
    notes: Optional[str] = None