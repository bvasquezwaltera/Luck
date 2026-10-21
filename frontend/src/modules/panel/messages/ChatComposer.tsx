"use client";

import { useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { DELIVERY_ACCEPT, pickDeliveryFiles } from "@/lib/deliveryFiles";
import { Input } from "@/ui/Input";

export function ChatComposer({ onSend }: { onSend: (text: string, file: File | null) => Promise<boolean> }) {
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = (draft.trim().length > 0 || file !== null) && !sending;

  async function handleSend() {
    if (!canSend) return;
    setSending(true);
    // Si falla, el borrador y el archivo se conservan para reintentar.
    const ok = await onSend(draft.trim(), file);
    setSending(false);
    if (ok) {
      setDraft("");
      setFile(null);
    }
  }

  function handleFile(picked: File | undefined) {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!picked) return;
    // Mismas reglas de formato y tamaño que los archivos de las entregas.
    const { accepted, error } = pickDeliveryFiles([], [picked]);
    setFileError(error);
    if (accepted[0]) setFile(accepted[0]);
  }

  return (
    <div className="border-t border-slate-100 bg-white p-3 sm:p-4">
      {(file || fileError) && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {file && (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-indigo-50 py-1 pl-3 pr-1.5 text-xs font-medium text-indigo-700">
              <Paperclip className="h-3 w-3 shrink-0" />
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                aria-label="Quitar archivo"
                onClick={() => setFile(null)}
                className="rounded-full p-0.5 text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {fileError && <span className="text-xs text-red-500">{fileError}</span>}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={DELIVERY_ACCEPT}
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <button
          type="button"
          aria-label="Adjuntar archivo"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <Input
          label="Mensaje"
          hideLabel
          value={draft}
          maxLength={2000}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && void handleSend()}
          placeholder="Escribe un mensaje..."
          className="min-w-0 flex-1"
        />
        <button
          type="button"
          aria-label="Enviar mensaje"
          onClick={() => void handleSend()}
          disabled={!canSend}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
