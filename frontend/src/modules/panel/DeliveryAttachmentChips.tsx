"use client";

import { useState } from "react";
import { FileText, Link as LinkIcon } from "lucide-react";
import { openDeliveryAttachment } from "@/lib/api/client/deliveries";
import type { DeliveryAttachment } from "@/types/deliveryModule";

// Archivos y enlaces de un avance o de una respuesta. Los enlaces se abren directo; los archivos, con un
// enlace temporal que pide el servidor (solo el cliente y el freelancer del contrato pueden obtenerlo).
export function DeliveryAttachmentChips({
  deliveryId,
  attachments,
}: {
  deliveryId: string;
  attachments: DeliveryAttachment[];
}) {
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (attachments.length === 0) return null;

  async function handleOpen(attachment: DeliveryAttachment) {
    if (attachment.url) {
      window.open(attachment.url, "_blank", "noopener,noreferrer");
      return;
    }
    setOpeningId(attachment.id);
    setError("");
    const result = await openDeliveryAttachment(deliveryId, attachment.id);
    setOpeningId(null);
    if (result.error) setError(result.error);
  }

  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <button
            type="button"
            key={attachment.id}
            onClick={() => handleOpen(attachment)}
            disabled={openingId === attachment.id}
            title={attachment.url ? "Abrir enlace" : "Abrir archivo"}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-60"
          >
            {attachment.url ? <LinkIcon className="h-3 w-3 shrink-0" /> : <FileText className="h-3 w-3 shrink-0" />}
            <span className="truncate">{openingId === attachment.id ? "Abriendo..." : attachment.name}</span>
            {attachment.size && <span className="shrink-0 text-slate-400">{attachment.size}</span>}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
