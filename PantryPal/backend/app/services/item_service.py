from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.item import Item, ItemCategory
from app.schemas.item import ItemCreate, ItemUpdate


class ItemService:
    """Service class for item-related business logic."""
    
    @staticmethod
    def get_items(
        db: Session,
        category: Optional[ItemCategory] = None,
        skip: int = 0,
        limit: int = 10
    ) -> List[Item]:
        """Get list of items with optional filtering."""
        query = select(Item)
        if category:
            query = query.where(Item.category == category)
        
        query = query.offset(skip).limit(limit)
        result = db.execute(query)
        return result.scalars().all()
    
    @staticmethod
    def get_low_stock_items(db: Session) -> List[Item]:
        """Get all items below their par level."""
        return Item.get_low_stock(db)
    
    @staticmethod
    def get_item_by_id(db: Session, item_id: UUID) -> Optional[Item]:
        """Get a specific item by ID."""
        return Item.get_by_id(db, item_id)
    
    @staticmethod
    def create_item(db: Session, item_data: ItemCreate, user_id: UUID) -> Item:
        """Create a new item."""
        db_item = Item(
            **item_data.model_dump(),
            created_by=user_id
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def update_item(
        db: Session,
        item_id: UUID,
        item_data: ItemUpdate
    ) -> Optional[Item]:
        """Update an existing item."""
        db_item = Item.get_by_id(db, item_id)
        if not db_item:
            return None
        
        update_data = item_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def delete_item(db: Session, item_id: UUID) -> bool:
        """Delete an item."""
        db_item = Item.get_by_id(db, item_id)
        if not db_item:
            return False
        
        db.delete(db_item)
        db.commit()
        return True
    
    @staticmethod
    def adjust_item_quantity(
        db: Session,
        item_id: UUID,
        quantity_change: float
    ) -> Optional[Item]:
        """Adjust item quantity by a specified amount (can be positive or negative)."""
        db_item = Item.get_by_id(db, item_id)
        if not db_item:
            return None
        
        db_item.current_quantity += quantity_change
        db.commit()
        db.refresh(db_item)
        return db_item
    
    @staticmethod
    def set_item_quantity(
        db: Session,
        item_id: UUID,
        new_quantity: float
    ) -> Optional[Item]:
        """Set item quantity to a specific value."""
        db_item = Item.get_by_id(db, item_id)
        if not db_item:
            return None
        
        db_item.current_quantity = new_quantity
        db.commit()
        db.refresh(db_item)
        return db_item
