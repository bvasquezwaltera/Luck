import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.pago import CONTRATO_ACTIVO, PAGO_APROBADO, PAGO_RECHAZADO, Contrato, Pago
from app.models.perfil import Perfil
from app.models.solicitud import ESTADO_ACEPTADA, ESTADO_CONTRATADA, ESTADO_ENVIADA, Solicitud
from app.schemas.payment import PaymentCounterpart, PaymentOut, PaymentReceipt
from app.schemas.solicitud import SolicitudPayment
from app.services.payment_provider import get_provider
from app.services.utils import get_initials

CURRENCY = "USD"
BILLING_PERIOD_DAYS = 30


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

    pago = Pago(
        id=uuid.uuid4(),
        solicitud_id=solicitud.id,
        cliente_id=solicitud.cliente_id,
        freelancer_id=solicitud.freelancer_id,
        monto=amount,
        moneda=CURRENCY,
        metodo=provider.name,
        referencia=result.reference,
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


def _to_out(pago: Pago, solicitud: Solicitud, other: Perfil) -> PaymentOut:
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
    )


def list_client_payments(db: Session, cliente: Perfil) -> list[PaymentOut]:
    """Todos los intentos del cliente, aprobados y rechazados."""
    rows = db.execute(
        select(Pago, Solicitud, Perfil)
        .join(Solicitud, Solicitud.id == Pago.solicitud_id)
        .join(Perfil, Perfil.id == Pago.freelancer_id)
        .where(Pago.cliente_id == cliente.id)
        .order_by(Pago.creado_en.desc())
    ).all()
    return [_to_out(pago, solicitud, freelancer) for pago, solicitud, freelancer in rows]


def list_freelancer_payments(db: Session, freelancer: Perfil) -> list[PaymentOut]:
    """El freelancer solo ve los cobros que sí se realizaron."""
    rows = db.execute(
        select(Pago, Solicitud, Perfil)
        .join(Solicitud, Solicitud.id == Pago.solicitud_id)
        .join(Perfil, Perfil.id == Pago.cliente_id)
        .where(Pago.freelancer_id == freelancer.id, Pago.estado == PAGO_APROBADO)
        .order_by(Pago.creado_en.desc())
    ).all()
    return [_to_out(pago, solicitud, cliente) for pago, solicitud, cliente in rows]
