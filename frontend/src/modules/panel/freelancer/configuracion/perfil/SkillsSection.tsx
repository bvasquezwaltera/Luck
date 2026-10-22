import type { Dispatch, SetStateAction } from "react";
import { Zap } from "lucide-react";
import { StringListSection } from "@/modules/panel/freelancer/configuracion/perfil/StringListSection";
import type { FreelancerProfile } from "@/types/freelancerProfile";

export function SkillsSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return (
    <StringListSection
      icon={Zap}
      title="Habilidades"
      description="Lo que sabes hacer."
      itemLabel="Habilidad"
      placeholder="Ej.: Python"
      addLabel="Agregar habilidad"
      emptyText="Aún no agregaste ninguna."
      items={draftProfile.skills}
      onChange={(skills) => setDraftProfile((current) => ({ ...current, skills }))}
    />
  );
}
