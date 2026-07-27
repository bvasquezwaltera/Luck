"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { Modal } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";
import type { Solicitud } from "@/types/solicitud";

export function RespondSolicitudModal({
  open,
  onClose,
  solicitud,
}: {
  open: boolean;
  onClose: () => void;
  solicitud: Solicitud;
}) {
  const [formData, setFormData] = useState({
    presupuesto: solicitud.presupuesto.toString(),
    tiempoEntrega: solicitud.tiempoEntrega.toString(),
    propuesta: "",
    metodoPago: "transferencia",
    hitos: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      
      // Cerrar después de 2 segundos
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFormData({
          presupuesto: solicitud.presupuesto.toString(),
          tiempoEntrega: solicitud.tiempoEntrega.toString(),
          propuesta: "",
          metodoPago: "transferencia",
          hitos: 1,
        });
      }, 2000);
    }, 1500);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-slate-200 p-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Responder a Solicitud</h2>
          <p className="mt-1 text-sm text-slate-600">{solicitud.titulo}</p>
        </div>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="text-slate-400 transition hover:text-slate-600 disabled:opacity-50"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Send className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">¡Propuesta Enviada!</h3>
          <p className="text-slate-600">
            Tu respuesta ha sido enviada a <strong>{solicitud.clienteName}</strong>. 
            Pronto podrás ver su reacción.
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Información de la Solicitud */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">Cliente</p>
                  <p className="text-sm font-semibold text-slate-900">{solicitud.clienteName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Plan del Cliente</p>
                  <p className="text-sm font-semibold text-slate-900">{solicitud.planName}</p>
                </div>
              </div>
            </div>

            {/* Propuesta (Descripción) */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Tu Propuesta <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Describe cómo harás este proyecto, tu enfoque, metodología y cualquier cosa que creas relevante para que el cliente te contrate..."
                value={formData.propuesta}
                onChange={(e) => setFormData({ ...formData, propuesta: e.target.value })}
                className="min-h-32"
                required
              />
              <p className="mt-1 text-xs text-slate-500">{formData.propuesta.length}/500 caracteres</p>
            </div>

            {/* Presupuesto */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Tu Presupuesto (S/) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 2500"
                  value={formData.presupuesto}
                  onChange={(e) => setFormData({ ...formData, presupuesto: e.target.value })}
                  min="0"
                  step="50"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Presupuesto sugerido: S/ {solicitud.presupuesto}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Días para Entregar <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Ej: 10"
                  value={formData.tiempoEntrega}
                  onChange={(e) => setFormData({ ...formData, tiempoEntrega: e.target.value })}
                  min="1"
                  max="90"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Tiempo sugerido: {solicitud.tiempoEntrega} días
                </p>
              </div>
            </div>

            {/* Método de Pago */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Método de Pago Preferido
              </label>
              <select
                value={formData.metodoPago}
                onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
              >
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="tarjeta">Tarjeta de Crédito</option>
                <option value="billetera">Billetera Digital</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {/* Hitos */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Número de Entregas / Hitos
              </label>
              <select
                value={formData.hitos}
                onChange={(e) => setFormData({ ...formData, hitos: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
              >
                <option value="1">1 entrega</option>
                <option value="2">2 entregas</option>
                <option value="3">3 entregas</option>
                <option value="4">4 entregas</option>
                <option value="5">5 entregas</option>
              </select>
            </div>

            {/* Información importante */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-xs text-blue-700">
                ℹ️ <strong>Recomendación:</strong> Sé claro y específico en tu propuesta. Los clientes responden mejor a freelancers que entienden exactamente lo que necesitan.
              </p>
            </div>

            {/* Términos */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 rounded"
                required
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                Confirmo que leí los detalles de la solicitud y puedo completar este proyecto según lo especificado.
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-6">
            <Button
              variant="outline-neutral"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.propuesta}
              className="flex-1"
            >
              {isSubmitting ? "Enviando..." : "Enviar Propuesta"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
