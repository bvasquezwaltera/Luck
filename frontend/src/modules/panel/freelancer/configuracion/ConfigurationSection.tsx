"use client";

import { CreditCard, Settings, FolderKanban, Lock, UserRound } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { OnboardingGuide } from "@/modules/panel/freelancer/configuracion/OnboardingGuide";
import type { OnboardingStep } from "@/lib/onboardingSteps";
import { ProfileErrorsProvider } from "@/modules/panel/profileErrors";
import { ProfileSection } from "@/modules/panel/freelancer/configuracion/perfil/ProfileSection";
import { ProjectsSection } from "@/modules/panel/freelancer/configuracion/proyecto/ProjectsSection";
import { SubscriptionSection } from "@/modules/panel/freelancer/configuracion/suscripcion/SubscriptionSection";
import { UserSection } from "@/modules/panel/freelancer/configuracion/usuario/UserSection";
import { saveFreelancerProfile } from "@/lib/api/client/profile";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Tabs, type TabItem } from "@/ui/Tabs";
import { validateFreelancerProfile } from "@/validators/profileValidation";

// Lleva la vista al primer campo con error, una vez que la pantalla ya lo dibujó.
function scrollToFirstError() {
  requestAnimationFrame(() => {
    document.querySelector("[data-field-error], p.text-red-500")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}


type ConfigTab = "perfil" | "usuario" | "proyectos" | "suscripcion";

const tabs: TabItem<ConfigTab>[] = [
  { id: "perfil", label: "Perfil", icon: UserRound },
  { id: "usuario", label: "Usuario", icon: Lock },
  { id: "proyectos", label: "Proyectos", icon: FolderKanban },
  { id: "suscripcion", label: "Suscripción", icon: CreditCard },
];

export function ConfigurationSection({
  draftProfile,
  setDraftProfile,
  guide,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
  // Con valor, se muestran los pasos para empezar a recibir solicitudes (la guía de bienvenida sigue abierta).
  guide?: { onFinish: () => void };
}) {
  const [activeTab, setActiveTab] = useState<ConfigTab>("perfil");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(draftProfile));
  const isDirty = JSON.stringify(draftProfile) !== savedSnapshot;
  // Lo último guardado: los pasos de la guía se marcan al guardar, no mientras se escribe.
  const savedProfile = useMemo(() => JSON.parse(savedSnapshot) as FreelancerProfile, [savedSnapshot]);

  // Hasta el primer intento de guardar no se marca nada; después los errores se actualizan mientras se corrige.
  const [showErrors, setShowErrors] = useState(false);
  const errors = showErrors ? validateFreelancerProfile(draftProfile) : {};
  const errorCount = Object.keys(errors).length;

  // "Ir" de la guía: abre la pestaña del paso, lleva la vista hasta ese bloque y deja el cursor en lo que falta llenar.
  function goToStep(step: OnboardingStep) {
    setActiveTab(step.tab);
    // La pestaña se dibuja en el siguiente ciclo: el bloque de destino todavía no existe en este.
    setTimeout(() => {
      const target = document.getElementById(`onboarding-${step.id}`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });

      const empty = (element: Element | null) => element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement ? !element.value : false;
      const field =
        step.id === "info"
          ? ["Especialidad", "Categoría", "Sobre mí"].map((id) => document.getElementById(id)).find(empty)
          : step.id === "skills"
            ? ([...(target?.querySelectorAll("input") ?? [])].find(empty) ??
              [...(target?.querySelectorAll("button") ?? [])].find((button) => button.textContent?.trim().startsWith("Agregar")))
            : null;
      (field as HTMLElement | null | undefined)?.focus({ preventScroll: true });
    }, 80);
  }

  async function handleSave() {
    setShowErrors(true);
    if (Object.keys(validateFreelancerProfile(draftProfile)).length > 0) {
      setSaveMessage(null);
      scrollToFirstError();
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    const snapshot = JSON.stringify(draftProfile);
    const result = await saveFreelancerProfile(draftProfile.id, draftProfile);

    setIsSaving(false);
    if (!result.error) setSavedSnapshot(snapshot);
    setSaveMessage(
      result.error
        ? { type: "error", text: result.error }
        : { type: "success", text: "Cambios guardados." },
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <PanelSectionHeader icon={Settings} subtitle="Administra tu perfil, tu cuenta, tus proyectos y tu suscripción." title="Configuración" />
      </div>

      {guide && (
        <OnboardingGuide
          freelancerId={draftProfile.id}
          savedProfile={savedProfile}
          refreshKey={activeTab}
          onGo={goToStep}
          onFinish={guide.onFinish}
        />
      )}

      <div className="rounded-2xl bg-white p-2.5 shadow-sm">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pill" />
      </div>

      {activeTab === "perfil" && (
        <>
          <ProfileErrorsProvider errors={errors}>
            <ProfileSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />
          </ProfileErrorsProvider>

          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <div className="min-w-0 text-xs">
              {errorCount > 0 ? (
                <p className="text-red-500">
                  {errorCount === 1 ? "Corrige 1 campo para poder guardar." : `Corrige ${errorCount} campos para poder guardar.`}
                </p>
              ) : saveMessage?.type === "error" ? (
                <p className="text-red-500">{saveMessage.text}</p>
              ) : isDirty ? (
                <p className="flex items-center gap-2 text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Tienes cambios sin guardar
                </p>
              ) : saveMessage ? (
                <p className="text-emerald-600">{saveMessage.text}</p>
              ) : (
                <p className="text-slate-400">Todo guardado</p>
              )}
            </div>
            <Button
              variant="primary"
              className="!min-w-0 shrink-0 !px-6 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </>
      )}
      {activeTab === "usuario" && <UserSection email={draftProfile.email} />}
      {activeTab === "proyectos" && <ProjectsSection freelancerId={draftProfile.id} />}
      {activeTab === "suscripcion" && (
        <div id="onboarding-plan" className="scroll-mt-4">
          <SubscriptionSection freelancerId={draftProfile.id} />
        </div>
      )}
    </div>
  );
}
