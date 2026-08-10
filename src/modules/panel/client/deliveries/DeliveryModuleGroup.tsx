import { DeliveryModuleCard } from "@/modules/panel/client/deliveries/DeliveryModuleCard";
import type { DeliveryModule } from "@/types/deliveryModule";

export function DeliveryModuleGroup({
  modules,
  onSelectModule,
}: {
  modules: DeliveryModule[];
  onSelectModule: (module: DeliveryModule) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {modules.map((module) => (
        <DeliveryModuleCard key={module.id} module={module} onClick={() => onSelectModule(module)} />
      ))}
    </div>
  );
}
