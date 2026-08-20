import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { getCategoryBadgeClassName } from "@/modules/panel/client/deliveries/deliveryStatusConfig";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Badge } from "@/ui/Badge";

export function DeliveryProjectCard({
  freelancerName,
  modules,
  onClick,
}: {
  freelancerName: string;
  modules: DeliveryModule[];
  onClick: () => void;
}) {
  const requestTitle = modules[0].requestTitle;
  const category = modules[0].category;
  const averageProgress = Math.round(
    modules.reduce((total, module) => total + module.progress, 0) / modules.length,
  );
  const sortedByDate = [...modules].sort((a, b) => a.dueDateValue.localeCompare(b.dueDateValue));
  const firstDate = sortedByDate[0].dueDate;
  const lastDate = sortedByDate[sortedByDate.length - 1].dueDate;
  const dateRange = firstDate === lastDate ? firstDate : `${firstDate} – ${lastDate}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <Badge className={getCategoryBadgeClassName(category)}>{category}</Badge>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-900">{requestTitle}</h3>
      <p className="mt-2 text-sm italic text-slate-600">Freelancer: {freelancerName}</p>

      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
          style={{ width: `${averageProgress}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">{averageProgress}% completado</span>
        <Badge className="!bg-indigo-50 !text-indigo-600">
          {modules.length} {modules.length === 1 ? "entrega" : "entregas"}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-semibold">
          <CalendarDays className="h-4 w-4 text-indigo-500" />
          Plazo: {dateRange}
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400" />
      </div>
    </button>
  );
}
