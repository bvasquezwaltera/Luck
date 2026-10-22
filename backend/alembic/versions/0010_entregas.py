"""entregas: el freelancer planifica y sube avances; el cliente aprueba o pide cambios

- entregas: los módulos del proyecto de un contrato activo.
- entrega_avances: lo que sube el freelancer (nota + archivos/enlaces).
- entrega_revisiones: la respuesta del cliente (aprobado / cambios).
- entrega_adjuntos: archivos (en Storage) o enlaces de un avance o de una revisión.
Todo se borra en cascada con el contrato, y RLS queda activo sin políticas (solo accede el backend).

Revision ID: 0010
Revises: 0009
Create Date: 2026-10-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0010"
down_revision: Union[str, None] = "0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

UUID = postgresql.UUID(as_uuid=True)


def _fk(target: str):
    return sa.ForeignKey(target, ondelete="CASCADE")


def upgrade() -> None:
    op.create_table(
        "entregas",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("contrato_id", UUID, _fk("contratos.id"), nullable=False),
        sa.Column("titulo", sa.Text(), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=False),
        sa.Column("objetivos", postgresql.ARRAY(sa.Text()), nullable=False, server_default="{}"),
        sa.Column("fecha_limite", sa.Date(), nullable=False),
        sa.Column("estado", sa.Text(), nullable=False, server_default="pendiente"),
        sa.Column("progreso", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("actualizado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(
            "estado IN ('pendiente', 'en_revision', 'cambios_solicitados', 'aprobada')", name="entregas_estado_check"
        ),
        sa.CheckConstraint("progreso BETWEEN 0 AND 100", name="entregas_progreso_check"),
    )
    op.create_index("ix_entregas_contrato_id", "entregas", ["contrato_id"])

    op.create_table(
        "entrega_avances",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("entrega_id", UUID, _fk("entregas.id"), nullable=False),
        sa.Column("nota", sa.Text(), nullable=False),
        sa.Column("progreso", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("progreso BETWEEN 0 AND 100", name="entrega_avances_progreso_check"),
    )
    op.create_index("ix_entrega_avances_entrega_id", "entrega_avances", ["entrega_id"])

    op.create_table(
        "entrega_revisiones",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("entrega_id", UUID, _fk("entregas.id"), nullable=False),
        sa.Column("tipo", sa.Text(), nullable=False),
        sa.Column("comentario", sa.Text(), nullable=False, server_default=""),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("tipo IN ('aprobado', 'cambios')", name="entrega_revisiones_tipo_check"),
    )
    op.create_index("ix_entrega_revisiones_entrega_id", "entrega_revisiones", ["entrega_id"])

    op.create_table(
        "entrega_adjuntos",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("entrega_id", UUID, _fk("entregas.id"), nullable=False),
        sa.Column("avance_id", UUID, _fk("entrega_avances.id"), nullable=True),
        sa.Column("revision_id", UUID, _fk("entrega_revisiones.id"), nullable=True),
        sa.Column("nombre", sa.Text(), nullable=False),
        sa.Column("tipo", sa.Text(), nullable=False),
        sa.Column("tamano", sa.Integer(), nullable=True),
        sa.Column("ruta", sa.Text(), nullable=True),
        sa.Column("url", sa.Text(), nullable=True),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("(avance_id IS NOT NULL) <> (revision_id IS NOT NULL)", name="entrega_adjuntos_un_origen_check"),
        sa.CheckConstraint("(ruta IS NOT NULL) <> (url IS NOT NULL)", name="entrega_adjuntos_archivo_o_enlace_check"),
    )
    op.create_index("ix_entrega_adjuntos_entrega_id", "entrega_adjuntos", ["entrega_id"])

    for table in ("entregas", "entrega_avances", "entrega_revisiones", "entrega_adjuntos"):
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("entrega_adjuntos")
    op.drop_table("entrega_revisiones")
    op.drop_table("entrega_avances")
    op.drop_table("entregas")
