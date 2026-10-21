import { BarChart3 } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";

export function StatisticsSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <PanelSectionHeader icon={BarChart3} subtitle="Resumen de tu actividad en la plataforma." title="Estadísticas" />
      </div>
    </div>
  );
}
