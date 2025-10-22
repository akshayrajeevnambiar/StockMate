from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from uuid import UUID

from app.dependencies import (
    get_current_active_user,
    get_current_manager_or_admin_user
)
from app.database import get_db
from app.models.item import Item, ItemCategory
from app.models.user import User
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate

router = APIRouter()

@router.get("/", response_model=List[ItemRead])
def list_items(
    category: Optional[ItemCategory] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all items, optionally filtered by category."""
    query = select(Item)
    if category:
        query = query.where(Item.category == category)
    
    query = query.offset(skip).limit(limit)
    result = db.execute(query)
    return result.scalars().all()

@router.get("/low-stock", response_model=List[ItemRead])
def list_low_stock_items(
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: Session = Depends(get_db)
):
    """List all items that are below their par level."""
    return Item.get_low_stock(db)

@router.get("/{item_id}", response_model=ItemRead)
def get_item(
    item_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific item by ID."""
    item = Item.get_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/", response_model=ItemRead)
def create_item(
    item: ItemCreate,
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new item."""
    db_item = Item(
        **item.model_dump(),
        created_by=current_user.id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{item_id}", response_model=ItemRead)
def update_item(
    item_id: UUID,
    item_update: ItemUpdate,
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: Session = Depends(get_db)
):
    """Update an existing item."""
    db_item = Item.get_by_id(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for field, value in item_update.model_dump(exclude_unset=True).items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
def delete_item(
    item_id: UUID,
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an item."""
    db_item = Item.get_by_id(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}