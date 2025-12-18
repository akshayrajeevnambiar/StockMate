from typing import List, Optional
from uuid import UUID
from datetime import date
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.count import Count, CountItem, CountStatus
from app.models.item import Item
from app.schemas.count import CountCreate, CountItemCreate, CountItemUpdate


class CountService:
    """Service class for count-related business logic."""
    
    @staticmethod
    def get_counts(
        db: Session,
        user_id: UUID,
        user_role: str,
        skip: int = 0,
        limit: int = 10
    ) -> list:
        """Get list of counts based on user role, including creator's full_name."""
        from app.models.user import User
        query = select(Count, User.full_name).join(User, Count.created_by == User.id)
        if user_role == "staff":
            # Staff can only see their own counts
            query = query.where(Count.created_by == user_id)
        query = query.order_by(Count.count_date.desc()).offset(skip).limit(limit)
        result = db.execute(query)
        counts = []
        for count, full_name in result.all():
            count_dict = count.__dict__.copy()
            count_dict["created_by_name"] = full_name
            # Add count_items as a list of dicts for Pydantic
            count_dict["count_items"] = [item.__dict__ for item in getattr(count, "count_items", [])]
            counts.append(count_dict)
        return counts
    
    @staticmethod
    def get_count_by_id(db: Session, count_id: UUID) -> Optional[Count]:
        """Get a specific count by ID."""
        return Count.get_by_id_sync(db, count_id)
    
    @staticmethod
    def create_count(
        db: Session,
        count_data: CountCreate,
        user_id: UUID
    ) -> Count:
        """Create a new count."""
        db_count = Count(
            **count_data.model_dump(),
            created_by=user_id
        )
        db.add(db_count)
        db.commit()
        db.refresh(db_count)
        return db_count
    
    @staticmethod
    def check_active_count_exists(
        db: Session,
        user_id: UUID,
        count_date: date
    ) -> bool:
        """Check if user has an active count for the given date."""
        existing_count = Count.get_user_active_count_sync(db, user_id, count_date)
        return existing_count is not None
    
    @staticmethod
    def add_items_to_count(
        db: Session,
        count_id: UUID,
        items_data: List[CountItemCreate]
    ) -> List[CountItem]:
        """Add items to a count."""
        count_items = []
        for item_data in items_data:
            # Get the item to get expected quantity
            item = Item.get_by_id(db, item_data.item_id)
            if not item:
                continue
            
            count_item = CountItem(
                count_id=count_id,
                item_id=item_data.item_id,
                expected_quantity=item.current_quantity,
                actual_quantity=item_data.actual_quantity
            )
            db.add(count_item)
            count_items.append(count_item)
        
        db.commit()
        for count_item in count_items:
            db.refresh(count_item)
        
        return count_items
    
    @staticmethod
    def update_count_item(
        db: Session,
        count_item_id: UUID,
        update_data: CountItemUpdate
    ) -> Optional[CountItem]:
        """Update a count item."""
        query = select(CountItem).where(CountItem.id == count_item_id)
        result = db.execute(query)
        count_item = result.scalar_one_or_none()
        
        if not count_item:
            return None
        
        update_values = update_data.model_dump(exclude_unset=True)
        for field, value in update_values.items():
            setattr(count_item, field, value)
        
        db.commit()
        db.refresh(count_item)
        return count_item
    
    @staticmethod
    def delete_count_item(db: Session, count_item_id: UUID) -> bool:
        """Delete a count item."""
        query = select(CountItem).where(CountItem.id == count_item_id)
        result = db.execute(query)
        count_item = result.scalar_one_or_none()
        
        if not count_item:
            return False
        
        db.delete(count_item)
        db.commit()
        return True
    
    @staticmethod
    def submit_count(db: Session, count_id: UUID) -> Optional[Count]:
        """Submit a count for review."""
        count = Count.get_by_id_sync(db, count_id)
        if not count:
            return None
        
        count.submit()
        db.commit()
        db.refresh(count)
        return count
    
    @staticmethod
    def approve_count(
        db: Session,
        count_id: UUID,
        reviewer_id: UUID,
        apply_changes: bool = True
    ) -> Optional[Count]:
        """Approve a count and optionally apply inventory changes."""
        count = Count.get_by_id_sync(db, count_id)
        if not count:
            return None
        
        count.approve(reviewer_id)
        
        # Apply inventory changes if requested
        if apply_changes:
            for count_item in count.count_items:
                item = count_item.item
                item.current_quantity = count_item.actual_quantity
        
        db.commit()
        db.refresh(count)
        return count
    
    @staticmethod
    def reject_count(
        db: Session,
        count_id: UUID,
        reviewer_id: UUID
    ) -> Optional[Count]:
        """Reject a count."""
        count = Count.get_by_id_sync(db, count_id)
        if not count:
            return None
        
        count.reject(reviewer_id)
        db.commit()
        db.refresh(count)
        return count
    
    @staticmethod
    def delete_count(db: Session, count_id: UUID) -> bool:
        """Delete a count (only if in draft status)."""
        count = Count.get_by_id_sync(db, count_id)
        if not count:
            return False
        
        if count.status != CountStatus.DRAFT:
            return False
        
        db.delete(count)
        db.commit()
        return True
    
    @staticmethod
    def get_pending_counts(db: Session) -> List[Count]:
        """Get all counts pending review."""
        query = select(Count).where(Count.status == CountStatus.SUBMITTED)
        query = query.order_by(Count.submitted_at.desc())
        result = db.execute(query)
        return result.scalars().all()
