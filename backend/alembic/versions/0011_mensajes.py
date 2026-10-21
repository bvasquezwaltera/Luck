"""mensajes: chat entre el cliente y el freelancer de un contrato

Un chat por contrato (no hace falta tabla de conversaciones). Los mensajes se borran en
cascada con el contrato o con cualquiera de los dos perfiles. RLS activo sin políticas
(solo accede el backend).

Revision ID: 0011
Revises: 0010
Create Date: 2026-10-21

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0011"
down_revision: Union[str, None] = "0010"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

UUID = postgresql.UUID(as_uuid=True)


def upgrade() -> None:
    op.create_table(
        "mensajes",
        sa.Column("id", UUID, primary_key=True),
        sa.Column("contrato_id", UUID, sa.ForeignKey("contratos.id", ondelete="CASCADE"), nullable=False),
        sa.Column("emisor_id", UUID, sa.ForeignKey("perfiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("texto", sa.Text(), nullable=False, server_default=""),
        sa.Column("adjunto_nombre", sa.Text(), nullable=True),
        sa.Column("adjunto_tipo", sa.Text(), nullable=True),
        sa.Column("adjunto_tamano", sa.Integer(), nullable=True),
        sa.Column("adjunto_ruta", sa.Text(), nullable=True),
        sa.Column("creado_en", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("leido_en", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("texto <> '' OR adjunto_ruta IS NOT NULL", name="mensajes_texto_o_adjunto_check"),
    )
    op.create_index("ix_mensajes_contrato_creado", "mensajes", ["contrato_id", "creado_en"])
    op.execute("ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY")


def downgrade() -> None:
    op.drop_table("mensajes")
