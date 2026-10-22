import type { Dispatch, SetStateAction } from "react";
import { Wrench } from "lucide-react";
import { StringListSection } from "@/modules/panel/freelancer/configuracion/perfil/StringListSection";
import type { FreelancerProfile } from "@/types/freelancerProfile";

export function ToolsSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return (
    <StringListSection
      icon={Wrench}
      title="Herramientas y tecnologías"
      description="Con qué trabajas."
      itemLabel="Herramienta"
      placeholder="Ej.: Figma"
      addLabel="Agregar herramienta"
      emptyText="Aún no agregaste ninguna."
      items={draftProfile.tools}
      errorKey="tools"
      onChange={(tools) => setDraftProfile((current) => ({ ...current, tools }))}
    />
  );
}
