"use client";

import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Paperclip,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type { DeliveryAttachment } from "@/types/deliveryModule";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";

interface FeedbackEntry {
  id: string;
  type: "approved" | "changes-requested";
  comment: string;
  attachments: DeliveryAttachment[];
  timestamp: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimestamp() {
  const now = new Date();
  const date = now.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${date}, ${time}`;
}

export function DeliveryClientFeedback({ moduleTitle }: { moduleTitle: string }) {
  const [comment, setComment] = useState("");
  const [attachments, setAttachments] = useState<DeliveryAttachment[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [history, setHistory] = useState<FeedbackEntry[]>([]);

  function handleFileUpload(files: FileList | null) {
    if (!files) return;
    const newAttachments = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: formatFileSize(file.size),
    }));
    setAttachments((current) => [...current, ...newAttachments]);
  }

  function handleAddLink() {
    const url = linkInput.trim();
    if (!url) return;
    setAttachments((current) => [...current, { id: crypto.randomUUID(), name: url, url }]);
    setLinkInput("");
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  }

  function submitFeedback(type: FeedbackEntry["type"]) {
    if (type === "changes-requested" && !comment.trim()) return;
    setHistory((current) => [
      { id: crypto.randomUUID(), type, comment: comment.trim(), attachments, timestamp: formatTimestamp() },
      ...current,
    ]);
    setComment("");
    setAttachments([]);
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-indigo-500" />
        <h4 className="text-sm font-semibold text-slate-900">Tu respuesta</h4>
      </div>

      <Textarea
        label="Deja un comentario"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={`Ejemplo: me gusta el resultado de "${moduleTitle}", pero pediría ajustar el color del botón principal.`}
        rows={4}
        className="mt-4"
      />

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-slate-700">Adjuntar archivos o enlaces</p>

        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  {attachment.url ? <LinkIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-slate-700">{attachment.name}</span>
                  {attachment.size && (
                    <span className="mt-0.5 block text-[11px] text-slate-400">{attachment.size}</span>
                  )}
                </span>
                <button
                  type="button"
                  aria-label={`Quitar ${attachment.name}`}
                  onClick={() => removeAttachment(attachment.id)}
                  className="shrink-0 rounded-lg border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
            <Paperclip className="h-3.5 w-3.5" />
            Subir archivo
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                handleFileUpload(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          <div className="flex flex-1 items-center gap-2">
            <Input
              label="Agregar enlace"
              hideLabel
              className="flex-1"
              placeholder="Pega un enlace..."
              value={linkInput}
              onChange={(event) => setLinkInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddLink();
                }
              }}
            />
            <Button type="button" variant="outline-neutral" className="!min-w-0 !px-3" onClick={handleAddLink}>
              Agregar
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline-neutral"
          className="flex flex-1 items-center justify-center gap-2"
          onClick={() => submitFeedback("changes-requested")}
          disabled={!comment.trim()}
        >
          <RotateCcw className="h-4 w-4" />
          Solicitar cambios
        </Button>
        <Button
          type="button"
          variant="primary"
          className="flex flex-1 items-center justify-center gap-2"
          onClick={() => submitFeedback("approved")}
        >
          <CheckCircle2 className="h-4 w-4" />
          Aprobar entrega
        </Button>
      </div>

      {history.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Historial de respuestas</p>
          {history.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  className={
                    entry.type === "approved"
                      ? "!bg-emerald-50 !text-emerald-600 inline-flex items-center gap-1.5"
                      : "!bg-amber-50 !text-amber-600 inline-flex items-center gap-1.5"
                  }
                >
                  {entry.type === "approved" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <RotateCcw className="h-3 w-3" />
                  )}
                  {entry.type === "approved" ? "Entrega aprobada" : "Cambios solicitados"}
                </Badge>
                <span className="text-[11px] text-slate-400">{entry.timestamp}</span>
              </div>
              {entry.comment && <p className="mt-2 text-sm leading-6 text-slate-700">{entry.comment}</p>}
              {entry.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {entry.attachments.map((attachment) => (
                    <span
                      key={attachment.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600"
                    >
                      {attachment.url ? <LinkIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                      {attachment.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
