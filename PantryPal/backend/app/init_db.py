from datetime import datetime
from uuid import uuid4
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.utils.security import get_password_hash

async def init_db(db: AsyncSession) -> None:
    """Initialize the database with default admin user if it doesn't exist."""
    
    # Check if admin user exists
    query = select(User).where(User.role == UserRole.ADMIN)
    result = await db.execute(query)
    admin = result.scalar_one_or_none()
    
    if not admin:
        # Create default admin user
        admin = User(
            id=uuid4(),
            email="admin@pantrypal.com",
            hashed_password=get_password_hash("Admin123!"),  # Change this in production
            full_name="System Administrator",
            role=UserRole.ADMIN,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.add(admin)
        await db.commit()