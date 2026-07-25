"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { ProfileSection } from "@/modules/panel/freelancer/configuracion/perfil/ProfileSection";
import { ProjectsSection } from "@/modules/panel/freelancer/configuracion/proyecto/ProjectsSection";
import { UserSection } from "@/modules/panel/freelancer/configuracion/usuario/UserSection";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Tabs, type TabItem } from "@/ui/Tabs";

type ConfigTab = "perfil" | "usuario" | "proyectos";

const tabs: TabItem<ConfigTab>[] = [
  { id: "perfil", label: "Perfil" },
  { id: "usuario", label: "Usuario" },
  { id: "proyectos", label: "Proyectos" },
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

      {activeTab === "perfil" && (
        <ProfileSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />
      )}
      {activeTab === "usuario" && <UserSection />}
      {activeTab === "proyectos" && <ProjectsSection />}
    </div>
  );
}
