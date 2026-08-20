"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { ProfileSection } from "@/modules/panel/client/configuracion/perfil/ProfileSection";
import { UserSection } from "@/modules/panel/client/configuracion/usuario/UserSection";
import type { FreelancerProfile } from "@/types/freelancerProfile";
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

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === "perfil" ? (
        <ProfileSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />
      ) : (
        <UserSection />
      )}
    </div>
  );
}
