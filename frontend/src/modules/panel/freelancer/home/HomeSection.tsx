import { House } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import type { FreelancerProfile } from "@/types/freelancerProfile";

export function HomeSection({ profile }: { profile: FreelancerProfile }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <PanelSectionHeader icon={House} subtitle="Bienvenido de nuevo" title={profile.name} />
    </div>
  );
}
