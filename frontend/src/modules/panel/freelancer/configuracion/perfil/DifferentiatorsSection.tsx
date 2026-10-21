import type { Dispatch, SetStateAction } from "react";
import { Sparkles } from "lucide-react";
import { StringListSection } from "@/modules/panel/freelancer/configuracion/perfil/StringListSection";
import type { FreelancerProfile } from "@/types/freelancerProfile";

export function DifferentiatorsSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return (
    <StringListSection
      icon={Sparkles}
      title="Lo que me diferencia"
      description="Lo que te distingue de otros freelancers."
      itemLabel="Diferenciador"
      placeholder="Ej.: Entregas semanales"
      addLabel="Agregar diferenciador"
      emptyText="Aún no agregaste ninguno."
      items={draftProfile.differentiators}
      onChange={(differentiators) => setDraftProfile((current) => ({ ...current, differentiators }))}
    />
  );
}
