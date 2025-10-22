from typing import Optional
from pydantic import BaseModel, Field
from uuid import UUID
from app.models.item import ItemCategory

class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: ItemCategory
    unit_of_measure: str = Field(..., min_length=1, max_length=50)
    par_level: int = Field(..., gt=0)
    current_quantity: int = Field(..., ge=0)

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[ItemCategory] = None
    unit_of_measure: Optional[str] = Field(None, min_length=1, max_length=50)
    par_level: Optional[int] = Field(None, gt=0)
    current_quantity: Optional[int] = Field(None, ge=0)

class ItemRead(ItemBase):
    id: UUID
    created_by: UUID
    is_low_stock: bool

    class Config:
        from_attributes = True