"""Seed script to create initial admin user for development.

Usage:
    python scripts/seed_admin.py
"""
import os
from app.config import get_settings
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.utils.security import get_password_hash


def seed_admin():
    settings = get_settings()
    db = SessionLocal()
    try:
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@pantrypal.local')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'adminpassword')

        existing = db.query(User).filter(User.email == admin_email).first()
        if existing:
            print(f"Admin user already exists: {admin_email}")
            return

        # Use the enum value expected by DB (lowercase)
        # Use raw SQL INSERT to ensure DB enum receives lowercase value
        from sqlalchemy import text
        import uuid

        stmt = text(
            "INSERT INTO users (id, email, hashed_password, full_name, role) VALUES (:id, :email, :hashed_password, :full_name, :role)"
        )
        params = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "hashed_password": get_password_hash(admin_password),
            "full_name": "Admin User",
            "role": UserRole.ADMIN.value,
        }
        db.execute(stmt, params)
        db.commit()
        print(f"Created admin user: {admin_email}")
    finally:
        db.close()


if __name__ == '__main__':
    seed_admin()