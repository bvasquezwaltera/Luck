"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquare, RotateCcw } from "lucide-react";
import { DeliveryAttachmentPicker } from "@/modules/panel/DeliveryAttachmentPicker";
import { EMPTY_ATTACHMENTS, resolveAttachments, type PickedAttachments } from "@/lib/deliveryFiles";
import { addReview } from "@/lib/api/client/deliveries";
import type { ContractDeliveries } from "@/types/deliveryApi";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Textarea } from "@/ui/Textarea";

// El cliente responde al avance del freelancer: aprueba o pide cambios. Pedir cambios consume una de las
// revisiones del plan (las cuenta el servidor entre todas las entregas del contrato); aprobar siempre se puede.
export function DeliveryClientFeedback({
  module,
  revisionsLimit,
  revisionsUsed,
  onChanged,
}: {
  module: DeliveryModule;
  revisionsLimit: number | null;
  revisionsUsed: number;
  onChanged: (contracts: ContractDeliveries[]) => void;
}) {
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState<PickedAttachments>(EMPTY_ATTACHMENTS);
  // Qué respuesta se está enviando: solo ese botón muestra "Enviando..."; el otro queda deshabilitado.
  const [sending, setSending] = useState<"aprobado" | "cambios" | null>(null);
  const [sendError, setSendError] = useState("");

  const canRespond = module.apiStatus === "en_revision";
  const revisionsLeft = revisionsLimit === null ? null : Math.max(0, revisionsLimit - revisionsUsed);
  const canRequestChanges = revisionsLeft === null || revisionsLeft > 0;

  async function submit(type: "aprobado" | "cambios") {
    if (sending) return;
    if (type === "cambios" && !comment.trim()) {
      setSendError("Cuéntale al freelancer qué cambios necesitas.");
      return;
    }
    const resolved = resolveAttachments(attachments);
    if (resolved.error !== undefined) {
      setSendError(resolved.error);
      return;
    }
    setSending(type);
    setSendError("");
    const result = await addReview(module.id, { type, comment: comment.trim(), files: resolved.files, links: resolved.links });
    setSending(null);

    if (!result.contracts) {
      setSendError(result.error ?? "No se pudo enviar tu respuesta.");
      return;
    }
    setComment("");
    setAttachments(EMPTY_ATTACHMENTS);
    onChanged(result.contracts);
  }

  if (!canRespond) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <MessageSquare className="h-4 w-4 text-indigo-500" />
        <h4 className="text-sm font-semibold text-slate-900">Tu respuesta</h4>
        <Badge className="ml-auto !bg-slate-100 !text-slate-600">
          {revisionsLeft === null
            ? "Revisiones: sin límite"
            : `Te ${revisionsLeft === 1 ? "queda" : "quedan"} ${revisionsLeft} de ${revisionsLimit} ${revisionsLimit === 1 ? "revisión" : "revisiones"}`}
        </Badge>
      </div>

      {(
        <>
          <Textarea
            label="Deja un comentario"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={`Ejemplo: me gusta el resultado de "${module.title}", pero pediría ajustar el color del botón principal.`}
            rows={4}
            maxLength={2000}
            className="mt-4"
          />

          <div className="mt-4">
            <DeliveryAttachmentPicker value={attachments} onChange={setAttachments} />
          </div>

          {!canRequestChanges && (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Ya usaste {revisionsLimit === 1 ? "la revisión" : `las ${revisionsLimit} revisiones`} de tu plan. Solo puedes
              aprobar esta entrega.
            </p>
          )}
          {sendError && <p className="mt-3 text-xs text-red-500">{sendError}</p>}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline-neutral"
              className="flex flex-1 items-center justify-center gap-2"
              onClick={() => submit("cambios")}
              disabled={!comment.trim() || !canRequestChanges || sending !== null}
              title={canRequestChanges ? undefined : "Ya usaste las revisiones de tu plan"}
            >
              <RotateCcw className="h-4 w-4" />
              {sending === "cambios" ? "Enviando..." : "Solicitar cambios"}
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex flex-1 items-center justify-center gap-2"
              onClick={() => submit("aprobado")}
              disabled={sending !== null}
            >
              <CheckCircle2 className="h-4 w-4" />
              {sending === "aprobado" ? "Enviando..." : "Aprobar entrega"}
            </Button>
          </div>
        </>
      )}

    </div>
  );
}
