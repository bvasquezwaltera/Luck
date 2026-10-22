"use client";

import { Lock, Settings, UserRound } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { ProfileErrorsProvider } from "@/modules/panel/profileErrors";
import { ProfileSection } from "@/modules/panel/client/configuracion/perfil/ProfileSection";
import { UserSection } from "@/modules/panel/client/configuracion/usuario/UserSection";
import { saveClientProfile } from "@/lib/api/client/clientProfile";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Button } from "@/ui/Button";
import { Tabs, type TabItem } from "@/ui/Tabs";
import { validateClientProfile } from "@/validators/profileValidation";

// Lleva la vista al primer campo con error, una vez que la pantalla ya lo dibujó.
function scrollToFirstError() {
  requestAnimationFrame(() => {
    document.querySelector("[data-field-error], p.text-red-500")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}


type ConfigTab = "perfil" | "usuario";

const tabs: TabItem<ConfigTab>[] = [
  { id: "perfil", label: "Perfil", icon: UserRound },
  { id: "usuario", label: "Usuario", icon: Lock },
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

  // Hasta el primer intento de guardar no se marca nada; después los errores se actualizan mientras se corrige.
  const [showErrors, setShowErrors] = useState(false);
  const errors = showErrors ? validateClientProfile(draftProfile) : {};
  const errorCount = Object.keys(errors).length;

  async function handleSave() {
    setShowErrors(true);
    if (Object.keys(validateClientProfile(draftProfile)).length > 0) {
      setSaveMessage(null);
      scrollToFirstError();
      return;
    }

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
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <PanelSectionHeader icon={Settings} subtitle="Administra tu perfil y los datos de tu cuenta." title="Configuración" />
      </div>

      <div className="rounded-2xl bg-white p-2.5 shadow-sm">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pill" />
      </div>

      {activeTab === "perfil" && (
        <>
          <ProfileErrorsProvider errors={errors}>
            <ProfileSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />
          </ProfileErrorsProvider>

          <div className="flex items-center justify-end gap-3">
            {errorCount > 0 && (
              <p className="text-xs text-red-500">
                {errorCount === 1 ? "Corrige 1 campo para poder guardar." : `Corrige ${errorCount} campos para poder guardar.`}
              </p>
            )}
            {errorCount === 0 && saveMessage && (
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
