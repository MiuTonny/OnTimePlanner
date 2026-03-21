"""add user model and user_id to plan

Revision ID: 53c4448120de
Revises: 7105b2d8ec39
Create Date: 2026-03-22
"""

from alembic import op
import sqlalchemy as sa


revision = "53c4448120de"
down_revision = "7105b2d8ec39"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    with op.batch_alter_table("plans", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_plans_user_id_users",
            "users",
            ["user_id"],
            ["id"],
        )


def downgrade():
    with op.batch_alter_table("plans", schema=None) as batch_op:
        batch_op.drop_constraint("fk_plans_user_id_users", type_="foreignkey")
        batch_op.drop_column("user_id")

    op.drop_table("users")
