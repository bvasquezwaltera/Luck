"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Info } from "lucide-react";
import { signOut } from "@/lib/api/client/auth";
import { createSolicitud } from "@/lib/api/client/solicitudes";
import { withNext } from "@/lib/safeNext";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { Drawer } from "@/ui/Drawer";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";

export type ViewerRole = "client" | "freelancer" | null;

export function RequestPlanDrawer({
  plan,
  freelancer,
  viewerRole,
  onClose,
}: {
  plan: SubscriptionPlan | null;
  freelancer: FreelancerProfile;
  viewerRole: ViewerRole;
  onClose: () => void;
}) {
  const router = useRouter();
  const [sent, setSent] = useState(false);

  function handleClose() {
    setSent(false);
    onClose();
  }

  return (
    <Drawer open={plan !== null} onClose={handleClose} title={sent ? "Solicitud enviada" : "Solicitar plan"}>
      {plan && sent && (
        <SentConfirmation plan={plan} freelancerName={freelancer.name} onClose={handleClose} />
      )}
      {plan && !sent && (
        <div className="flex flex-col gap-5">
          <FreelancerSummary freelancer={freelancer} />
          <PlanSummary plan={plan} />

          {viewerRole === "client" && (
            <RequestForm
              freelancerId={freelancer.id}
              planId={plan.id}
              category={freelancer.category}
              onSent={() => setSent(true)}
            />
          )}
          {viewerRole === "freelancer" && (
            <div className="flex flex-col gap-3">
              <Notice>
                Estás con una cuenta de freelancer. Solo las cuentas de cliente pueden contratar un plan.
              </Notice>
              <Button
                variant="outline-neutral"
                className="w-full min-w-0"
                // Cierra la sesión y recarga esta misma página: el panel sigue abierto y,
                // al no haber sesión, pasa a mostrar "Iniciar sesión".
                onClick={() => signOut().then(() => router.refresh())}
              >
                Cerrar sesión
              </Button>
            </div>
          )}
          {viewerRole === null && (
            <div className="flex flex-col gap-3">
              <Notice>Inicia sesión como cliente para solicitar este plan.</Notice>
              <Button
                href={withNext("/login", `/perfil/${freelancer.id}?plan=${plan.id}`)}
                className="w-full min-w-0"
              >
                Iniciar sesión
              </Button>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

function SentConfirmation({
  plan,
  freelancerName,
  onClose,
}: {
  plan: SubscriptionPlan;
  freelancerName: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <CheckCircle2 className="h-12 w-12 text-emerald-500" />
      <p className="text-base font-bold text-gray-900">Solicitud enviada</p>
      <p className="text-xs text-gray-500">
        Plan {plan.name} (${plan.price}/mes) con {freelancerName}.
      </p>
      <p className="text-xs text-gray-500">
        El freelancer la revisará. Podrás ver su respuesta en la sección Solicitudes de tu panel.
      </p>
      <div className="mt-3 flex w-full flex-col gap-2">
        <Button href="/panel/cliente" className="w-full min-w-0">
          Ir a mi panel
        </Button>
        <Button variant="outline-neutral" className="w-full min-w-0" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}

function FreelancerSummary({ freelancer }: { freelancer: FreelancerProfile }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar initials={freelancer.initials} name={freelancer.name} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-gray-900">{freelancer.name}</p>
        <p className="truncate text-xs text-gray-500">
          {[freelancer.specialty, freelancer.country].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}

function PlanSummary({ plan }: { plan: SubscriptionPlan }) {
  const features = [
    plan.activeProjects,
    plan.revisions,
    ...plan.features.map((feature) => `${feature.label}: ${feature.value}`),
  ];

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-bold text-gray-900">Plan {plan.name}</p>
        <p className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-gray-900">${plan.price}</span>
          <span className="text-xs text-gray-500">/mes</span>
        </p>
      </div>
      {plan.description && <p className="mt-1 text-xs text-gray-500">{plan.description}</p>}
      <ul className="mt-3 flex flex-col">
        {features.map((feature, index) => (
          <li key={index} className="border-t border-gray-100 py-2 text-xs text-gray-600">
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Notice({ children }: { children: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function RequestForm({
  freelancerId,
  planId,
  category,
  onSent,
}: {
  freelancerId: string;
  planId: string;
  category: string;
  onSent: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSending) return;

    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = "Escribe un título para tu proyecto.";
    if (!description.trim()) nextErrors.description = "Describe lo que necesitas.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSending(true);
    setSendError("");

    const result = await createSolicitud({
      freelancerId,
      planId,
      title: title.trim(),
      description: description.trim(),
      desiredDate,
    });

    setIsSending(false);
    if (result.error) {
      setSendError(result.error);
      return;
    }
    onSent();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Título del proyecto"
        required
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={errors.title}
      />
      <Textarea
        label="Descripción"
        required
        rows={4}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={errors.description}
      />
      {category && (
        <Input
          label="Categoría"
          value={category}
          readOnly
          className="[&_input]:bg-gray-50 [&_input]:text-gray-600"
        />
      )}
      <Input
        label="Fecha deseada (opcional)"
        type="date"
        value={desiredDate}
        onChange={(event) => setDesiredDate(event.target.value)}
      />

      <Notice>
        No pagas ahora. El freelancer revisa tu solicitud y, si la acepta, te avisamos para que
        pagues y se active el contrato.
      </Notice>

      {sendError && <p className="text-xs text-red-500">{sendError}</p>}

      <Button type="submit" className="w-full min-w-0 py-2.5" disabled={isSending}>
        {isSending ? "Enviando..." : "Enviar solicitud"}
      </Button>
    </form>
  );
}
