"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Send, X } from "lucide-react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Textarea";
import { Input } from "@/ui/Input";
import type { Solicitud } from "@/types/solicitud";

function getInitialDays(deliveries: number) {
  return Array.from({ length: deliveries }, (_, index) => (index + 1) * 3);
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
  const [deliveryDays, setDeliveryDays] = useState(() => getInitialDays(solicitud.requestedDeliveries));
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalDays = deliveryDays.reduce((total, days) => total + days, 0);
  const finalDate = useMemo(() => addDays(new Date(), totalDays), [totalDays]);

  const handleSubmit = () => {
    if (!message.trim() || deliveryDays.some((days) => days < 1)) return;
    setIsSubmitting(true);

    // Simulación temporal hasta conectar la respuesta con Supabase.
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setMessage("");
        setDeliveryDays(getInitialDays(solicitud.requestedDeliveries));
        setAcceptedTerms(false);
      }, 1800);
    }, 1000);
  };

  return (
    <Modal open={open} onClose={isSubmitting ? () => undefined : onClose}>
      <div className="flex items-start justify-between border-b border-slate-200 p-5 sm:p-6">
        <div className="min-w-0 pr-4">
          <h2 className="text-xl font-bold text-slate-900">Responder solicitud</h2>
          <p className="mt-1 truncate text-xs text-slate-500">{solicitud.titulo} · {solicitud.planName}</p>
        </div>
        <button type="button" aria-label="Cerrar respuesta" onClick={onClose} disabled={isSubmitting} className="text-slate-400 transition hover:text-slate-700 disabled:opacity-50">
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
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-500">Solicitud cubierta por</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-slate-900">{solicitud.planName}</p>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-indigo-600">
                  {solicitud.requestedDeliveries} {solicitud.requestedDeliveries === 1 ? "entrega" : "entregas"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-indigo-700">
                No necesitas indicar presupuesto ni método de pago. Define tu enfoque y los tiempos que puedes cumplir.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Mensaje para el cliente <span className="text-red-500">*</span>
              </label>
              <Textarea
                label="Mensaje para el cliente"
                hideLabel
                placeholder="Explica cómo abordarás el proyecto, qué necesitas para comenzar y cualquier consideración importante..."
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
                  <p className="mt-1 text-xs text-slate-500">Indica cuántos días necesitas para cada parte.</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Duración total</p>
                  <p className="text-sm font-bold text-indigo-600">{totalDays} días</p>
                </div>
              </div>

              <div className="space-y-2">
                {solicitud.requestedMilestones.map((milestone, index) => {
                  const daysUntilDelivery = deliveryDays.slice(0, index + 1).reduce((sum, days) => sum + days, 0);
                  return (
                    <div key={milestone.id} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_100px_130px] sm:items-center">
                      <div className="flex min-w-0 items-start gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800">{milestone.title}</p>
                          <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{milestone.description}</p>
                        </div>
                      </div>
                      <label className="flex items-center gap-2">
                        <Input
                          label={`Días para ${milestone.title}`}
                          hideLabel
                          aria-label={`Días para ${milestone.title}`}
                          type="number"
                          min="1"
                          max="90"
                          value={deliveryDays[index]}
                          onChange={(event) => {
                            const next = [...deliveryDays];
                            next[index] = Number(event.target.value);
                            setDeliveryDays(next);
                          }}
                          className="h-8 px-2 text-center"
                        />
                        <span className="text-[11px] text-slate-500">días</span>
                      </label>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Clock3 className="h-3.5 w-3.5 text-indigo-500" />
                        Día {daysUntilDelivery}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <CalendarDays className="h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-semibold text-blue-900">Fecha estimada de finalización</p>
                <p className="mt-1 text-sm font-bold text-blue-700">{formatDate(finalDate)}</p>
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs leading-5 text-slate-600">
              <input
                type="checkbox"
                className="mt-1 rounded"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>Confirmo que revisé el alcance y puedo cumplir el calendario indicado.</span>
            </label>
          </div>

          <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
            <Button variant="outline-neutral" onClick={onClose} disabled={isSubmitting} className="flex-1">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !message.trim() || !acceptedTerms || deliveryDays.some((days) => days < 1)} className="flex-1">
              {isSubmitting ? "Enviando..." : "Enviar respuesta"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
