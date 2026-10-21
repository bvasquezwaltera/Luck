import uuid
from datetime import datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.pago import CONTRATO_ACTIVO, PAGO_APROBADO, PAGO_RECHAZADO, Contrato, Pago
from app.models.perfil import Perfil
from app.models.solicitud import ESTADO_ACEPTADA, ESTADO_CONTRATADA, ESTADO_ENVIADA, Solicitud
from app.schemas.payment import (
    ClientPaymentSummary,
    FreelancerPaymentSummary,
    PaymentCounterpart,
    PaymentOut,
    PaymentReceipt,
)
from app.schemas.solicitud import SolicitudPayment
from app.services.payment_provider import get_provider
from app.services.utils import get_initials

CURRENCY = "USD"
BILLING_PERIOD_DAYS = 30
# Comisión de la plataforma sobre cada cobro. Se guarda en cada pago, así que cambiarla aquí
# no modifica los pagos ya realizados.
COMMISSION_PERCENT = Decimal("5")
CENT = Decimal("0.01")


def split_commission(amount: Decimal, percent: Decimal = COMMISSION_PERCENT) -> tuple[Decimal, Decimal]:
    """(comisión, neto para el freelancer). La comisión se redondea a centavos y el neto es lo que queda."""
    commission = (amount * percent / 100).quantize(CENT, rounding=ROUND_HALF_UP)
    return commission, amount - commission


def pay_solicitud(db: Session, cliente: Perfil, solicitud_id: str, simulate_decline: bool) -> PaymentReceipt:
    try:
        solicitud_uuid = uuid.UUID(solicitud_id)
    except ValueError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Solicitud inválida.")

    # FOR UPDATE: si llegan dos pagos a la vez para la misma solicitud, el segundo espera al primero
    # y al revisar el estado ya la ve contratada. Solo el cliente dueño puede pagarla.
    solicitud = db.scalar(
        select(Solicitud)
        .where(Solicitud.id == solicitud_uuid, Solicitud.cliente_id == cliente.id)
        .with_for_update()
    )
    if not solicitud:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró la solicitud.")

    if solicitud.estado == ESTADO_CONTRATADA:
        raise HTTPException(status.HTTP_409_CONFLICT, "Esta solicitud ya fue pagada.")
    if solicitud.estado == ESTADO_ENVIADA:
        raise HTTPException(status.HTTP_409_CONFLICT, "El freelancer aún no ha aceptado tu solicitud.")
    if solicitud.estado != ESTADO_ACEPTADA:
        raise HTTPException(status.HTTP_409_CONFLICT, "Esta solicitud no se puede pagar.")

    # El monto sale de la copia del plan guardada en la solicitud, nunca de lo que envíe el navegador.
    amount = Decimal(solicitud.plan_precio)
    provider = get_provider()
    result = provider.charge(amount, CURRENCY, f"Plan {solicitud.plan_nombre}: {solicitud.titulo}", simulate_decline)
    now = datetime.now(timezone.utc)

    commission, net = split_commission(amount) if result.approved else (Decimal(0), Decimal(0))
    pago = Pago(
        id=uuid.uuid4(),
        solicitud_id=solicitud.id,
        cliente_id=solicitud.cliente_id,
        freelancer_id=solicitud.freelancer_id,
        monto=amount,
        moneda=CURRENCY,
        metodo=provider.name,
        referencia=result.reference,
        comision_pct=COMMISSION_PERCENT if result.approved else Decimal(0),
        comision=commission,
        neto=net,
        estado=PAGO_APROBADO if result.approved else PAGO_RECHAZADO,
        motivo_rechazo=None if result.approved else result.reason,
    )
    db.add(pago)

    if not result.approved:
        db.commit()  # el intento rechazado queda en el historial; la solicitud sigue aceptada
        raise HTTPException(status.HTTP_402_PAYMENT_REQUIRED, result.reason or "El pago fue rechazado.")

    contrato = Contrato(
        id=uuid.uuid4(),
        solicitud_id=solicitud.id,
        cliente_id=solicitud.cliente_id,
        freelancer_id=solicitud.freelancer_id,
        plan_nombre=solicitud.plan_nombre,
        plan_nivel=solicitud.plan_nivel,
        plan_precio=solicitud.plan_precio,
        estado=CONTRATO_ACTIVO,
        inicio=now,
        proximo_cobro=now + timedelta(days=BILLING_PERIOD_DAYS),
    )
    db.add(contrato)
    solicitud.estado = ESTADO_CONTRATADA
    db.commit()

    return PaymentReceipt(
        id=str(pago.id),
        solicitudId=str(solicitud.id),
        reference=pago.referencia,
        amount=float(amount),
        currency=CURRENCY,
        method=provider.name,
        status=PAGO_APROBADO,
        paidAt=now,
        contractStartedAt=now,
        nextChargeAt=contrato.proximo_cobro,
    )


