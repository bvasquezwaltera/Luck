import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";

export function PaymentsSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <PanelSectionHeader subtitle="Bienvenido de nuevo" title="Pagos" />
      </div>
    </div>
  );
}
