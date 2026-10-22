"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { DeliveryAttachmentPicker } from "@/modules/panel/DeliveryAttachmentPicker";
import { EMPTY_ATTACHMENTS, resolveAttachments, type PickedAttachments } from "@/lib/deliveryFiles";
import { addAdvance } from "@/lib/api/client/deliveries";
import type { ContractDeliveries } from "@/types/deliveryApi";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Textarea";

// El freelancer sube un avance (nota + archivos o enlaces) y la entrega pasa a revisión del cliente.
// Solo se puede cuando la entrega está pendiente o el cliente pidió cambios.
export function DeliveryFreelancerAdvance({
  module,
  onChanged,
}: {
  module: DeliveryModule;
  onChanged: (contracts: ContractDeliveries[]) => void;
}) {
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState(Math.max(module.progress, 50));
  const [attachments, setAttachments] = useState<PickedAttachments>(EMPTY_ATTACHMENTS);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const canSubmit = module.apiStatus === "pendiente" || module.apiStatus === "cambios_solicitados";

  async function handleSubmit() {
    if (!note.trim() || isSending) return;
    const resolved = resolveAttachments(attachments);
    if (resolved.error !== undefined) {
      setSendError(resolved.error);
      return;
    }
    setIsSending(true);
    setSendError("");
    const result = await addAdvance(module.id, { note: note.trim(), progress, files: resolved.files, links: resolved.links });
    setIsSending(false);

    if (!result.contracts) {
      setSendError(result.error ?? "No se pudo enviar el avance.");
      return;
    }
    setNote("");
    setAttachments(EMPTY_ATTACHMENTS);
    onChanged(result.contracts);
  }

  if (!canSubmit) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <UploadCloud className="h-4 w-4 text-indigo-500" />
        <h4 className="text-sm font-semibold text-slate-900">Registrar avance o entrega</h4>
      </div>

      {(
        <>
          <Textarea
            label="Describe el avance"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ejemplo: subí el prototipo inicial, ajusté los colores y preparé la primera revisión para el cliente."
            rows={5}
            maxLength={2000}
            className="mt-4"
          />

          <div className="mt-4">
            <label htmlFor="advance-progress" className="text-xs font-semibold text-slate-700">
              Progreso de la entrega: {progress}%
            </label>
            <input
              id="advance-progress"
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(event) => setProgress(Number(event.target.value))}
              className="mt-2 w-full accent-indigo-600"
            />
          </div>

          <div className="mt-4">
            <DeliveryAttachmentPicker value={attachments} onChange={setAttachments} />
          </div>

          {sendError && <p className="mt-3 text-xs text-red-500">{sendError}</p>}

          <Button
            type="button"
            variant="primary"
            className="mt-4 w-full"
            onClick={handleSubmit}
            disabled={!note.trim() || isSending}
          >
            {isSending ? "Enviando..." : "Enviar avance al cliente"}
          </Button>
        </>
      )}

    </div>
  );
}
