"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, Clock3, FileText, Link as LinkIcon, Paperclip, RotateCcw, Trash2, UploadCloud } from "lucide-react";
import { DeliveryAttachmentChips } from "@/modules/panel/DeliveryAttachmentChips";
import { addAdvance } from "@/lib/api/client/deliveries";
import {
  DELIVERY_ACCEPT,
  DELIVERY_MAX_FILES,
  DELIVERY_MAX_LINKS,
  pickDeliveryFiles,
  validateLink,
} from "@/lib/deliveryFiles";
import { formatFileSize } from "@/lib/solicitudAttachments";
import type { ContractDeliveries } from "@/types/deliveryApi";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
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
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [attachError, setAttachError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const history = module.advanceHistory ?? [];
  const canSubmit = module.apiStatus === "pendiente" || module.apiStatus === "cambios_solicitados";

  function handleFilesChosen(event: ChangeEvent<HTMLInputElement>) {
    const { accepted, error } = pickDeliveryFiles(files, Array.from(event.target.files ?? []));
    setFiles(accepted);
    setAttachError(error);
    event.target.value = "";
  }

  function handleAddLink() {
    const problem = validateLink(linkInput);
    if (problem) {
      setAttachError(problem);
      return;
    }
    if (links.length >= DELIVERY_MAX_LINKS) {
      setAttachError(`Puedes agregar hasta ${DELIVERY_MAX_LINKS} enlaces por envío.`);
      return;
    }
    setLinks((current) => [...current, linkInput.trim()]);
    setLinkInput("");
    setAttachError("");
  }

  async function handleSubmit() {
    if (!note.trim() || isSending) return;
    setIsSending(true);
    setSendError("");
    const result = await addAdvance(module.id, { note: note.trim(), progress, files, links });
    setIsSending(false);

    if (!result.contracts) {
      setSendError(result.error ?? "No se pudo enviar el avance.");
      return;
    }
    setNote("");
    setFiles([]);
    setLinks([]);
    setAttachError("");
    onChanged(result.contracts);
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <UploadCloud className="h-4 w-4 text-indigo-500" />
        <h4 className="text-sm font-semibold text-slate-900">Registrar avance o entrega</h4>
      </div>

      {module.apiStatus === "en_revision" && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-blue-50 p-4">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Esperando la respuesta del cliente</p>
            <p className="mt-0.5 text-xs leading-5 text-blue-700">
              Ya enviaste este avance. Podrás subir otro si el cliente pide cambios.
            </p>
          </div>
        </div>
      )}

      {module.apiStatus === "aprobada" && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-900">Entrega aprobada</p>
            <p className="mt-0.5 text-xs leading-5 text-emerald-700">El cliente aprobó esta entrega. ¡Buen trabajo!</p>
          </div>
        </div>
      )}

      {module.apiStatus === "cambios_solicitados" && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 p-4">
          <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">El cliente pidió cambios</p>
            <p className="mt-0.5 text-xs leading-5 text-amber-700">
              Revisa su respuesta más abajo y sube un nuevo avance con los ajustes.
            </p>
          </div>
        </div>
      )}

      {canSubmit && (
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

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Adjuntar archivos o enlaces</p>

            {(files.length > 0 || links.length > 0) && (
              <div className="space-y-2">
                {files.map((file, index) => (
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
                      onClick={() => setFiles((current) => current.filter((_, position) => position !== index))}
                      className="shrink-0 rounded-lg border border-red-200 p-1.5 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {links.map((link, index) => (
                  <div key={link} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <span className="block min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{link}</span>
                    <button
                      type="button"
                      aria-label={`Quitar ${link}`}
                      onClick={() => setLinks((current) => current.filter((_, position) => position !== index))}
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
                disabled={files.length >= DELIVERY_MAX_FILES}
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
            <p className="text-[11px] text-slate-400">
              PDF, imágenes, ZIP, Office, TXT, CSV o MD. Hasta {DELIVERY_MAX_FILES} archivos de 25 MB y{" "}
              {DELIVERY_MAX_LINKS} enlaces por envío.
            </p>
            {attachError && <p className="text-xs text-red-500">{attachError}</p>}
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

      {history.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Historial de avances</p>
          {history.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <span className="text-[11px] text-slate-400">{entry.timestamp}</span>
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{entry.note}</p>
              <DeliveryAttachmentChips deliveryId={module.id} attachments={entry.attachments} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
