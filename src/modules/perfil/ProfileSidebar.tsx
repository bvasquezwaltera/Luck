import { MessageSquare, ClipboardList, GitBranch, ShieldCheck } from "lucide-react";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { Card } from "@/ui/Card";
import { InfoCard } from "@/ui/InfoCard";

export function ProfileSidebar({ profile }: { profile: FreelancerProfile }) {
  return (
    <div className="flex flex-col gap-4">
      <InfoCard
        icon={<span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />}
        label="Estoy disponible para"
        description={profile.availabilityStatus}
      />

      <Card className="flex flex-col gap-4">
        <p className="text-sm font-bold text-gray-900">Métodos de trabajo</p>

        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <MessageSquare className="h-3.5 w-3.5" />
            Comunicación
          </p>
          <p className="text-xs text-gray-600">{profile.workMethods.communication.join(", ")}</p>
        </div>

        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <ClipboardList className="h-3.5 w-3.5" />
            Gestión de proyectos
          </p>
          <p className="text-xs text-gray-600">
            {profile.workMethods.projectManagement.join(", ")}
          </p>
        </div>

        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <GitBranch className="h-3.5 w-3.5" />
            Control de versiones
          </p>
          <p className="text-xs text-gray-600">{profile.workMethods.versionControl.join(", ")}</p>
        </div>
      </Card>

      <InfoCard
        icon={<ShieldCheck className="h-6 w-6 shrink-0 text-emerald-600" />}
        label="Pago seguro"
        description="Tu dinero está protegido con nuestro sistema de escrow."
      />
    </div>
  );
}
