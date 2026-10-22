"use client";

import { useState } from "react";
import { FileImage, FileText } from "lucide-react";
import { openAttachment } from "@/lib/api/client/solicitudes";
import type { SolicitudAttachmentInfo } from "@/types/clientSolicitud";

export function SolicitudAttachmentList({
  solicitudId,
  attachments,
  layout = "grid",
}: {
  solicitudId: string;
  attachments: SolicitudAttachmentInfo[];
  layout?: "grid" | "rows";
}) {
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleOpen(attachmentId: string) {
    setOpeningId(attachmentId);
    setError("");
    const result = await openAttachment(solicitudId, attachmentId);
    setOpeningId(null);
    if (result.error) setError(result.error);
  }

  if (attachments.length === 0) return null;

  return (
    <div>
      <ul className={layout === "grid" ? "grid gap-2 sm:grid-cols-2" : "space-y-2"}>
        {attachments.map((attachment) => {
          const Icon = attachment.type === "pdf" ? FileText : FileImage;
          return (
            <li key={attachment.id}>
              <button
                type="button"
                onClick={() => handleOpen(attachment.id)}
                disabled={openingId === attachment.id}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 disabled:opacity-60"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    attachment.type === "pdf" ? "bg-rose-100 text-rose-600" : "bg-violet-100 text-violet-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-700">{attachment.name}</span>
                  <span className="block text-[11px] text-slate-400">{attachment.size}</span>
                </span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  {openingId === attachment.id ? "Abriendo..." : "Ver"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
