import { CheckCircle2, Gauge, MessagesSquare, RotateCcw } from "lucide-react";
import { DeliveryAttachmentChips } from "@/modules/panel/DeliveryAttachmentChips";
import type { DeliveryModule } from "@/types/deliveryModule";

type ThreadEntry =
  | { kind: "advance"; id: string; time: number; timestamp: string; text: string; progress?: number; attachments: NonNullable<DeliveryModule["advanceHistory"]>[number]["attachments"] }
  | { kind: "review"; id: string; time: number; timestamp: string; text: string; approved: boolean; attachments: NonNullable<DeliveryModule["clientFeedback"]>[number]["attachments"] };

// Avances del freelancer y respuestas del cliente en un solo hilo, del más reciente al más antiguo, para
// que se entienda a qué avance responde cada comentario. Todas las tarjetas tienen el mismo ancho y van
// alineadas; solo el color y la cabecera distinguen quién habla. Igual para los dos roles: cambia quién es "Tú".
export function DeliveryThread({
  module,
  viewer,
}: {
  module: DeliveryModule;
  viewer: "freelancer" | "client";
}) {
  const entries: ThreadEntry[] = [
    ...(module.advanceHistory ?? []).map((advance): ThreadEntry => ({
      kind: "advance",
      id: advance.id,
      time: advance.createdAt ? new Date(advance.createdAt).getTime() : 0,
      timestamp: advance.timestamp,
      text: advance.note,
      progress: advance.progress,
      attachments: advance.attachments,
    })),
    ...(module.clientFeedback ?? []).map((review): ThreadEntry => ({
      kind: "review",
      id: review.id,
      time: review.createdAt ? new Date(review.createdAt).getTime() : 0,
      timestamp: review.timestamp,
      text: review.comment,
      approved: review.type === "approved",
      attachments: review.attachments,
    })),
  ].sort((a, b) => b.time - a.time);

  // El nombre de la otra parte es el de la contraparte del contrato; el propio se muestra como "Tú".
  const freelancerLabel = viewer === "freelancer" ? "Tú" : module.freelancerName;
  const clientLabel = viewer === "client" ? "Tú" : module.clientName;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <MessagesSquare className="h-4 w-4 text-indigo-500" />
        <h4 className="text-sm font-semibold text-slate-900">Conversación de la entrega</h4>
        <span className="ml-auto text-[11px] text-slate-400">Lo más reciente, arriba</span>
      </div>

      {entries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Aún no hay actividad en esta entrega. Aquí verás los avances y las respuestas, en orden.
        </p>
      ) : (
        <ol className="mt-4 space-y-3">
          {entries.map((entry) =>
            entry.kind === "advance" ? (
              <li key={entry.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                  <span className="font-semibold text-indigo-700">{freelancerLabel}</span>
                  <span className="text-slate-400">Freelancer · {entry.timestamp}</span>
                  {entry.progress !== undefined && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-medium text-indigo-600">
                      <Gauge className="h-3 w-3" />
                      {entry.progress}%
                    </span>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{entry.text}</p>
                <DeliveryAttachmentChips deliveryId={module.id} attachments={entry.attachments} />
              </li>
            ) : (
              <li
                key={entry.id}
                className={`rounded-2xl border p-3 ${
                  entry.approved ? "border-emerald-100 bg-emerald-50/60" : "border-amber-100 bg-amber-50/60"
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                  <span className={`font-semibold ${entry.approved ? "text-emerald-700" : "text-amber-700"}`}>
                    {clientLabel}
                  </span>
                  <span className="text-slate-400">Cliente · {entry.timestamp}</span>
                  <span
                    className={`ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-medium ${
                      entry.approved ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {entry.approved ? <CheckCircle2 className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                    {entry.approved ? "Entrega aprobada" : "Cambios solicitados"}
                  </span>
                </div>
                {entry.text && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{entry.text}</p>
                )}
                <DeliveryAttachmentChips deliveryId={module.id} attachments={entry.attachments} />
              </li>
            ),
          )}
        </ol>
      )}
    </div>
  );
}
