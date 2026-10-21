"""crea solicitudes (un cliente solicita el plan de un freelancer)

Estados: enviada -> aceptada | rechazada | cancelada | expirada.
RLS activado sin políticas: la tabla solo se toca desde el backend, nunca
directo por la API REST de Supabase.

Revision ID: 0005
Revises: 0004
Create Date: 2026-10-20

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "solicitudes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("cliente_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("perfiles.id"), nullable=False),
        sa.Column("freelancer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("perfiles.id"), nullable=False),
        sa.Column("plan_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan_nombre", sa.Text(), nullable=False),
        sa.Column("plan_nivel", sa.Text(), nullable=False),
        sa.Column("plan_precio", sa.Numeric(), nullable=False),
        sa.Column("titulo", sa.Text(), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=False),
        sa.Column("categoria", sa.Text(), nullable=False),
        sa.Column("fecha_deseada", sa.Date(), nullable=True),
        sa.Column("estado", sa.Text(), nullable=False, server_default="enviada"),
        sa.Column("motivo_rechazo", sa.Text(), nullable=True),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("actualizado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "estado IN ('enviada', 'aceptada', 'rechazada', 'cancelada', 'expirada')",
            name="solicitudes_estado_check",
        ),
        sa.CheckConstraint("cliente_id <> freelancer_id", name="solicitudes_distintas_partes_check"),
    )
    op.create_index("ix_solicitudes_cliente_id", "solicitudes", ["cliente_id"])
    op.create_index("ix_solicitudes_freelancer_id", "solicitudes", ["freelancer_id"])
    # Un cliente no puede tener dos solicitudes pendientes para el mismo plan.
    op.create_index(
        "uq_solicitudes_pendiente_por_plan",
        "solicitudes",
        ["cliente_id", "plan_id"],
        unique=True,
        postgresql_where=sa.text("estado = 'enviada'"),
    )
    op.execute("ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("solicitudes")
