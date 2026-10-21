"use client";

import { useState, type ReactNode } from "react";
import { Eye, Receipt } from "lucide-react";
import { PaymentReceiptModal, PaymentStatusBadge } from "@/modules/panel/PaymentReceiptModal";
import { formatMoney } from "@/lib/formatMoney";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import type { PaymentRecord } from "@/types/payment";
import { Button } from "@/ui/Button";
import { Pagination } from "@/ui/Pagination";

const PAGE_SIZE = 8;

// Tabla de pagos y su comprobante. El freelancer ve columnas extra de comisión y neto.
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

  return (
    <>
      <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">{isFreelancer ? "Cliente · Plan" : "Freelancer · Plan"}</th>
                <th className="px-5 py-4">{isFreelancer ? "Monto" : "Total"}</th>
                {isFreelancer && <th className="px-5 py-4">Comisión</th>}
                {isFreelancer && <th className="px-5 py-4">Neto</th>}
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((payment) => (
                <tr key={payment.id} className="transition hover:bg-indigo-50/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <span className="whitespace-nowrap text-sm font-medium text-slate-700">
                        {formatSolicitudDate(payment.createdAt)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800">{payment.counterpart.name}</p>
                    <p className="text-xs text-slate-500">Plan {payment.planName}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {formatMoney(payment.amount, payment.currency)}
                  </td>
                  {isFreelancer && (
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {payment.commission !== null ? `- ${formatMoney(payment.commission, payment.currency)}` : "—"}
                    </td>
                  )}
                  {isFreelancer && (
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                      {payment.net !== null ? formatMoney(payment.net, payment.currency) : "—"}
                    </td>
                  )}
                  <td className="px-5 py-4">
                    <PaymentStatusBadge status={payment.status} />
                  </td>
                  <td className="px-5 py-4">
                    <Button
                      variant="outline-neutral"
                      className="!min-w-0 gap-1.5 !px-3"
                      onClick={() => setSelected(payment)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver detalle
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
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
