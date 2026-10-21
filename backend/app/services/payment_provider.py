import uuid
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol


@dataclass
class ChargeResult:
    approved: bool
    reference: str
    reason: str | None = None


class PaymentProvider(Protocol):
    """Único punto por donde se cobra. Para usar una pasarela real (Culqi, Mercado Pago...)
    se escribe otro proveedor con este mismo método y se cambia get_provider()."""

    name: str

    def charge(self, amount: Decimal, currency: str, description: str, simulate_decline: bool) -> ChargeResult: ...


class SimulatedProvider:
    """Pago de demostración: no mueve dinero ni recibe datos de tarjeta."""

    name = "simulado"

    def charge(self, amount: Decimal, currency: str, description: str, simulate_decline: bool) -> ChargeResult:
        reference = f"SIM-{uuid.uuid4().hex[:8].upper()}"
        if simulate_decline:
            return ChargeResult(False, reference, "Pago rechazado (simulación de demostración).")
        return ChargeResult(True, reference)


def get_provider() -> PaymentProvider:
    return SimulatedProvider()
