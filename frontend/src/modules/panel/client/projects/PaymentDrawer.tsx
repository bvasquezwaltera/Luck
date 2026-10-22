"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock } from "lucide-react";
import { paySolicitud } from "@/lib/api/client/solicitudes";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import {
  formatCardNumber,
  formatCvc,
  formatExpiry,
  validateCardForm,
  type CardFormErrors,
  type CardFormValues,
} from "@/lib/formatCardInput";
import type { ClientSolicitud } from "@/types/clientSolicitud";
import type { PaymentReceipt } from "@/types/payment";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Input } from "@/ui/Input";

export function PaymentDrawer({
  open,
  solicitud,
  onClose,
}: {
  open: boolean;
  solicitud: ClientSolicitud;
  onClose: () => void;
}) {
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  function handleClose() {
    setReceipt(null);
    onClose();
  }

  return (
    <Drawer open={open} onClose={handleClose} title={receipt ? "Pago aprobado" : "Pagar plan"}>
      {receipt ? (
        <Receipt receipt={receipt} solicitud={solicitud} onClose={handleClose} />
      ) : (
        <PaymentForm solicitud={solicitud} onPaid={setReceipt} />
      )}
    </Drawer>
  );
}

function PaymentForm({
  solicitud,
  onPaid,
}: {
  solicitud: ClientSolicitud;
  onPaid: (receipt: PaymentReceipt) => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState<CardFormValues>({ name: "", number: "", expiry: "", cvc: "" });
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isPaying) return;

    const nextErrors = validateCardForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsPaying(true);
    setPayError("");
    // Solo se envía el id de la solicitud: ni el monto ni la tarjeta salen de la pantalla.
    const result = await paySolicitud(solicitud.id);
    setIsPaying(false);

    if (!result.receipt) {
      setPayError(result.error ?? "No se pudo procesar el pago.");
      return;
    }
    onPaid(result.receipt);
    // La lista de solicitudes se vuelve a pedir al servidor: pasa a "Contratada".
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Avatar initials={solicitud.freelancer.initials} name={solicitud.freelancer.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">{solicitud.freelancer.name}</p>
          <p className="truncate text-xs text-gray-500">{solicitud.title}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-bold text-gray-900">Plan {solicitud.plan.name}</p>
          <p className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">${solicitud.plan.price}</span>
            <span className="text-xs text-gray-500">/mes</span>
          </p>
        </div>
        <p className="mt-2 text-xs text-gray-500">Suscripción mensual. Pagas hoy el primer mes y el contrato se activa.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Nombre en la tarjeta"
          required
          autoComplete="off"
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          error={errors.name}
        />
        <Input
          label="Número de tarjeta"
          required
          inputMode="numeric"
          autoComplete="off"
          placeholder="4242 4242 4242 4242"
          value={values.number}
          onChange={(event) => setValues({ ...values, number: formatCardNumber(event.target.value) })}
          error={errors.number}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Vencimiento"
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder="MM/AA"
            value={values.expiry}
            onChange={(event) => setValues({ ...values, expiry: formatExpiry(event.target.value) })}
            error={errors.expiry}
          />
          <Input
            label="Código (CVC)"
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder="123"
            value={values.cvc}
            onChange={(event) => setValues({ ...values, cvc: formatCvc(event.target.value) })}
            error={errors.cvc}
          />
        </div>
      </div>

      {payError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
          {payError}
        </p>
      )}

      <Button type="submit" className="w-full min-w-0 gap-1.5 py-2.5" disabled={isPaying}>
        <Lock className="h-3.5 w-3.5" />
        {isPaying ? "Procesando..." : `Pagar $${solicitud.plan.price}`}
      </Button>
    </form>
  );
}

function Receipt({
  receipt,
  solicitud,
  onClose,
}: {
  receipt: PaymentReceipt;
  solicitud: ClientSolicitud;
  onClose: () => void;
}) {
  const rows: Array<[string, string]> = [
    ["Referencia", receipt.reference],
    ["Plan", `${solicitud.plan.name} · ${solicitud.freelancer.name}`],
    ["Monto", `$${receipt.amount} ${receipt.currency}`],
    ["Fecha", formatSolicitudDate(receipt.paidAt)],
    ["Próximo cobro", formatSolicitudDate(receipt.nextChargeAt)],
  ];

  return (
    <div className="flex flex-col items-center gap-3 py-6 text-center">
      <CheckCircle2 className="h-12 w-12 text-emerald-500" />
      <p className="text-base font-bold text-gray-900">¡Pago aprobado!</p>
      <p className="text-xs text-gray-500">Tu contrato con {solicitud.freelancer.name} ya está activo.</p>

      <dl className="mt-2 w-full divide-y divide-gray-100 rounded-xl border border-gray-200 text-left text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
            <dt className="text-gray-500">{label}</dt>
            <dd className="break-all text-right font-medium text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[11px] text-gray-400">Comprobante de demostración: no se realizó ningún cobro real.</p>

      <Button className="mt-2 w-full min-w-0" onClick={onClose}>
        Listo
      </Button>
    </div>
  );
}
