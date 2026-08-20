"use client";

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
  { id: "perfil", label: "Perfil" },
  { id: "usuario", label: "Usuario" },
  { id: "proyectos", label: "Proyectos" },
  { id: "suscripcion", label: "Suscripción" },
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

  async function handleSave() {
    setIsSaving(true);
    setSaveMessage(null);

    const result = await saveFreelancerProfile(draftProfile.id, draftProfile);

    setIsSaving(false);
    setSaveMessage(
      result.error
        ? { type: "error", text: result.error }
        : { type: "success", text: "Cambios guardados." },
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "perfil" && (
        <>
          <ProfileSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />

          <div className="flex items-center justify-end gap-3">
            {saveMessage && (
              <p className={`text-xs ${saveMessage.type === "error" ? "text-red-500" : "text-emerald-600"}`}>
                {saveMessage.text}
              </p>
            )}
            <Button
              variant="primary"
              className="!min-w-0 !px-6 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </>
      )}
      {activeTab === "usuario" && <UserSection />}
      {activeTab === "proyectos" && <ProjectsSection freelancerId={draftProfile.id} />}
      {activeTab === "suscripcion" && <SubscriptionSection freelancerId={draftProfile.id} />}
    </div>
  );
}
