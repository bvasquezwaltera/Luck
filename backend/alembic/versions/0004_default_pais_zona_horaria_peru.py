"""rellena pais y zona horaria (Perú / Lima) en perfiles que los tenían vacíos

Solo toca filas con valores NULL; no pisa lo que el usuario ya eligió.

Revision ID: 0004
Revises: 0003
Create Date: 2026-10-20

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE perfiles SET pais_codigo = 'PE' WHERE pais_codigo IS NULL")
    op.execute("UPDATE perfiles SET pais = 'Perú' WHERE pais IS NULL")
    op.execute("UPDATE perfiles SET zona_horaria = 'GMT-5 (Lima)' WHERE zona_horaria IS NULL")


def downgrade() -> None:
    # No se puede distinguir qué filas eran NULL antes; no se revierte.
    pass
