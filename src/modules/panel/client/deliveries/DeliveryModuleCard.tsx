import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { getCategoryBadgeClassName, statusConfig } from "@/modules/panel/client/deliveries/deliveryStatusConfig";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Badge } from "@/ui/Badge";

export function DeliveryModuleCard({
  module,
  onClick,
}: {
  module: DeliveryModule;
  onClick: () => void;
}) {
  const status = statusConfig[module.status];
  const StatusIcon = status.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${status.iconClassName}`}>
          <BookOpen className="h-5 w-5" />
        </div>
        <Badge className={getCategoryBadgeClassName(module.category)}>{module.category}</Badge>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{module.requestTitle}</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">{module.title}</h3>
      <p className="mt-2 text-sm italic text-slate-600">Freelancer: {module.freelancerName}</p>

      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${status.barClassName}`} style={{ width: `${module.progress}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">{module.progress}% completado</span>
        <Badge className={`${status.badgeClassName} flex items-center gap-1`}>
          <StatusIcon className="h-3 w-3" />
          {module.status}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-semibold">
          <CalendarDays className="h-4 w-4 text-indigo-500" />
          Próxima fecha: {module.dueDate}
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400" />
      </div>
    </button>
  );
}
