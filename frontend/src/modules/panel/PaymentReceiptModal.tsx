"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Download, FileText, Hash, Receipt, User, X } from "lucide-react";
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

  async function handleDownload(current: PaymentRecord) {
    setIsDownloading(true);
    setError("");
    const result = await downloadReceipt(current.id, current.reference);
    setIsDownloading(false);
    if (result.error) setError(result.error);
  }

  function handleClose() {
    setError("");
    onClose();
  }

  return (
    <Modal open={payment !== null} onClose={handleClose}>
      {payment && (
        <>
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex min-w-0 items-start gap-3 pr-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Comprobante</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{formatMoney(payment.amount, payment.currency)}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {payment.reference}
                  </span>
                  <span className="text-slate-300">·</span>
                  {formatSolicitudDateTime(payment.createdAt)}
                </p>
                <PaymentStatusBadge status={payment.status} className="mt-2" />
              </div>
            </div>
            <button
              type="button"
              aria-label="Cerrar comprobante"
              onClick={handleClose}
              className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <User className="h-4 w-4 text-indigo-500" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                    {role === "client" ? "Freelancer" : "Cliente"}
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">{payment.counterpart.name}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Fecha</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">{formatSolicitudDateTime(payment.createdAt)}</p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <h4 className="text-sm font-semibold text-slate-900">Detalle</h4>
              </div>
              <dl className="divide-y divide-slate-100 rounded-xl border border-slate-100 text-sm">
                <Row label="Solicitud" value={payment.solicitudTitle} />
                <Row label="Plan" value={`${payment.planName} · mensual`} />
                <Row label="Método de pago" value={payment.method === "simulado" ? "Simulado" : payment.method} />
                <Row label="Monto pagado" value={formatMoney(payment.amount, payment.currency)} strong />
                {role === "freelancer" && payment.commission !== null && payment.net !== null && (
                  <>
                    <Row
                      label={`Comisión de la plataforma (${payment.commissionRate ?? 0}%)`}
                      value={`- ${formatMoney(payment.commission, payment.currency)}`}
                    />
                    <Row label="Neto a recibir" value={formatMoney(payment.net, payment.currency)} strong />
                  </>
                )}
              </dl>
            </div>

            {payment.status === "rechazado" && payment.rejectionReason && (
              <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">Motivo: {payment.rejectionReason}</p>
            )}
            <p className="text-[11px] text-slate-400">
              Comprobante de demostración: el pago es simulado y no corresponde a un cobro real.
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="sticky bottom-0 z-10 flex gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
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

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-right text-slate-900 ${strong ? "font-bold" : "font-medium"}`}>{value}</dd>
    </div>
  );
}
