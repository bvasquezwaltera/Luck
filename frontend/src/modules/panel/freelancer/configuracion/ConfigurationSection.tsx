"use client";

import { CreditCard, FolderKanban, Lock, UserRound } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { ProfileSection } from "@/modules/panel/freelancer/configuracion/perfil/ProfileSection";
import { ProjectsSection } from "@/modules/panel/freelancer/configuracion/proyecto/ProjectsSection";
import { SubscriptionSection } from "@/modules/panel/freelancer/configuracion/suscripcion/SubscriptionSection";
import { UserSection } from "@/modules/panel/freelancer/configuracion/usuario/UserSection";
import { saveFreelancerProfile } from "@/lib/api/client/profile";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Tabs, type TabItem } from "@/ui/Tabs";

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
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  const [activeTab, setActiveTab] = useState<ConfigTab>("perfil");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(draftProfile));
  const isDirty = JSON.stringify(draftProfile) !== savedSnapshot;

  async function handleSave() {
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
      <div className="rounded-2xl bg-white p-2.5 shadow-sm">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pill" />
      </div>

      {activeTab === "perfil" && (
        <>
          <ProfileSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />

          <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <div className="min-w-0 text-xs">
              {saveMessage?.type === "error" ? (
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
      {activeTab === "suscripcion" && <SubscriptionSection freelancerId={draftProfile.id} />}
    </div>
  );
}
