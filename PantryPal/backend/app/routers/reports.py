from datetime import datetime, date
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_manager_or_admin_user
from app.database import get_db
from app.models.user import User
from app.models.item import Item
from app.models.count import Count, CountItem, CountStatus

router = APIRouter()

@router.get("/counts")
async def get_count_summary(
    start_date: date,
    end_date: date = None,
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get daily count summary for a date range."""
    if end_date is None:
        end_date = date.today()

    query = select(Count).where(
        (Count.count_date >= start_date) &
        (Count.count_date <= end_date)
    ).order_by(Count.count_date.desc())
    
    result = await db.execute(query)
    counts = result.scalars().all()
    
    return [
        {
            "id": str(count.id),
            "date": count.count_date,
            "staff": count.creator.full_name,
            "status": count.status,
            "total_items": len(count.count_items),
            "submitted_at": count.submitted_at,
            "reviewed_at": count.reviewed_at,
            "reviewer": count.reviewer.full_name if count.reviewer else None
        }
        for count in counts
    ]

@router.get("/discrepancies")
async def get_discrepancy_report(
    start_date: date,
    end_date: date = None,
    min_variance_percentage: float = Query(10.0, gt=0, le=100),
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get items with high variance over a time period."""
    if end_date is None:
        end_date = date.today()

    # Get approved counts with significant discrepancies
    query = select(CountItem).join(Count).join(Item).where(
        (Count.count_date >= start_date) &
        (Count.count_date <= end_date) &
        (Count.status == CountStatus.APPROVED)
    ).order_by(
        Item.name,
        Count.count_date
    )
    
    result = await db.execute(query)
    count_items = result.scalars().all()
    
    # Filter and group by item
    discrepancies = {}
    for count_item in count_items:
        if count_item.has_significant_discrepancy:
            item_name = count_item.item.name
            if item_name not in discrepancies:
                discrepancies[item_name] = []
            
            variance_percentage = abs(count_item.discrepancy) / count_item.expected_quantity * 100
            if variance_percentage >= min_variance_percentage:
                discrepancies[item_name].append({
                    "date": count_item.count.count_date,
                    "expected": count_item.expected_quantity,
                    "actual": count_item.actual_quantity,
                    "discrepancy": count_item.discrepancy,
                    "variance_percentage": round(variance_percentage, 2)
                })
    
    return [
        {
            "item_name": item_name,
            "discrepancies": item_discrepancies
        }
        for item_name, item_discrepancies in discrepancies.items()
        if item_discrepancies  # Only include items that have discrepancies
    ]

@router.get("/low-stock")
async def get_low_stock_report(
    current_user: User = Depends(get_current_manager_or_admin_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get all items that are below their par level."""
    query = select(Item).where(Item.current_quantity < Item.par_level)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return [
        {
            "id": str(item.id),
            "name": item.name,
            "category": item.category,
            "par_level": item.par_level,
            "current_quantity": item.current_quantity,
            "unit_of_measure": item.unit_of_measure,
            "deficit": item.par_level - item.current_quantity
        }
        for item in items
    ]