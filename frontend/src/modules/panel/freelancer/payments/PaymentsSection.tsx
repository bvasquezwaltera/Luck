"use client";

import { CalendarClock, Percent, Receipt, TrendingUp, Wallet } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { PaymentSummaryCard } from "@/modules/panel/PaymentSummaryCard";
import { PaymentsTable } from "@/modules/panel/PaymentsTable";
import { formatMoney } from "@/lib/formatMoney";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import type { FreelancerPaymentSummary, PaymentRecord } from "@/types/payment";

// payments / summary llegan como null cuando el servidor falló: se avisa en vez de mostrar "sin cobros".
export function PaymentsSection({
  payments,
  summary,
}: {
  payments: PaymentRecord[] | null;
  summary: FreelancerPaymentSummary | null;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <PanelSectionHeader subtitle="Lo que cobras por tus contratos, con la comisión de la plataforma." title="Pagos" />
      </div>

      {payments === null || summary === null ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-800">No se pudieron cargar tus pagos.</p>
          <p className="mt-1 text-xs text-slate-500">Recarga la página para intentarlo de nuevo.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PaymentSummaryCard
              label="Neto recibido"
              value={formatMoney(summary.totalNet)}
              hint={`De ${formatMoney(summary.totalGross)} cobrados`}
              icon={<Wallet className="h-4 w-4" />}
            />
            <PaymentSummaryCard
              label={`Comisión (${summary.commissionRate}%)`}
              value={formatMoney(summary.totalCommission)}
              hint="Retenida por la plataforma"
              icon={<Percent className="h-4 w-4" />}
            />
            <PaymentSummaryCard
              label="Ingreso mensual neto"
              value={formatMoney(summary.monthlyNet)}
              hint={`${summary.activeContracts} ${summary.activeContracts === 1 ? "contrato activo" : "contratos activos"}`}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <PaymentSummaryCard
              label="Próximo cobro"
              value={summary.nextChargeAt ? formatSolicitudDate(summary.nextChargeAt) : "—"}
              icon={<CalendarClock className="h-4 w-4" />}
            />
          </div>

          <PaymentsTable
            payments={payments}
            role="freelancer"
            empty={
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Receipt className="h-7 w-7" />
                </div>
                <p className="text-base font-semibold text-slate-900">Aún no has cobrado</p>
                <p className="max-w-md text-sm text-slate-600">
                  Cuando aceptes una solicitud y el cliente la pague, el cobro aparecerá aquí con su comisión y su neto.
                </p>
              </div>
            }
          />
        </>
      )}
    </div>
  );
}
