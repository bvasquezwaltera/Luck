"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { ProfileSection } from "@/modules/panel/client/configuracion/perfil/ProfileSection";
import { UserSection } from "@/modules/panel/client/configuracion/usuario/UserSection";
import { saveClientProfile } from "@/lib/api/client/clientProfile";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Tabs, type TabItem } from "@/ui/Tabs";

type ConfigTab = "perfil" | "usuario";

const tabs: TabItem<ConfigTab>[] = [
  { id: "perfil", label: "Perfil" },
  { id: "usuario", label: "Usuario" },
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

    const result = await saveClientProfile(draftProfile);

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
      {activeTab === "usuario" && <UserSection email={draftProfile.email} />}
    </div>
  );
}
