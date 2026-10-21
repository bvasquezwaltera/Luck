"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FileText, Link as LinkIcon, Paperclip, Trash2 } from "lucide-react";
import {
  DELIVERY_ACCEPT,
  DELIVERY_MAX_FILES,
  DELIVERY_MAX_LINKS,
  pickDeliveryFiles,
  validateLink,
  type PickedAttachments,
} from "@/lib/deliveryFiles";
import { formatFileSize } from "@/lib/solicitudAttachments";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";

// Selector de archivos y enlaces de un envío (avance del freelancer o respuesta del cliente).
// Valida con los mismos límites que el servidor, que los vuelve a comprobar.
export function DeliveryAttachmentPicker({
  value,
  onChange,
}: {
  value: PickedAttachments;
  onChange: (next: PickedAttachments) => void;
}) {
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function handleFilesChosen(event: ChangeEvent<HTMLInputElement>) {
    const { accepted, error: problem } = pickDeliveryFiles(value.files, Array.from(event.target.files ?? []));
    onChange({ ...value, files: accepted });
    setError(problem);
    event.target.value = "";
  }

  function handleAddLink() {
    const problem = validateLink(value.pendingLink);
    if (problem) {
      setError(problem);
      return;
    }
    if (value.links.length >= DELIVERY_MAX_LINKS) {
      setError(`Puedes agregar hasta ${DELIVERY_MAX_LINKS} enlaces por envío.`);
      return;
    }
    onChange({ ...value, links: [...value.links, value.pendingLink.trim()], pendingLink: "" });
    setError("");
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-700">Adjuntar archivos o enlaces</p>

      {(value.files.length > 0 || value.links.length > 0) && (
        <div className="space-y-2">
          {value.files.map((file, index) => (
            <div key={`${file.name}-${file.size}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <FileText className="h-4 w-4" />
              </div>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-slate-700">{file.name}</span>
                <span className="mt-0.5 block text-[11px] text-slate-400">{formatFileSize(file.size)}</span>
              </span>
              <button
                type="button"
                aria-label={`Quitar ${file.name}`}
                onClick={() => onChange({ ...value, files: value.files.filter((_, position) => position !== index) })}
                className="shrink-0 rounded-lg border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {value.links.map((link, index) => (
            <div key={link} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <LinkIcon className="h-4 w-4" />
              </div>
              <span className="block min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{link}</span>
              <button
                type="button"
                aria-label={`Quitar ${link}`}
                onClick={() => onChange({ ...value, links: value.links.filter((_, position) => position !== index) })}
                className="shrink-0 rounded-lg border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={DELIVERY_ACCEPT}
          className="hidden"
          onChange={handleFilesChosen}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={value.files.length >= DELIVERY_MAX_FILES}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Paperclip className="h-3.5 w-3.5" />
          Subir archivo
        </button>
        <div className="flex flex-1 items-center gap-2">
          <Input
            label="Agregar enlace"
            hideLabel
            className="flex-1"
            placeholder="Pega un enlace (Figma, Drive, GitHub...)"
            value={value.pendingLink}
            onChange={(event) => onChange({ ...value, pendingLink: event.target.value })}
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
      {value.pendingLink.trim() && (
        <p className="text-[11px] text-indigo-600">
          Este enlace se incluirá al enviar. Pulsa «Agregar» si quieres sumar otro.
        </p>
      )}
      <p className="text-[11px] text-slate-400">
        PDF, imágenes, ZIP, Office, TXT, CSV o MD. Hasta {DELIVERY_MAX_FILES} archivos de 25 MB y {DELIVERY_MAX_LINKS}{" "}
        enlaces por envío.
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
