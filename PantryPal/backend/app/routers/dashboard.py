from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User
from app.models.item import Item
from app.models.count import Count, CountItem, CountStatus

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Get role-based dashboard statistics."""
    
    if current_user.role in ["admin", "manager"]:
        # Admin/Manager stats
        one_week_ago = datetime.utcnow() - timedelta(days=7)
        
        # Get total items and low stock count
        items_query = select(
            func.count(Item.id).label("total_items"),
            func.count(Item.id).filter(Item.current_quantity < Item.par_level).label("low_stock_count")
        )
        items_result = await db.execute(items_query)
        items_stats = items_result.mappings().first()
        
        # Get pending approvals count
        pending_query = select(func.count(Count.id)).where(Count.status == CountStatus.SUBMITTED)
        pending_result = await db.execute(pending_query)
        pending_count = pending_result.scalar()
        
        # Get recent counts
        recent_counts_query = select(Count).where(
            Count.created_at >= one_week_ago
        ).order_by(Count.created_at.desc())
        recent_counts_result = await db.execute(recent_counts_query)
        recent_counts = recent_counts_result.scalars().all()
        
        # Get top discrepancies
        discrepancy_query = select(CountItem).join(Count).where(
            (Count.status == CountStatus.APPROVED) &
            (Count.created_at >= one_week_ago)
        ).order_by(func.abs(CountItem.discrepancy).desc()).limit(5)
        discrepancy_result = await db.execute(discrepancy_query)
        top_discrepancies = discrepancy_result.scalars().all()
        
        return {
            "total_items": items_stats["total_items"],
            "low_stock_count": items_stats["low_stock_count"],
            "pending_approvals": pending_count,
            "recent_counts": [
                {
                    "id": str(count.id),
                    "date": count.count_date,
                    "status": count.status,
                    "items_count": len(count.count_items)
                }
                for count in recent_counts
            ],
            "top_discrepancies": [
                {
                    "item_name": item.item.name,
                    "expected": item.expected_quantity,
                    "actual": item.actual_quantity,
                    "discrepancy": item.discrepancy,
                    "date": item.count.count_date
                }
                for item in top_discrepancies
            ]
        }
    else:
        # Staff stats
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        # Get active counts
        active_counts_query = select(Count).where(
            (Count.created_by == current_user.id) &
            (Count.status == CountStatus.DRAFT)
        )
        active_counts_result = await db.execute(active_counts_query)
        active_counts = active_counts_result.scalars().all()
        
        # Get recent counts
        recent_counts_query = select(Count).where(
            (Count.created_by == current_user.id) &
            (Count.created_at >= thirty_days_ago)
        ).order_by(Count.created_at.desc())
        recent_counts_result = await db.execute(recent_counts_query)
        recent_counts = recent_counts_result.scalars().all()
        
        return {
            "active_counts": [
                {
                    "id": str(count.id),
                    "date": count.count_date,
                    "items_count": len(count.count_items)
                }
                for count in active_counts
            ],
            "recent_counts": [
                {
                    "id": str(count.id),
                    "date": count.count_date,
                    "status": count.status,
                    "items_count": len(count.count_items)
                }
                for count in recent_counts
            ]
        }