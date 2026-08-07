"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, Sparkles, UploadCloud } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";
import { Textarea } from "@/ui/Textarea";

interface DeliveryModule {
  id: string;
  title: string;
  clientName: string;
  requestTitle: string;
  category: string;
  progress: number;
  status: "En curso" | "Pendiente" | "Listo para revisión";
  dueDate: string;
  nextMilestone: string;
  objectives: string[];
}

const deliveryModules: DeliveryModule[] = [
  {
    id: "modulo-1",
    title: "Módulo 1 · Diseño de interfaz",
    clientName: "María López",
    requestTitle: "Landing page corporativa",
    category: "Diseño",
    progress: 72,
    status: "En curso",
    dueDate: "12 ago",
    nextMilestone: "Entrega visual inicial y sistema de colores",
    objectives: ["Definir estructura visual", "Aplicar branding", "Preparar versión mobile"],
  },
  {
    id: "modulo-2",
    title: "Módulo 2 · Desarrollo web",
    clientName: "Carlos Ruiz",
    requestTitle: "Portal de reservas",
    category: "Desarrollo",
    progress: 45,
    status: "Pendiente",
    dueDate: "18 ago",
    nextMilestone: "Integrar flujo de reserva y validaciones",
    objectives: ["Construir vistas principales", "Conectar formulario", "Preparar demo interna"],
  },
  {
    id: "modulo-3",
    title: "Módulo 3 · Marketing digital",
    clientName: "Ana Torres",
    requestTitle: "Campaña de lanzamiento",
    category: "Marketing",
    progress: 88,
    status: "Listo para revisión",
    dueDate: "09 ago",
    nextMilestone: "Publicar contenido final y revisar métricas",
    objectives: ["Ajustar mensajes", "Preparar calendario", "Enviar propuesta final"],
  },
];

export function DeliveriesSection() {
  const [selectedModule, setSelectedModule] = useState<DeliveryModule | null>(null);
  const [advanceText, setAdvanceText] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  const summary = useMemo(() => {
    const completed = deliveryModules.filter((module) => module.progress >= 80).length;
    const inProgress = deliveryModules.filter((module) => module.progress < 80 && module.progress > 0).length;
    return { completed, inProgress, total: deliveryModules.length };
  }, []);

  function openModule(module: DeliveryModule) {
    setSelectedModule(module);
    setAdvanceText("");
    setSubmittedMessage("");
  }

  function handleSubmitAdvance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedModule) return;
    setSubmittedMessage(`Tu avance para “${selectedModule.title}” quedó registrado y listo para compartir con el cliente.`);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" />
              Avances y entregables
            </div>
            <PanelSectionHeader subtitle="Gestiona tus entregas por módulo y mantén al cliente informado de cada avance." title="Entregas" />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Total</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{summary.total}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">En curso</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{summary.inProgress}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Listos</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">{summary.completed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {deliveryModules.map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => openModule(module)}
            className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{module.category}</span>
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{module.requestTitle}</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{module.title}</h3>
            <p className="mt-2 text-sm text-slate-600">Cliente: {module.clientName}</p>

            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500" style={{ width: `${module.progress}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{module.progress}% completado</span>
              <span>{module.status}</span>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-500" />
                Próxima fecha: {module.dueDate}
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
          </button>
        ))}
      </div>

      <Modal open={Boolean(selectedModule)} onClose={() => setSelectedModule(null)}>
        {selectedModule ? (
          <div className="space-y-6 p-5 sm:p-6">
            <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Módulo activo</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{selectedModule.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{selectedModule.requestTitle} · {selectedModule.clientName}</p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm">
                {selectedModule.status}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-sm font-semibold text-slate-900">Objetivos del módulo</h4>
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {selectedModule.objectives.map((objective) => (
                    <li key={objective} className="rounded-xl bg-slate-50 px-3 py-2">
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-semibold text-slate-900">Próximo avance</h4>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{selectedModule.nextMilestone}</p>
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">
                  <CalendarDays className="h-4 w-4" />
                  Fecha estimada: {selectedModule.dueDate}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitAdvance} className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-slate-900">Registrar avance o entrega</h4>
              </div>

              <Textarea
                label="Describe el avance"
                value={advanceText}
                onChange={(event) => setAdvanceText(event.target.value)}
                placeholder="Ejemplo: subí el prototipo inicial, ajusté los colores y preparé la primera revisión para el cliente."
                rows={5}
                className="mt-4"
              />

              {submittedMessage ? (
                <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                  {submittedMessage}
                </div>
              ) : null}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">Puedes usar este bloque para dejar un avance, subir una nota o preparar la entrega del módulo.</p>
                <Button type="submit" variant="primary" className="!min-w-0">Guardar avance</Button>
              </div>
            </form>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
