"""pagos: comisión de la plataforma (5 %) y neto para el freelancer, guardados en cada cobro

Se guarda el porcentaje aplicado en ese momento, así un cambio futuro de tarifa
no altera los pagos ya hechos.

Revision ID: 0009
Revises: 0008
Create Date: 2026-10-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("pagos", sa.Column("comision_pct", sa.Numeric(), nullable=False, server_default="5"))
    op.add_column("pagos", sa.Column("comision", sa.Numeric(), nullable=False, server_default="0"))
    op.add_column("pagos", sa.Column("neto", sa.Numeric(), nullable=False, server_default="0"))
    # Pagos aprobados que ya existieran: se les aplica el 5 % con redondeo a centavos.
    op.execute(
        """
        UPDATE pagos
        SET comision = round(monto * 0.05, 2),
            neto = monto - round(monto * 0.05, 2)
        WHERE estado = 'aprobado'
        """
    )


def downgrade() -> None:
    op.drop_column("pagos", "neto")
    op.drop_column("pagos", "comision")
    op.drop_column("pagos", "comision_pct")
