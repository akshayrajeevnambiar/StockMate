from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import date, datetime, timedelta

from app.dependencies import (
    get_current_active_user,
    get_current_manager_or_admin_user
)
from app.database import get_db
from app.models.count import Count, CountItem, CountStatus
from app.models.item import Item
from app.models.user import User
from app.schemas.count import (
    CountCreate,
    CountRead,
    CountUpdate,
    CountItemCreate,
    CountItemUpdate,
    CountSubmit,
    CountReview
)

router = APIRouter()

@router.get("/", response_model=List[CountRead])
async def list_counts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """List all counts based on user's role."""
    query = select(Count)
    
    if current_user.role == "staff":
        # Staff can only see their own counts
        query = query.where(Count.created_by == current_user.id)
    
    query = query.order_by(Count.count_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=CountRead)
async def create_count(
    count: CountCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new count."""
    # Check if user already has an active count for this date
    existing_count = await Count.get_user_active_count(db, current_user.id, count.count_date)
    if existing_count:
        raise HTTPException(
            status_code=400,
            detail="You already have an active count for this date"
        )

    db_count = Count(
        **count.model_dump(),
        created_by=current_user.id
    )
    db.add(db_count)
    await db.commit()
    await db.refresh(db_count)
    return db_count

@router.get("/{count_id}", response_model=CountRead)
async def get_count(
    count_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific count by ID."""
    count = await Count.get_by_id(db, count_id)
    if not count:
        raise HTTPException(status_code=404, detail="Count not found")
    
    if current_user.role == "staff" and count.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this count")
    
    return count

@router.post("/{count_id}/submit", response_model=CountRead)
async def submit_count(
    count_id: UUID,
    submission: CountSubmit,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit a count for review."""
    count = await Count.get_by_id(db, count_id)
    if not count:
        raise HTTPException(status_code=404, detail="Count not found")
    
    if count.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to submit this count")
    
    if count.status != CountStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Count is not in draft status")
    
    # Check if there are any items in the count
    if not count.count_items:
        raise HTTPException(status_code=400, detail="Cannot submit empty count")
    
    count.status = CountStatus.SUBMITTED
    count.submitted_at = datetime.utcnow()
    if submission.notes:
        count.notes = submission.notes
    
    await db.commit()
    await db.refresh(count)
    return count

@router.post("/{count_id}/review", response_model=CountRead)
async def review_count(
    count_id: UUID,
    review: CountReview,
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Approve or reject a count."""
    count = await Count.get_by_id(db, count_id)
    if not count:
        raise HTTPException(status_code=404, detail="Count not found")
    
    if count.status != CountStatus.SUBMITTED:
        raise HTTPException(status_code=400, detail="Count is not submitted")
    
    count.reviewed_by = current_user.id
    count.reviewed_at = datetime.utcnow()
    
    if review.approved:
        count.status = CountStatus.APPROVED
        # Update inventory quantities
        for count_item in count.count_items:
            count_item.item.current_quantity = count_item.actual_quantity
    else:
        if not review.rejection_reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")
        count.status = CountStatus.REJECTED
        count.rejection_reason = review.rejection_reason
    
    if review.notes:
        count.notes = review.notes
    
    await db.commit()
    await db.refresh(count)
    return count

@router.post("/{count_id}/items", response_model=CountRead)
async def add_count_item(
    count_id: UUID,
    item: CountItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Add an item to a count."""
    count = await Count.get_by_id(db, count_id)
    if not count:
        raise HTTPException(status_code=404, detail="Count not found")
    
    if count.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this count")
    
    if count.status != CountStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only modify draft counts")
    
    # Get the item and its current quantity
    db_item = await Item.get_by_id(db, item.item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Create count item
    count_item = CountItem(
        count_id=count.id,
        item_id=db_item.id,
        expected_quantity=db_item.current_quantity,
        actual_quantity=item.actual_quantity,
        discrepancy=item.actual_quantity - db_item.current_quantity,
        notes=item.notes
    )
    
    db.add(count_item)
    await db.commit()
    await db.refresh(count)
    return count

@router.put("/{count_id}/items/{item_id}", response_model=CountRead)
async def update_count_item(
    count_id: UUID,
    item_id: UUID,
    item_update: CountItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a count item."""
    count = await Count.get_by_id(db, count_id)
    if not count:
        raise HTTPException(status_code=404, detail="Count not found")
    
    if count.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this count")
    
    if count.status != CountStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only modify draft counts")
    
    # Find the count item
    count_item = next((ci for ci in count.count_items if ci.item_id == item_id), None)
    if not count_item:
        raise HTTPException(status_code=404, detail="Item not found in count")
    
    # Update count item
    if item_update.actual_quantity is not None:
        count_item.actual_quantity = item_update.actual_quantity
        count_item.discrepancy = item_update.actual_quantity - count_item.expected_quantity
    
    if item_update.notes is not None:
        count_item.notes = item_update.notes
    
    await db.commit()
    await db.refresh(count)
    return count

@router.delete("/{count_id}/items/{item_id}", response_model=CountRead)
async def delete_count_item(
    count_id: UUID,
    item_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove an item from a count."""
    count = await Count.get_by_id(db, count_id)
    if not count:
        raise HTTPException(status_code=404, detail="Count not found")
    
    if count.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this count")
    
    if count.status != CountStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Can only modify draft counts")
    
    # Find and remove the count item
    count_item = next((ci for ci in count.count_items if ci.item_id == item_id), None)
    if not count_item:
        raise HTTPException(status_code=404, detail="Item not found in count")
    
    await db.delete(count_item)
    await db.commit()
    await db.refresh(count)
    return count