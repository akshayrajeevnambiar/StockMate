"""add counter role

Revision ID: 002_add_counter_role
Revises: 001_initial_migration
Create Date: 2025-10-22 11:59:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_add_counter_role'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add 'counter' to the user_role enum
    op.execute("ALTER TYPE user_role ADD VALUE 'counter'")


def downgrade() -> None:
    # Note: PostgreSQL doesn't support removing enum values
    # In a real-world scenario, you might want to:
    # 1. Create a new enum without 'counter'
    # 2. Update all 'counter' users to a different role
    # 3. Alter the column to use the new enum
    # 4. Drop the old enum
    # For now, we'll leave this as a no-op
    pass