from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.dependencies import (
    get_current_active_user,
    get_current_manager_or_admin_user
)
from app.database import get_db
from app.models.item import ItemCategory
from app.models.user import User
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate
from app.services import ItemService

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
    return ItemService.get_items(db, category, skip, limit)

@router.get("/low-stock", response_model=List[ItemRead])
def list_low_stock_items(
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: Session = Depends(get_db)
):
    """List all items that are below their par level."""
    return ItemService.get_low_stock_items(db)

@router.get("/{item_id}", response_model=ItemRead)
def get_item(
    item_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific item by ID."""
    item = ItemService.get_item_by_id(db, item_id)
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
    return ItemService.create_item(db, item, current_user.id)

@router.put("/{item_id}", response_model=ItemRead)
def update_item(
    item_id: UUID,
    item_update: ItemUpdate,
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: Session = Depends(get_db)
):
    """Update an existing item."""
    db_item = ItemService.update_item(db, item_id, item_update)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return db_item

@router.delete("/{item_id}")
def delete_item(
    item_id: UUID,
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an item."""
    success = ItemService.delete_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}