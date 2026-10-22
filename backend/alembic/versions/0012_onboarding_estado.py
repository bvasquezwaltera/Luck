"""perfiles.onboarding: en qué punto de la guía de bienvenida va cada persona

pendiente -> bienvenida_vista -> completado. Las cuentas que ya existían quedan como "completado" (no tienen por qué
ver la guía de quien recién se registra); las nuevas empiezan en "pendiente".

Revision ID: 0012
Revises: 0011
Create Date: 2026-10-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0012"
down_revision: Union[str, None] = "0011"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Con este valor por defecto las filas que ya existen quedan "completado"; después el valor por defecto pasa a
    # "pendiente" para las cuentas nuevas.
    op.add_column("perfiles", sa.Column("onboarding", sa.Text(), nullable=False, server_default="completado"))
    op.alter_column("perfiles", "onboarding", server_default="pendiente")
    op.create_check_constraint(
        "perfiles_onboarding_check", "perfiles", "onboarding IN ('pendiente', 'bienvenida_vista', 'completado')"
    )


def downgrade() -> None:
    op.drop_constraint("perfiles_onboarding_check", "perfiles", type_="check")
    op.drop_column("perfiles", "onboarding")
