"""Seed script to create initial counter user for development.

Usage:
    python scripts/seed_counter.py
"""
import os
from app.config import get_settings
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.utils.security import get_password_hash


def seed_counter():
    settings = get_settings()
    db = SessionLocal()
    try:
        counter_email = os.environ.get('COUNTER_EMAIL', 'counter@example.com')
        counter_password = os.environ.get('COUNTER_PASSWORD', 'counterpassword')

        existing = db.query(User).filter(User.email == counter_email).first()
        if existing:
            print(f"Counter user already exists: {counter_email}")
            return

        # Use raw SQL INSERT to ensure DB enum receives lowercase value
        from sqlalchemy import text
        import uuid

        stmt = text(
            "INSERT INTO users (id, email, hashed_password, full_name, role) VALUES (:id, :email, :hashed_password, :full_name, :role)"
        )
        params = {
            "id": str(uuid.uuid4()),
            "email": counter_email,
            "hashed_password": get_password_hash(counter_password),
            "full_name": "Counter User",
            "role": UserRole.COUNTER.value,
        }
        db.execute(stmt, params)
        db.commit()
        print(f"Created counter user: {counter_email}")
    finally:
        db.close()


if __name__ == '__main__':
    seed_counter()