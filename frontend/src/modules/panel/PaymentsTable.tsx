"use client";

import { useState, type ReactNode } from "react";
import { Download, Eye } from "lucide-react";
import { PaymentReceiptModal, PaymentStatusBadge } from "@/modules/panel/PaymentReceiptModal";
import { downloadReceipt } from "@/lib/api/client/payments";
import { formatMoney } from "@/lib/formatMoney";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import type { PaymentRecord } from "@/types/payment";
import { Pagination } from "@/ui/Pagination";

const PAGE_SIZE = 8;

// Tabla de pagos y su comprobante. El freelancer ve columnas extra de comisión y neto, y los totales
// de lo que cobró; el cliente, lo que pagó.
export function PaymentsTable({
  payments,
  role,
  empty,
}: {
  payments: PaymentRecord[];
  role: "client" | "freelancer";
  empty: ReactNode;
}) {
  const [selected, setSelected] = useState<PaymentRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(payments.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const visible = payments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFreelancer = role === "freelancer";

  if (payments.length === 0) return <>{empty}</>;

  // Los totales solo cuentan los pagos aprobados (un rechazado no movió dinero).
  const approved = payments.filter((payment) => payment.status === "aprobado");
  const totalAmount = approved.reduce((sum, payment) => sum + payment.amount, 0);
  const totalCommission = approved.reduce((sum, payment) => sum + (payment.commission ?? 0), 0);
  const totalNet = approved.reduce((sum, payment) => sum + (payment.net ?? 0), 0);
  const currency = payments[0].currency;

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">
            {isFreelancer ? "Historial de cobros" : "Historial de pagos"}
          </h3>
          <span className="text-xs text-slate-500">
            {payments.length} {payments.length === 1 ? "movimiento" : "movimientos"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">{isFreelancer ? "Cliente · Plan" : "Freelancer · Plan"}</th>
                <th className="px-5 py-3 text-right">{isFreelancer ? "Monto" : "Total"}</th>
                {isFreelancer && <th className="px-5 py-3 text-right">Comisión</th>}
                {isFreelancer && <th className="px-5 py-3 text-right">Neto</th>}
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} isFreelancer={isFreelancer} onOpen={() => setSelected(payment)} />
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50 text-sm">
              <tr>
                <td className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500" colSpan={2}>
                  {isFreelancer ? "Total cobrado" : "Total pagado"}
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                  {formatMoney(totalAmount, currency)}
                </td>
                {isFreelancer && (
                  <td className="px-5 py-3.5 text-right font-medium text-slate-500 tabular-nums">
                    - {formatMoney(totalCommission, currency)}
                  </td>
                )}
                {isFreelancer && (
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900 tabular-nums">
                    {formatMoney(totalNet, currency)}
                  </td>
                )}
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      <PaymentReceiptModal payment={selected} role={role} onClose={() => setSelected(null)} />
    </>
  );
}

function PaymentRow({
  payment,
  isFreelancer,
  onOpen,
}: {
  payment: PaymentRecord;
  isFreelancer: boolean;
  onOpen: () => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    setIsDownloading(true);
    setError("");
    const result = await downloadReceipt(payment.id, payment.reference);
    setIsDownloading(false);
    if (result.error) setError(result.error);
  }

  const iconButton =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <tr className="transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <p className="whitespace-nowrap text-sm font-semibold text-slate-800">{formatSolicitudDate(payment.createdAt)}</p>
        <p className="mt-0.5 font-mono text-[11px] text-slate-400">{payment.reference}</p>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
            {payment.counterpart.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{payment.counterpart.name}</p>
            <p className="truncate text-xs text-slate-500">
              Plan {payment.planName} · {payment.solicitudTitle}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900 tabular-nums">
        {formatMoney(payment.amount, payment.currency)}
      </td>
      {isFreelancer && (
        <td className="px-5 py-4 text-right text-sm text-slate-500 tabular-nums">
          {payment.commission !== null ? `- ${formatMoney(payment.commission, payment.currency)}` : "—"}
        </td>
      )}
      {isFreelancer && (
        <td className="px-5 py-4 text-right text-sm font-bold text-slate-900 tabular-nums">
          {payment.net !== null ? formatMoney(payment.net, payment.currency) : "—"}
        </td>
      )}
      <td className="px-5 py-4">
        <PaymentStatusBadge status={payment.status} />
      </td>
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <button type="button" className={iconButton} onClick={onOpen} title="Ver detalle" aria-label="Ver detalle">
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={iconButton}
            onClick={handleDownload}
            disabled={isDownloading || payment.status !== "aprobado"}
            title={payment.status === "aprobado" ? "Descargar comprobante (PDF)" : "Solo hay comprobante de pagos aprobados"}
            aria-label="Descargar comprobante"
          >
            <Download className={`h-4 w-4 ${isDownloading ? "animate-pulse" : ""}`} />
          </button>
        </div>
        {error && <p className="mt-1 text-right text-[11px] text-red-500">{error}</p>}
      </td>
    </tr>
  );
}