def payments_by_solicitud(db: Session, solicitud_ids: list[uuid.UUID]) -> dict[uuid.UUID, SolicitudPayment]:
    """Pago aprobado y fecha del próximo cobro de cada solicitud ya contratada."""
    if not solicitud_ids:
        return {}

    rows = db.execute(
        select(Pago, Contrato)
        .join(Contrato, Contrato.solicitud_id == Pago.solicitud_id)
        .where(Pago.solicitud_id.in_(solicitud_ids), Pago.estado == PAGO_APROBADO)
    ).all()
    return {
        pago.solicitud_id: SolicitudPayment(
            reference=pago.referencia,
            amount=float(pago.monto),
            paidAt=pago.creado_en,
            nextChargeAt=contrato.proximo_cobro,
        )
        for pago, contrato in rows
    }


def _to_out(pago: Pago, solicitud: Solicitud, other: Perfil, for_freelancer: bool) -> PaymentOut:
    return PaymentOut(
        id=str(pago.id),
        solicitudId=str(solicitud.id),
        solicitudTitle=solicitud.titulo,
        planName=solicitud.plan_nombre,
        reference=pago.referencia,
        amount=float(pago.monto),
        currency=pago.moneda,
        method=pago.metodo,
        status=pago.estado,
        rejectionReason=pago.motivo_rechazo,
        createdAt=pago.creado_en,
        counterpart=PaymentCounterpart(
            id=str(other.id), name=other.nombre_completo, initials=get_initials(other.nombre_completo)
        ),
        commissionRate=float(pago.comision_pct) if for_freelancer else None,
        commission=float(pago.comision) if for_freelancer else None,
        net=float(pago.neto) if for_freelancer else None,
    )


def list_client_payments(db: Session, cliente: Perfil) -> list[PaymentOut]:
    """Todos los intentos del cliente, aprobados y rechazados. No incluye la comisión: no es asunto suyo."""
    rows = db.execute(
        select(Pago, Solicitud, Perfil)
        .join(Solicitud, Solicitud.id == Pago.solicitud_id)
        .join(Perfil, Perfil.id == Pago.freelancer_id)
        .where(Pago.cliente_id == cliente.id)
        .order_by(Pago.creado_en.desc())
    ).all()
    return [_to_out(pago, solicitud, freelancer, False) for pago, solicitud, freelancer in rows]


def list_freelancer_payments(db: Session, freelancer: Perfil) -> list[PaymentOut]:
    """El freelancer solo ve los cobros que sí se realizaron, con la comisión y el neto."""
    rows = db.execute(
        select(Pago, Solicitud, Perfil)
        .join(Solicitud, Solicitud.id == Pago.solicitud_id)
        .join(Perfil, Perfil.id == Pago.cliente_id)
        .where(Pago.freelancer_id == freelancer.id, Pago.estado == PAGO_APROBADO)
        .order_by(Pago.creado_en.desc())
    ).all()
    return [_to_out(pago, solicitud, cliente, True) for pago, solicitud, cliente in rows]


def client_summary(db: Session, cliente: Perfil) -> ClientPaymentSummary:
    contracts = db.scalars(
        select(Contrato).where(Contrato.cliente_id == cliente.id, Contrato.estado == CONTRATO_ACTIVO)
    ).all()
    return ClientPaymentSummary(
        activeContracts=len(contracts),
        monthlySpend=float(sum((Decimal(c.plan_precio) for c in contracts), Decimal(0))),
        nextChargeAt=min((c.proximo_cobro for c in contracts), default=None),
    )


def freelancer_summary(db: Session, freelancer: Perfil) -> FreelancerPaymentSummary:
    gross, commission, net = db.execute(
        select(
            func.coalesce(func.sum(Pago.monto), 0),
            func.coalesce(func.sum(Pago.comision), 0),
            func.coalesce(func.sum(Pago.neto), 0),
        ).where(Pago.freelancer_id == freelancer.id, Pago.estado == PAGO_APROBADO)
    ).one()
    contracts = db.scalars(
        select(Contrato).where(Contrato.freelancer_id == freelancer.id, Contrato.estado == CONTRATO_ACTIVO)
    ).all()
    # Ingreso mensual neto: lo que quedaría de cada contrato activo después de la comisión.
    monthly_net = sum((split_commission(Decimal(c.plan_precio))[1] for c in contracts), Decimal(0))
    return FreelancerPaymentSummary(
        commissionRate=float(COMMISSION_PERCENT),
        totalGross=float(gross),
        totalCommission=float(commission),
        totalNet=float(net),
        activeContracts=len(contracts),
        monthlyNet=float(monthly_net),
        nextChargeAt=min((c.proximo_cobro for c in contracts), default=None),
    )


def get_payment_for_receipt(db: Session, profile: Perfil, payment_id: str) -> tuple[Pago, Solicitud, Perfil, Perfil]:
    """(pago, solicitud, cliente, freelancer) si el perfil es una de las dos partes; si no, 404."""
    try:
        payment_uuid = uuid.UUID(payment_id)
    except ValueError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró el comprobante.")

    pago = db.get(Pago, payment_uuid)
    # Para cualquiera que no sea cliente ni freelancer del pago, el comprobante "no existe".
    if not pago or profile.id not in (pago.cliente_id, pago.freelancer_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No se encontró el comprobante.")

    return pago, db.get(Solicitud, pago.solicitud_id), db.get(Perfil, pago.cliente_id), db.get(Perfil, pago.freelancer_id)
