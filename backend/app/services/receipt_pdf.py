from datetime import datetime, timedelta, timezone

from fpdf import FPDF

from app.models.pago import Pago
from app.models.perfil import Perfil
from app.models.solicitud import Solicitud

# Lima no tiene horario de verano: UTC-5 todo el año.
LIMA = timezone(timedelta(hours=-5))
MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def _text(value: str) -> str:
    """Las fuentes básicas del PDF solo admiten Latin-1 (acentos y ñ sí): lo demás se reemplaza por '?'."""
    return value.encode("latin-1", "replace").decode("latin-1")


def _date(value: datetime) -> str:
    local = value.astimezone(LIMA)
    return f"{local.day} {MONTHS[local.month - 1]} {local.year}, {local:%H:%M}"


def _money(value, currency: str) -> str:
    return f"${float(value):,.2f} {currency}"


def build_receipt_pdf(pago: Pago, solicitud: Solicitud, cliente: Perfil, freelancer: Perfil, viewer: Perfil) -> bytes:
    """Comprobante de un pago. El cliente ve lo que pagó; el freelancer, además, la comisión y el neto."""
    is_freelancer = viewer.id == pago.freelancer_id

    rows: list[tuple[str, str]] = [
        ("Referencia", pago.referencia),
        ("Fecha", _date(pago.creado_en)),
        ("Estado", "Aprobado" if pago.estado == "aprobado" else "Rechazado"),
        ("Cliente", cliente.nombre_completo),
        ("Freelancer", freelancer.nombre_completo),
        ("Plan", f"{solicitud.plan_nombre} (mensual)"),
        ("Solicitud", solicitud.titulo),
        ("Metodo de pago", pago.metodo.capitalize()),
        ("Monto pagado", _money(pago.monto, pago.moneda)),
    ]
    if is_freelancer and pago.estado == "aprobado":
        rows += [
            (f"Comision de la plataforma ({float(pago.comision_pct):g}%)", f"- {_money(pago.comision, pago.moneda)}"),
            ("Neto a recibir", _money(pago.neto, pago.moneda)),
        ]

    pdf = FPDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, "Luck", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(0, 8, "Comprobante de pago", new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(220, 220, 220)
    pdf.line(pdf.l_margin, pdf.get_y() + 2, pdf.w - pdf.r_margin, pdf.get_y() + 2)
    pdf.ln(8)

    pdf.set_text_color(0, 0, 0)
    label_width = 62
    for label, value in rows:
        strong = label in ("Monto pagado", "Neto a recibir")
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(110, 110, 110)
        pdf.cell(label_width, 8, _text(label))
        pdf.set_font("Helvetica", "B" if strong else "", 11 if strong else 10)
        pdf.set_text_color(0, 0, 0)
        pdf.multi_cell(0, 8, _text(value), new_x="LMARGIN", new_y="NEXT")

    pdf.ln(10)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(130, 130, 130)
    pdf.multi_cell(
        0,
        5,
        _text(
            "Documento de demostracion generado por la plataforma. El pago es simulado: "
            "no corresponde a un cobro real ni tiene validez tributaria."
        ),
        new_x="LMARGIN",
        new_y="NEXT",
    )
    return bytes(pdf.output())
