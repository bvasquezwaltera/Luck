"use client";

import { CalendarClock, FileCheck2, Receipt, Wallet } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { PaymentSummaryCard } from "@/modules/panel/PaymentSummaryCard";
import { PaymentsTable } from "@/modules/panel/PaymentsTable";
import { formatMoney } from "@/lib/formatMoney";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import { describeDaysUntil } from "@/lib/relativeDays";
import type { ClientPaymentSummary, PaymentRecord } from "@/types/payment";

// payments / summary llegan como null cuando el servidor falló: se avisa en vez de mostrar "sin pagos".
export function PaymentsSection({
  payments,
  summary,
}: {
  payments: PaymentRecord[] | null;
  summary: ClientPaymentSummary | null;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <PanelSectionHeader icon={Wallet} subtitle="Tus contratos activos y el historial de tus pagos." title="Pagos" />
      </div>

      {payments === null || summary === null ? (
        <div className="rounded-[24px] border border-red-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-800">No se pudieron cargar tus pagos.</p>
          <p className="mt-1 text-xs text-slate-500">Recarga la página para intentarlo de nuevo.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <PaymentSummaryCard
              label="Contratos activos"
              value={String(summary.activeContracts)}
              hint={summary.activeContracts === 1 ? "Suscripción vigente" : "Suscripciones vigentes"}
              icon={<FileCheck2 className="h-5 w-5" />}
              tone="emerald"
            />
            <PaymentSummaryCard
              label="Gasto mensual"
              value={formatMoney(summary.monthlySpend)}
              hint="Suma de tus suscripciones activas"
              icon={<Wallet className="h-5 w-5" />}
              tone="indigo"
            />
            <PaymentSummaryCard
              label="Próximo cobro"
              value={summary.nextChargeAt ? formatSolicitudDate(summary.nextChargeAt) : "—"}
              hint={summary.nextChargeAt ? describeDaysUntil(summary.nextChargeAt) : "Sin contratos activos"}
              icon={<CalendarClock className="h-5 w-5" />}
              tone="sky"
            />
          </div>

          <PaymentsTable
            payments={payments}
            role="client"
            empty={
              <div className="flex flex-col items-center gap-3 rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Receipt className="h-7 w-7" />
                </div>
                <p className="text-base font-semibold text-slate-900">Aún no tienes pagos</p>
                <p className="max-w-md text-sm text-slate-600">
                  Cuando un freelancer acepte tu solicitud podrás pagarla desde la sección Solicitudes, y tus
                  comprobantes aparecerán aquí.
                </p>
              </div>
            }
          />
        </>
      )}
    </div>
  );
}
