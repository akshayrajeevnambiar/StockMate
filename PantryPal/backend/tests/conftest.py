import os
import pytest

from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from sqlalchemy import select
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.utils.security import get_password_hash


@pytest.fixture(scope="session")
def client():
    # Ensure environment configured for tests; re-use existing DB (developer should have started Postgres)
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def admin_credentials():
    # Use a test-safe email that validates under pydantic EmailStr
    email = "admin@example.com"
    password = getattr(settings, "ADMIN_PASSWORD", "adminpassword")

    # Create or ensure test admin exists in DB
    db = SessionLocal()
    try:
        existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    except Exception:
        # If import of select fails here, fall back to Query by attribute
        existing = db.query(User).filter(User.email == email).one_or_none()

    if not existing:
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name="Test Admin",
            role=UserRole.ADMIN.value,
            is_active=True,
        )
        db.add(user)
        db.commit()
    db.close()

    return {"username": email, "password": password}
