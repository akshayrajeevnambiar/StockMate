"""Initial migration

Revision ID: 001_initial
Revises: 
Create Date: 2025-10-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    # Create enum types if they do not already exist (idempotent)
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff'); END IF; END$$;")
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'count_status') THEN CREATE TYPE count_status AS ENUM ('draft', 'submitted', 'approved', 'rejected'); END IF; END$$;")
    op.execute("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_category') THEN CREATE TYPE item_category AS ENUM ('Produce', 'Dairy', 'Meat & Seafood', 'Dry Goods', 'Canned Goods', 'Beverages', 'Frozen Foods', 'Other'); END IF; END$$;")

    # Create users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
    sa.Column('role', postgresql.ENUM('admin', 'manager', 'staff', name='user_role', create_type=False), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Create items table
    op.create_table('items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
    sa.Column('category', postgresql.ENUM('Produce', 'Dairy', 'Meat & Seafood', 'Dry Goods',
                    'Canned Goods', 'Beverages', 'Frozen Foods', 'Other',
                    name='item_category', create_type=False), nullable=False),
        sa.Column('unit_of_measure', sa.String(50), nullable=False),
        sa.Column('par_level', sa.Integer(), nullable=False),
        sa.Column('current_quantity', sa.Integer(), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_items_name'), 'items', ['name'], unique=True)

    # Create counts table
    op.create_table('counts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('count_date', sa.Date(), nullable=False),
    sa.Column('status', postgresql.ENUM('draft', 'submitted', 'approved', 'rejected',
                  name='count_status', create_type=False), nullable=False, server_default='draft'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_counts_count_date'), 'counts', ['count_date'], unique=False)
    op.create_index(op.f('ix_counts_status'), 'counts', ['status'], unique=False)

    # Create count_items table
    op.create_table('count_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('count_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('item_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('expected_quantity', sa.Integer(), nullable=False),
        sa.Column('actual_quantity', sa.Integer(), nullable=False),
        sa.Column('discrepancy', sa.Integer(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['count_id'], ['counts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_count_items_count_id'), 'count_items', ['count_id'], unique=False)
    op.create_index(op.f('ix_count_items_item_id'), 'count_items', ['item_id'], unique=False)


def downgrade() -> None:
    # Drop tables
    op.drop_table('count_items')
    op.drop_table('counts')
    op.drop_table('items')
    op.drop_table('users')

    # Drop enum types if they exist
    op.execute("DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'count_status') THEN DROP TYPE count_status; END IF; END$$;")
    op.execute("DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN DROP TYPE user_role; END IF; END$$;")
    op.execute("DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_category') THEN DROP TYPE item_category; END IF; END$$;")