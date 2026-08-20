"""habilita RLS en resenas y proyectos_portafolio (quedaron sin RLS al crearlas)

Sin esto, cualquiera con la clave pública de Supabase podía leer/escribir estas
dos tablas directo por la API REST de Supabase, saltándose el backend.

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-20

"""
from typing import Sequence, Union

from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE resenas ENABLE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY "Las reseñas son de lectura pública"
        ON resenas FOR SELECT TO public
        USING (true)
        """
    )

    op.execute("ALTER TABLE proyectos_portafolio ENABLE ROW LEVEL SECURITY")
    op.execute(
        """
        CREATE POLICY "Los proyectos de portafolio son de lectura pública"
        ON proyectos_portafolio FOR SELECT TO public
        USING (true)
        """
    )
    op.execute(
        """
        CREATE POLICY "Los freelancers pueden crear sus propios proyectos"
        ON proyectos_portafolio FOR INSERT TO public
        WITH CHECK (auth.uid() = freelancer_id)
        """
    )
    op.execute(
        """
        CREATE POLICY "Los freelancers pueden editar sus propios proyectos"
        ON proyectos_portafolio FOR UPDATE TO public
        USING (auth.uid() = freelancer_id)
        """
    )
    op.execute(
        """
        CREATE POLICY "Los freelancers pueden eliminar sus propios proyectos"
        ON proyectos_portafolio FOR DELETE TO public
        USING (auth.uid() = freelancer_id)
        """
    )


def downgrade() -> None:
    op.execute('DROP POLICY "Las reseñas son de lectura pública" ON resenas')
    op.execute("ALTER TABLE resenas DISABLE ROW LEVEL SECURITY")

    op.execute('DROP POLICY "Los proyectos de portafolio son de lectura pública" ON proyectos_portafolio')
    op.execute('DROP POLICY "Los freelancers pueden crear sus propios proyectos" ON proyectos_portafolio')
    op.execute('DROP POLICY "Los freelancers pueden editar sus propios proyectos" ON proyectos_portafolio')
    op.execute('DROP POLICY "Los freelancers pueden eliminar sus propios proyectos" ON proyectos_portafolio')
    op.execute("ALTER TABLE proyectos_portafolio DISABLE ROW LEVEL SECURITY")
