"use client";

import { useState } from "react";
import { Check, CheckCircle2, Clock3, Copy, Download, Receipt, X } from "lucide-react";
import { downloadReceipt } from "@/lib/api/client/payments";
import { formatMoney } from "@/lib/formatMoney";
import { formatSolicitudDateTime } from "@/lib/formatSolicitudDate";
import type { PaymentRecord } from "@/types/payment";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";

export const PAYMENT_STATUS_CONFIG = {
  aprobado: { label: "Pagado", icon: CheckCircle2, badgeClassName: "!bg-emerald-50 !text-emerald-600" },
  rechazado: { label: "Rechazado", icon: Clock3, badgeClassName: "!bg-rose-50 !text-rose-600" },
} satisfies Record<PaymentRecord["status"], { label: string; icon: typeof CheckCircle2; badgeClassName: string }>;

// Comprobante de un pago, con el mismo diseño para cliente y freelancer. Solo el freelancer ve
// la comisión de la plataforma y el neto (el servidor únicamente se los envía a él).
export function PaymentReceiptModal({
  payment,
  role,
  onClose,
}: {
  payment: PaymentRecord | null;
  role: "client" | "freelancer";
  onClose: () => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleDownload(current: PaymentRecord) {
    setIsDownloading(true);
    setError("");
    const result = await downloadReceipt(current.id, current.reference);
    setIsDownloading(false);
    if (result.error) setError(result.error);
  }

  async function handleCopy(reference: string) {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Sin permiso de portapapeles: no pasa nada, la referencia se puede seleccionar a mano.
    }
  }

  function handleClose() {
    setError("");
    setCopied(false);
    onClose();
  }

  return (
    <Modal open={payment !== null} onClose={handleClose}>
      {payment && (
        <>
          <div className="relative border-b border-slate-200 px-6 pb-6 pt-6 sm:px-8">
            <button
              type="button"
              aria-label="Cerrar comprobante"
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Comprobante de pago
                </p>
                <PaymentStatusBadge status={payment.status} />
              </div>
            </div>

            <p className="mt-5 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatMoney(payment.amount)}
              </span>
              <span className="text-sm font-medium text-slate-400">{payment.currency}</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {role === "client" ? "Pagaste a " : ""}
              <span className="font-semibold text-slate-800">{payment.counterpart.name}</span>
              {role === "client" ? "" : " te pagó"} por el plan{" "}
              <span className="font-semibold text-slate-800">{payment.planName}</span>.
            </p>
          </div>

          <div className="space-y-6 px-6 py-6 sm:px-8">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Meta label="Fecha y hora" value={formatSolicitudDateTime(payment.createdAt)} />
              <Meta label="Método de pago" value={payment.method === "simulado" ? "Simulado" : payment.method} />
              <div className="sm:col-span-2">
                <Meta label="Solicitud" value={payment.solicitudTitle} />
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-slate-400">Referencia</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <code className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-sm text-slate-700">
                    {payment.reference}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(payment.reference)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copiada" : "Copiar"}
                  </button>
                </dd>
              </div>
            </dl>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Desglose</p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 text-sm">
                <Line label={`Plan ${payment.planName} · mensual`} value={formatMoney(payment.amount)} />

                {role === "freelancer" && payment.commission !== null && payment.net !== null ? (
                  <>
                    <Line
                      label={`Comisión de la plataforma (${payment.commissionRate ?? 0}%)`}
                      value={`- ${formatMoney(payment.commission)}`}
                      muted
                    />
                    <div className="my-3 border-t border-dashed border-slate-300" />
                    <Line label="Neto a recibir" value={formatMoney(payment.net)} total />
                  </>
                ) : (
                  <>
                    <div className="my-3 border-t border-dashed border-slate-300" />
                    <Line label={payment.status === "aprobado" ? "Total pagado" : "Monto intentado"} value={formatMoney(payment.amount)} total />
                  </>
                )}
              </div>
            </div>

            {payment.status === "rechazado" && payment.rejectionReason && (
              <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">Motivo del rechazo: {payment.rejectionReason}</p>
            )}
            <p className="text-xs text-slate-400">
              Comprobante de demostración: el pago es simulado y no corresponde a un cobro real.
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="sticky bottom-0 z-10 flex gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-8">
            <Button variant="outline-neutral" onClick={handleClose} className="flex-1">
              Cerrar
            </Button>
            {payment.status === "aprobado" && (
              <Button onClick={() => handleDownload(payment)} disabled={isDownloading} className="flex-1 gap-1.5">
                <Download className="h-3.5 w-3.5" />
                {isDownloading ? "Descargando..." : "Descargar PDF"}
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

export function PaymentStatusBadge({ status, className = "" }: { status: PaymentRecord["status"]; className?: string }) {
  const config = PAYMENT_STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge className={`${config.badgeClassName} inline-flex items-center gap-1.5 ${className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

// Una línea de la cuenta: concepto a la izquierda, importe a la derecha.
function Line({ label, value, muted = false, total = false }: { label: string; value: string; muted?: boolean; total?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${muted ? "mt-2" : ""}`}>
      <span className={total ? "font-semibold text-slate-900" : muted ? "text-slate-500" : "text-slate-700"}>{label}</span>
      <span
        className={`tabular-nums ${total ? "text-xl font-bold text-slate-900" : muted ? "font-medium text-slate-500" : "font-semibold text-slate-900"}`}
      >
        {value}
      </span>
    </div>
  );
}
