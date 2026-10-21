"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { createDelivery } from "@/lib/api/client/deliveries";
import type { ContractDeliveries } from "@/types/deliveryApi";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Modal } from "@/ui/Modal";
import { Textarea } from "@/ui/Textarea";

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// El freelancer planifica el trabajo: cada entrega tiene su descripción, sus objetivos y su fecha límite.
export function NewDeliveryModal({
  open,
  contractId,
  projectTitle,
  onClose,
  onCreated,
}: {
  open: boolean;
  contractId: string;
  projectTitle: string;
  onClose: () => void;
  onCreated: (contracts: ContractDeliveries[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [objectives, setObjectives] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string; dueDate?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function reset() {
    setTitle("");
    setDescription("");
    setDueDate("");
    setObjectives("");
    setErrors({});
    setSaveError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSaving) return;

    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = "Escribe el nombre de la entrega.";
    if (!description.trim()) nextErrors.description = "Describe qué vas a entregar.";
    if (!dueDate) nextErrors.dueDate = "Elige la fecha límite.";
    else if (dueDate < todayIso()) nextErrors.dueDate = "La fecha no puede estar en el pasado.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    setSaveError("");
    const result = await createDelivery(contractId, {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      objectives: objectives.split("\n").map((item) => item.trim()).filter(Boolean),
    });
    setIsSaving(false);

    if (!result.contracts) {
      setSaveError(result.error ?? "No se pudo crear la entrega.");
      return;
    }
    onCreated(result.contracts);
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Nueva entrega</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">Planifica una entrega</h3>
            <p className="mt-1 truncate text-xs text-slate-500">{projectTitle}</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={handleClose}
            className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <Input
            label="Nombre de la entrega"
            required
            placeholder="Ej.: Diseño de la interfaz"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            error={errors.title}
          />
          <Textarea
            label="Descripción"
            required
            rows={4}
            placeholder="Qué vas a entregar y qué debe esperar el cliente."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            error={errors.description}
          />
          <Textarea
            label="Objetivos (opcional)"
            rows={3}
            placeholder={"Uno por línea. Ej.:\nDefinir estructura visual\nPreparar versión móvil"}
            value={objectives}
            onChange={(event) => setObjectives(event.target.value)}
          />
          <Input
            label="Fecha límite"
            required
            type="date"
            min={todayIso()}
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            error={errors.dueDate}
          />
          {saveError && <p className="text-xs text-red-500">{saveError}</p>}
        </div>

        <div className="sticky bottom-0 z-10 flex gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
          <Button variant="outline-neutral" onClick={handleClose} disabled={isSaving} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving} className="flex-1">
            {isSaving ? "Creando..." : "Crear entrega"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
