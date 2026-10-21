"""solicitudes: características, copia de proyectos activos y revisiones del plan, y adjuntos

Revision ID: 0007
Revises: 0006
Create Date: 2026-10-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "solicitudes",
        sa.Column("caracteristicas", postgresql.ARRAY(sa.Text()), nullable=False, server_default="{}"),
    )
    op.add_column("solicitudes", sa.Column("plan_proyectos_activos", sa.Text(), nullable=False, server_default=""))
    op.add_column("solicitudes", sa.Column("plan_revisiones", sa.Text(), nullable=False, server_default=""))

    op.create_table(
        "solicitud_adjuntos",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "solicitud_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("solicitudes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("nombre", sa.Text(), nullable=False),
        sa.Column("tipo", sa.Text(), nullable=False),
        sa.Column("tamano", sa.Integer(), nullable=False),
        sa.Column("ruta", sa.Text(), nullable=False),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_solicitud_adjuntos_solicitud_id", "solicitud_adjuntos", ["solicitud_id"])
    op.execute("ALTER TABLE solicitud_adjuntos ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("solicitud_adjuntos")
    op.drop_column("solicitudes", "plan_revisiones")
    op.drop_column("solicitudes", "plan_proyectos_activos")
    op.drop_column("solicitudes", "caracteristicas")
