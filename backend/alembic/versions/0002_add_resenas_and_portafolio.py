"""crea resenas y proyectos_portafolio (no existían en Supabase)

Revision ID: 0002
Revises: 0001
Create Date: 2026-08-20

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "resenas",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("freelancer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("perfiles.id"), nullable=False),
        sa.Column("nombre_autor", sa.Text(), nullable=False),
        sa.Column("iniciales_autor", sa.Text(), nullable=False),
        sa.Column("pais", sa.Text(), nullable=True),
        sa.Column("pais_codigo", sa.Text(), nullable=True),
        sa.Column("calificacion", sa.Numeric(), nullable=False),
        sa.Column("titulo", sa.Text(), nullable=False),
        sa.Column("comentario", sa.Text(), nullable=False),
        sa.Column("etiquetas", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("servicio", sa.Text(), nullable=False),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    op.create_table(
        "proyectos_portafolio",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("freelancer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("perfiles.id"), nullable=False),
        sa.Column("nombre", sa.Text(), nullable=False),
        sa.Column("categoria", sa.Text(), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=False),
        sa.Column("tech_stack", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("mes", sa.SmallInteger(), nullable=True),
        sa.Column("anio", sa.SmallInteger(), nullable=True),
        sa.Column("duracion", sa.Text(), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("banner_class", sa.Text(), nullable=False),
        sa.Column("imagen_url", sa.Text(), nullable=True),
        sa.Column("posicion", sa.SmallInteger(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_table("proyectos_portafolio")
    op.drop_table("resenas")
