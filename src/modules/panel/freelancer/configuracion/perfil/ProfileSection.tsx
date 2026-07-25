import type { Dispatch, SetStateAction } from "react";
import { DifferentiatorsSection } from "@/modules/panel/freelancer/configuracion/perfil/DifferentiatorsSection";
import { EditProfileSection } from "@/modules/panel/freelancer/configuracion/perfil/EditProfileSection";
import { EducationSection } from "@/modules/panel/freelancer/configuracion/perfil/EducationSection";
import { ExperienceSection } from "@/modules/panel/freelancer/configuracion/perfil/ExperienceSection";
import { SkillsSection } from "@/modules/panel/freelancer/configuracion/perfil/SkillsSection";
import { ToolsSection } from "@/modules/panel/freelancer/configuracion/perfil/ToolsSection";
import type { FreelancerProfile } from "@/types/freelancerProfile";

export function ProfileSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return (
    <div className="space-y-4">
      <EditProfileSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />

      <div className="grid items-start gap-4 md:grid-cols-3">
        <DifferentiatorsSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />
        <SkillsSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />
        <ToolsSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />
      </div>

      <ExperienceSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />
      <EducationSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />
    </div>
  );
}
