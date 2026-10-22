"""pagos y contratos: al pagar una solicitud aceptada se crea el contrato

- solicitudes.estado admite 'contratada'.
- pagos: cada intento de cobro (aprobado o rechazado); solo puede haber uno
  aprobado por solicitud.
- contratos: la suscripción activa que nace de un pago aprobado.
- Todo se borra en cascada con el usuario o la solicitud; RLS activo sin
  políticas (solo accede el backend).

Revision ID: 0008
Revises: 0007
Create Date: 2026-10-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("solicitudes_estado_check", "solicitudes", type_="check")
    op.create_check_constraint(
        "solicitudes_estado_check",
        "solicitudes",
        "estado IN ('enviada', 'aceptada', 'rechazada', 'cancelada', 'expirada', 'contratada')",
    )

    op.create_table(
        "pagos",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "solicitud_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("solicitudes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "cliente_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("perfiles.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column(
            "freelancer_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("perfiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("monto", sa.Numeric(), nullable=False),
        sa.Column("moneda", sa.Text(), nullable=False, server_default="USD"),
        sa.Column("metodo", sa.Text(), nullable=False, server_default="simulado"),
        sa.Column("referencia", sa.Text(), nullable=False, unique=True),
        sa.Column("estado", sa.Text(), nullable=False),
        sa.Column("motivo_rechazo", sa.Text(), nullable=True),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("estado IN ('aprobado', 'rechazado')", name="pagos_estado_check"),
    )
    op.create_index("ix_pagos_cliente_id", "pagos", ["cliente_id"])
    op.create_index("ix_pagos_freelancer_id", "pagos", ["freelancer_id"])
    op.create_index("ix_pagos_solicitud_id", "pagos", ["solicitud_id"])
    # Nunca dos cobros aprobados para la misma solicitud, ni con dos clics simultáneos.
    op.create_index(
        "uq_pagos_aprobado_por_solicitud",
        "pagos",
        ["solicitud_id"],
        unique=True,
        postgresql_where=sa.text("estado = 'aprobado'"),
    )
    op.execute("ALTER TABLE pagos ENABLE ROW LEVEL SECURITY")

    op.create_table(
        "contratos",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "solicitud_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("solicitudes.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column(
            "cliente_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("perfiles.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column(
            "freelancer_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("perfiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("plan_nombre", sa.Text(), nullable=False),
        sa.Column("plan_nivel", sa.Text(), nullable=False),
        sa.Column("plan_precio", sa.Numeric(), nullable=False),
        sa.Column("estado", sa.Text(), nullable=False, server_default="activo"),
        sa.Column("inicio", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("proximo_cobro", sa.DateTime(timezone=True), nullable=False),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("estado IN ('activo', 'finalizado', 'cancelado')", name="contratos_estado_check"),
    )
    op.create_index("ix_contratos_cliente_id", "contratos", ["cliente_id"])
    op.create_index("ix_contratos_freelancer_id", "contratos", ["freelancer_id"])
    op.execute("ALTER TABLE contratos ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("contratos")
    op.drop_table("pagos")
    op.execute("UPDATE solicitudes SET estado = 'aceptada' WHERE estado = 'contratada'")
    op.drop_constraint("solicitudes_estado_check", "solicitudes", type_="check")
    op.create_check_constraint(
        "solicitudes_estado_check",
        "solicitudes",
        "estado IN ('enviada', 'aceptada', 'rechazada', 'cancelada', 'expirada')",
    )
