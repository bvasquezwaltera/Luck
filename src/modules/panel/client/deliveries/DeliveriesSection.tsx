import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { Button } from "@/ui/Button";

export function DeliveriesSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <PanelSectionHeader
          subtitle="Bienvenido de nuevo"
          title="Entregas"
          actions={
            <Button variant="primary" className="!min-w-0 !px-4 bg-indigo-600 hover:bg-indigo-700">
              Nueva entrega
            </Button>
          }
        />
      </div>
    </div>
  );
}
