"use client";

import { Check, Compass, Inbox, MessageCircle, PartyPopper, Settings, Sparkles, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/ui/Button";
import { Modal } from "@/ui/Modal";

interface WelcomeStep {
  icon: LucideIcon;
  title: string;
  text: string;
}

const FREELANCER_STEPS: WelcomeStep[] = [
  { icon: Settings, title: "Completa tu información", text: "Tu especialidad, tu categoría y una breve presentación." },
  { icon: Sparkles, title: "Agrega tus habilidades", text: "Para que los clientes sepan qué haces." },
  { icon: Tag, title: "Activa un plan", text: "Con un precio, para que puedan contratarte." },
];

const CLIENT_STEPS: WelcomeStep[] = [
  { icon: Compass, title: "Explora freelancers", text: "Busca por categoría y revisa sus perfiles y planes." },
  { icon: Inbox, title: "Elige un plan y envía tu solicitud", text: "El freelancer la acepta y tú pagas para empezar." },
  { icon: MessageCircle, title: "Sigue el avance", text: "Entregas, revisiones y chat, todo en el mismo lugar." },
];

// Aparece una sola vez, cuando la persona entra por primera vez al panel.
export function WelcomeModal({
  role,
  name,
  open,
  onStart,
  onLater,
}: {
  role: "freelancer" | "client";
  name: string;
  open: boolean;
  onStart: () => void; // freelancer: ir a completar el perfil · cliente: ir a explorar freelancers
  onLater: () => void;
}) {
  const isFreelancer = role === "freelancer";
  const steps = isFreelancer ? FREELANCER_STEPS : CLIENT_STEPS;
  const firstName = name.trim().split(/\s+/)[0] ?? "";

  return (
    <Modal open={open} onClose={onLater} size="sm">
      <div className="p-6 sm:p-7">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <PartyPopper className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-slate-900">¡Te damos la bienvenida{firstName ? `, ${firstName}` : ""}!</h2>
        <p className="mt-1.5 text-sm text-slate-600">
          {isFreelancer
            ? "Para que los clientes puedan encontrarte y contratarte, completa tu perfil en 3 pasos:"
            : "Así funciona Luck, en 3 pasos:"}
        </p>

        <ol className="mt-5 space-y-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Icon className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
                  {title}
                </p>
                <p className="text-xs leading-5 text-slate-500">{text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <Button variant="primary" className="w-full min-w-0 sm:flex-1" onClick={onStart}>
            {isFreelancer ? "Completar mi perfil" : "Explorar freelancers"}
          </Button>
          <Button variant="outline-neutral" className="w-full min-w-0 sm:flex-1" onClick={onLater}>
            {isFreelancer ? "Más tarde" : "Entendido"}
          </Button>
        </div>
        {isFreelancer && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
            <Check className="h-3 w-3" /> Puedes retomarlo desde Configuración cuando quieras.
          </p>
        )}
      </div>
    </Modal>
  );
}
