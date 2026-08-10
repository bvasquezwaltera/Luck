"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Info, Plus, Send, ShieldCheck, Trash2, X } from "lucide-react";
import { Modal } from "@/ui/Modal";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Textarea";
import { Input } from "@/ui/Input";
import type { Solicitud } from "@/types/solicitud";

interface DeliveryMilestone {
  id: string;
  title: string;
  description: string;
  characteristics: string;
  days: number;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function RespondSolicitudModal({
  open,
  onClose,
  solicitud,
}: {
  open: boolean;
  onClose: () => void;
  solicitud: Solicitud;
}) {
  const [message, setMessage] = useState("");
  const [milestones, setMilestones] = useState<DeliveryMilestone[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalDays = milestones.reduce((total, milestone) => total + milestone.days, 0);
  const finalDate = useMemo(() => addDays(new Date(), totalDays), [totalDays]);

  function addMilestone() {
    setMilestones((current) => [
      ...current,
      { id: crypto.randomUUID(), title: "", description: "", characteristics: "", days: 1 },
    ]);
  }

  function updateMilestone(id: string, changes: Partial<DeliveryMilestone>) {
    setMilestones((current) =>
      current.map((milestone) => (milestone.id === id ? { ...milestone, ...changes } : milestone)),
    );
  }

  function removeMilestone(id: string) {
    setMilestones((current) => current.filter((milestone) => milestone.id !== id));
  }

  const hasInvalidMilestone = milestones.some(
    (milestone) => !milestone.title.trim() || milestone.days < 1,
  );

  const handleSubmit = () => {
    if (!message.trim() || hasInvalidMilestone) return;
    setIsSubmitting(true);

    // Simulación temporal hasta conectar la respuesta con Supabase.
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setMessage("");
        setMilestones([]);
      }, 1800);
    }, 1000);
  };

  return (
    <Modal open={open} onClose={isSubmitting ? () => undefined : onClose}>
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6">
        <div className="min-w-0 pr-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
              <Send className="h-4 w-4 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Responder solicitud</h2>
          </div>
          <p className="mt-2 truncate text-xs text-slate-500">
            {solicitud.titulo} <span className="mx-1 text-slate-300">·</span> {solicitud.planName}
          </p>
          {solicitud.desiredDate && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
              <CalendarDays className="h-3.5 w-3.5" />
              Fecha solicitada: {new Date(solicitud.desiredDate).toLocaleDateString()}
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Cerrar respuesta"
          onClick={onClose}
          disabled={isSubmitting}
          className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Send className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">¡Respuesta enviada!</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
            El cliente recibirá tu propuesta de trabajo y el calendario de entregas.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6 p-5 sm:p-6">
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">Solicitud cubierta por</p>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-bold text-slate-900">{solicitud.planName}</p>
                <Badge className="!bg-white !text-indigo-600 shadow-sm">
                  {solicitud.requestedDeliveries} {solicitud.requestedDeliveries === 1 ? "entrega" : "entregas"}
                </Badge>
              </div>
              <div className="mt-3 flex items-start gap-2 border-t border-indigo-100/80 pt-3">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <p className="text-xs leading-5 text-indigo-700">
                  No necesitas indicar presupuesto ni método de pago. Define tu enfoque y los tiempos que puedes cumplir.
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Propuesta para el cliente <span className="text-red-500">*</span>
              </label>
              <Textarea
                label="Propuesta para el cliente"
                hideLabel
                placeholder="Explica tu enfoque, qué necesitas para comenzar y cómo propones manejar las fechas de entrega..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-32"
                maxLength={800}
                required
              />
              <p className="mt-1 text-right text-[11px] text-slate-400">{message.length}/800</p>
            </div>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Calendario de entregas</h3>
                  <p className="mt-1 text-xs text-slate-500">Agrega las entregas que propones y sus días.</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Duración total</p>
                  <p className="text-sm font-bold text-indigo-600">{totalDays} días</p>
                </div>
              </div>

              <div className="space-y-2">
                {milestones.map((milestone, index) => {
                  const daysUntilDelivery = milestones
                    .slice(0, index + 1)
                    .reduce((sum, item) => sum + item.days, 0);
                  return (
                    <div key={milestone.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">Título</label>
                          <Input
                            label={`Título de la entrega ${index + 1}`}
                            hideLabel
                            placeholder="Ej. Diseño de la página de inicio"
                            value={milestone.title}
                            onChange={(event) => updateMilestone(milestone.id, { title: event.target.value })}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">Descripción</label>
                          <Input
                            label={`Descripción de la entrega ${index + 1}`}
                            hideLabel
                            placeholder="Describe brevemente esta entrega"
                            value={milestone.description}
                            onChange={(event) => updateMilestone(milestone.id, { description: event.target.value })}
                            className="h-9 text-sm"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-700">Características</label>
                          <Textarea
                            label={`Características de la entrega ${index + 1}`}
                            hideLabel
                            placeholder="Ej. Página de inicio y hasta 3 páginas internas, diseño responsive..."
                            value={milestone.characteristics}
                            onChange={(event) => updateMilestone(milestone.id, { characteristics: event.target.value })}
                            rows={3}
                            className="text-sm"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">Días</label>
                            <Input
                              label={`Días para la entrega ${index + 1}`}
                              hideLabel
                              aria-label={`Días para la entrega ${index + 1}`}
                              type="number"
                              min={1}
                              max={90}
                              value={milestone.days}
                              onChange={(event) =>
                                updateMilestone(milestone.id, {
                                  days: Math.max(1, Number(event.target.value) || 1),
                                })
                              }
                              className="h-9 w-10 text-center"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="!bg-violet-50 !text-violet-600">
                              Entrega {index + 1}
                            </Badge>
                            <Badge className="!bg-blue-50 flex items-center gap-1.5 !text-blue-600">
                              <Clock3 className="h-3.5 w-3.5" />
                              Día {daysUntilDelivery}
                            </Badge>
                            <button
                              type="button"
                              aria-label="Quitar entrega"
                              onClick={() => removeMilestone(milestone.id)}
                              className="shrink-0 rounded-lg border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline-neutral"
                className="mt-3 !min-w-0 !px-3"
                onClick={addMilestone}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Añadir entrega
              </Button>
            </section>

            <div className="inline-flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <CalendarDays className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-blue-500">Fecha estimada de finalización</p>
                <p className="text-sm font-bold text-blue-700">{formatDate(finalDate)}</p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 flex gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
            <Button variant="outline-neutral" onClick={onClose} disabled={isSubmitting} className="flex-1">Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !message.trim() || hasInvalidMilestone}
              className="flex-1"
            >
              {isSubmitting ? "Enviando..." : "Enviar respuesta"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
