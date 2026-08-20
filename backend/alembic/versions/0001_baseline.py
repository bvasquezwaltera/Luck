"""baseline: esquema existente en Supabase (perfiles, planes, experiencia, etc.)

Esta migración es intencionalmente un no-op. Las 12 tablas que describe ya
existen en la base de datos de Supabase (fueron creadas fuera de Alembic).
Se documenta aquí para que el historial de Alembic represente el esquema
completo, pero no ejecuta CREATE TABLE — eso rompería contra tablas que ya
existen. Es seguro correr `alembic upgrade head` con esta revisión.

Tablas ya existentes: perfiles, perfiles_freelancer, diferenciadores_freelancer,
habilidades_freelancer, herramientas_freelancer, idiomas_freelancer,
categorias_metodos_trabajo, items_metodos_trabajo, experiencia, educacion,
planes_suscripcion, caracteristicas_plan.

Revision ID: 0001
Revises:
Create Date: 2026-08-20

"""
from typing import Sequence, Union

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
