"""borrar un usuario borra todo lo suyo (ON DELETE CASCADE en las 4 FKs que faltaban)

auth.users -> perfiles -> (resto de tablas) ya borraba en cascada, salvo
resenas, proyectos_portafolio y solicitudes: esas bloqueaban el borrado de un
usuario desde el panel de Supabase ("Database error deleting user").

Revision ID: 0006
Revises: 0005
Create Date: 2026-10-20

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# (tabla, nombre de la FK, columna)
FOREIGN_KEYS = [
    ("resenas", "resenas_freelancer_id_fkey", "freelancer_id"),
    ("proyectos_portafolio", "proyectos_portafolio_freelancer_id_fkey", "freelancer_id"),
    ("solicitudes", "solicitudes_cliente_id_fkey", "cliente_id"),
    ("solicitudes", "solicitudes_freelancer_id_fkey", "freelancer_id"),
]


def _recreate(ondelete: str | None) -> None:
    for table, name, column in FOREIGN_KEYS:
        op.drop_constraint(name, table, type_="foreignkey")
        op.create_foreign_key(name, table, "perfiles", [column], ["id"], ondelete=ondelete)


def upgrade() -> None:
    _recreate("CASCADE")


def downgrade() -> None:
    _recreate(None)
