import { useState } from "react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { X } from "lucide-react";

type Service = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

type Invoice = {
  id: string;
  date: string;
  total: number;
  status: "Paid" | "Pending" | "Overdue";
  freelancerName: string;
  services: Service[];
};

import plansData from "@/data/clientSubscriptionPlans.json";

const plans = plansData as Array<any>;
const PLAN_MAP = plans.reduce<Record<string, any>>((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {});

// Sample invoices now reference a subscription plan when appropriate. Totals
// are derived from the plan price to reflect "monto fijo dependiendo de la suscripción".
const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv_001",
    date: "14 jul 2026",
    total: PLAN_MAP["plan-cliente"] ? PLAN_MAP["plan-cliente"].price : 23.6,
    status: "Paid",
    freelancerName: "María González",
    services: [
      { id: "s1", name: "Diseño de logo", price: 10, description: "Logo principal + variantes" },
      { id: "s2", name: "Entrega final", price: 13.6, description: "Archivos en vectores y PNG" },
    ],
    // link invoice to a plan
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    planId: "plan-cliente",
  } as Invoice & { planId?: string },
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
  // derive invoices totals from plan when planId present to keep UI consistent
  const invoicesWithPlan = SAMPLE_INVOICES.map((inv: any) => {
    if (inv.planId && PLAN_MAP[inv.planId]) {
      return { ...inv, total: PLAN_MAP[inv.planId].price, planName: PLAN_MAP[inv.planId].name };
    }
    return inv;
  });

  const [invoices] = useState<Invoice[]>(invoicesWithPlan);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <PanelSectionHeader subtitle="Bienvenido de nuevo" title="Pagos" />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-slate-500">
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="h-16">
                  <td className="align-middle text-base text-slate-700">{inv.date}</td>
                  <td className="align-middle text-base font-medium text-slate-800">${inv.total.toFixed(2)}</td>
                  <td className="align-middle text-base text-slate-600">{inv.status}</td>
                  <td className="align-middle text-base">
                    <button
                      className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setSelectedService(null);
                      }}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice modal */}
      {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedInvoice(null)} />

            <div className="relative z-10 w-[min(900px,95%)] rounded-2xl bg-white p-6 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Factura</h3>
                  <p className="text-sm text-slate-500">ID: {selectedInvoice.id} • {selectedInvoice.date}</p>
                </div>

                <button
                  className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
                  onClick={() => setSelectedInvoice(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Cliente</p>
                  <p className="font-medium">Nombre del cliente</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Freelancer</p>
                  <p className="font-medium">{selectedInvoice.freelancerName}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-semibold">${selectedInvoice.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-700">Servicios</h4>

                <ul className="mt-3 space-y-2">
                  {selectedInvoice.services.map((svc) => (
                    <li key={svc.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{svc.name}</div>
                        {svc.description && <div className="text-xs text-slate-500">{svc.description}</div>}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">${svc.price.toFixed(2)}</div>
                        <button
                          className="text-indigo-600 hover:underline"
                          onClick={() => setSelectedService(svc)}
                        >
                          Ver
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                  onClick={() => alert('Simulación de pago / descarga de factura')}
                >
                  Descargar factura
                </button>
              </div>

              {/* Service detail inline section */}
              {selectedService && (
                <div className="mt-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-sm font-semibold">{selectedService.name}</h5>
                      <p className="mt-1 text-xs text-slate-600">{selectedService.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">${selectedService.price.toFixed(2)}</div>
                      <button
                        className="text-sm text-indigo-600 hover:underline"
                        onClick={() => setSelectedService(null)}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
       )}
   </div>
  );
}
