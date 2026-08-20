import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import type { FreelancerProfile } from "@/types/freelancerProfile";

export function HomeSection({ profile }: { profile: FreelancerProfile }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <PanelSectionHeader subtitle="Bienvenido de nuevo" title={profile.name} />
    </div>
  );
}
