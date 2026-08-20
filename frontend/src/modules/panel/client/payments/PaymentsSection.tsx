"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Download, FileText, Receipt, Sparkles, User, X } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";
import plansData from "@/data/clientSubscriptionPlans.json";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface Invoice {
  id: string;
  date: string;
  total: number;
  status: "Paid" | "Pending" | "Overdue";
  freelancerName: string;
  services: Service[];
  planName?: string;
}

const plans = plansData as SubscriptionPlan[];
const PLAN_MAP = plans.reduce<Record<string, SubscriptionPlan>>((acc, plan) => {
  acc[plan.id] = plan;
  return acc;
}, {});

const statusConfig = {
  Paid: { label: "Pagado", icon: CheckCircle2, badgeClassName: "!bg-emerald-50 !text-emerald-600" },
  Pending: { label: "Pendiente", icon: Clock3, badgeClassName: "!bg-amber-50 !text-amber-600" },
  Overdue: { label: "Vencido", icon: Clock3, badgeClassName: "!bg-rose-50 !text-rose-600" },
} satisfies Record<Invoice["status"], { label: string; icon: typeof CheckCircle2; badgeClassName: string }>;

// Los totales se derivan del plan de suscripción para reflejar un "monto fijo dependiendo de la suscripción".
const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv_001",
    date: "14 jul 2026",
    total: PLAN_MAP["plan-cliente"]?.price ?? 23.6,
    status: "Paid",
    freelancerName: "María González",
    services: [
      { id: "s1", name: "Diseño de logo", price: 10, description: "Logo principal + variantes" },
      { id: "s2", name: "Entrega final", price: 13.6, description: "Archivos en vectores y PNG" },
    ],
    planName: PLAN_MAP["plan-cliente"]?.name,
  },
  {
    id: "inv_002",
    date: "5 may 2026",
    total: 20,
    status: "Paid",
    freelancerName: "Carlos Ramírez",
    services: [{ id: "s3", name: "Desarrollo web (landing)", price: 20 }],
  },
  {
    id: "inv_003",
    date: "29 mar 2026",
    total: 20,
    status: "Paid",
    freelancerName: "Ana López",
    services: [{ id: "s4", name: "Fotografía de producto", price: 20 }],
  },
];

export function PaymentsSection() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <PanelSectionHeader subtitle="Bienvenido de nuevo" title="Pagos" />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {SAMPLE_INVOICES.map((invoice) => {
                const status = statusConfig[invoice.status];
                const StatusIcon = status.icon;
                return (
                  <tr key={invoice.id} className="transition hover:bg-indigo-50/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{invoice.date}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">${invoice.total.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <Badge className={`${status.badgeClassName} inline-flex items-center gap-1.5`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        variant="outline-neutral"
                        className="!min-w-0 !px-3"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={Boolean(selectedInvoice)} onClose={() => setSelectedInvoice(null)}>
        {selectedInvoice ? (
          <>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-3 pr-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Factura</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">${selectedInvoice.total.toFixed(2)}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedInvoice.id} <span className="mx-1 text-slate-300">·</span> {selectedInvoice.date}
                  </p>
                  <Badge
                    className={`${statusConfig[selectedInvoice.status].badgeClassName} mt-2 inline-flex items-center gap-1.5`}
                  >
                    {(() => {
                      const StatusIcon = statusConfig[selectedInvoice.status].icon;
                      return <StatusIcon className="h-3.5 w-3.5" />;
                    })()}
                    {statusConfig[selectedInvoice.status].label}
                  </Badge>
                </div>
              </div>
              <button
                type="button"
                aria-label="Cerrar detalles"
                onClick={() => setSelectedInvoice(null)}
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
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">Freelancer</p>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{selectedInvoice.freelancerName}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarDays className="h-4 w-4 text-indigo-500" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em]">Fecha</p>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{selectedInvoice.date}</p>
                </div>
              </div>

              {selectedInvoice.planName && (
                <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                  <Sparkles className="h-4 w-4 shrink-0 text-indigo-500" />
                  Facturado según el plan <span className="font-semibold">{selectedInvoice.planName}</span>
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-sm font-semibold text-slate-900">Servicios</h4>
                </div>
                <div className="space-y-2">
                  {selectedInvoice.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">{service.name}</p>
                        {service.description && (
                          <p className="mt-0.5 text-xs text-slate-500">{service.description}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-slate-800">
                        ${service.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-600">Total facturado</span>
                <span className="text-lg font-bold text-slate-900">${selectedInvoice.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
              <Button
                variant="primary"
                className="flex flex-1 items-center justify-center gap-2"
                onClick={() => alert("Simulación de pago / descarga de factura")}
              >
                <Download className="h-4 w-4" />
                Descargar factura
              </Button>
            </div>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
