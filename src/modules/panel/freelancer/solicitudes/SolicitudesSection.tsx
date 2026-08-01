"use client";

import { useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { SolicitudCard } from "@/modules/panel/freelancer/solicitudes/SolicitudCard";
import { Pagination } from "@/ui/Pagination";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import type { Solicitud, SolicitudCategory, SolicitudStatus } from "@/types/solicitud";
import solicitudesData from "@/data/solicitudes.json";

const solicitudes = solicitudesData.solicitudes as Solicitud[];
const ITEMS_PER_PAGE = 5;
type TabType = SolicitudStatus | "todas";

const tabs: Array<{ id: TabType; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "nueva", label: "Nuevas" },
  { id: "sin_responder", label: "Sin responder" },
  { id: "respondida", label: "Respondidas" },
  { id: "archivada", label: "Archivadas" },
];

const categoryOptions: Array<{ value: SolicitudCategory | ""; label: string }> = [
  { value: "", label: "Todas las categorías" },
  { value: "desarrollo", label: "Desarrollo" },
  { value: "movil", label: "Móvil" },
  { value: "diseno", label: "Diseño" },
  { value: "marketing", label: "Marketing" },
  { value: "arquitectura", label: "Arquitectura" },
];

function countByStatus(status: SolicitudStatus) {
  return solicitudes.filter((solicitud) => solicitud.status === status).length;
}

export function SolicitudesSection() {
  const [activeTab, setActiveTab] = useState<TabType>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<SolicitudCategory | "">("");
  const [plan, setPlan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredSolicitudes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return solicitudes.filter((solicitud) => {
      const matchesTab = activeTab === "todas" || solicitud.status === activeTab;
      const matchesCategory = !category || solicitud.category === category;
      const matchesPlan = !plan || solicitud.planName === plan;
      const matchesSearch =
        !query ||
        [solicitud.titulo, solicitud.clienteName, solicitud.description, solicitud.planName]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesTab && matchesCategory && matchesPlan && matchesSearch;
    });
  }, [activeTab, category, plan, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSolicitudes.length / ITEMS_PER_PAGE));
  const paginatedSolicitudes = filteredSolicitudes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("");
    setPlan("");
    setActiveTab("todas");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PanelSectionHeader
            subtitle="Revisa el alcance, los anexos y responde con un calendario que puedas cumplir."
            title="Solicitudes"
          />
          <div className="hidden items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-[11px] font-medium text-indigo-600 sm:flex">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Preferencias de solicitudes
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_250px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="flex gap-6 overflow-x-auto border-b border-slate-200 px-5 sm:px-6">
              {tabs.map((tab) => {
                const count = tab.id === "todas" ? solicitudes.length : countByStatus(tab.id);
                const active = activeTab === tab.id;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`flex shrink-0 items-center gap-1.5 border-b-2 px-1 py-4 text-xs font-semibold transition ${
                      active ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-indigo-100" : "bg-slate-100"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="p-4 sm:p-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  label="Buscar solicitudes"
                  hideLabel
                  placeholder="Buscar por título, cliente o plan..."
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {paginatedSolicitudes.length > 0 ? (
            <>
              <Card className="overflow-hidden">
                {paginatedSolicitudes.map((solicitud) => (
                  <SolicitudCard key={solicitud.id} solicitud={solicitud} />
                ))}
              </Card>
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Filter className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No se encontraron solicitudes</p>
              <button type="button" onClick={clearFilters} className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Resumen de solicitudes</h2>
              <span className="text-[11px] text-slate-400">{solicitudes.length} total</span>
            </div>
            <div className="space-y-3">
              {[
                ["Nuevas", "nueva", "text-indigo-600"],
                ["Sin responder", "sin_responder", "text-amber-600"],
                ["Respondidas", "respondida", "text-emerald-600"],
                ["Archivadas", "archivada", "text-slate-500"],
              ].map(([label, status, color]) => (
                <div key={status} className="flex items-center justify-between text-xs">
                  <span className={`${color} font-medium`}>{label}</span>
                  <span className="font-semibold text-slate-800">{countByStatus(status as SolicitudStatus)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-semibold text-slate-900">Filtros</h2>
              </div>
              <button type="button" onClick={clearFilters} className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700">
                Limpiar
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-medium text-slate-500">
                Categoría
                <select value={category} onChange={(event) => { setCategory(event.target.value as SolicitudCategory | ""); setCurrentPage(1); }} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500">
                  {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="block text-[11px] font-medium text-slate-500">
                Plan del cliente
                <select value={plan} onChange={(event) => { setPlan(event.target.value); setCurrentPage(1); }} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-indigo-500">
                  <option value="">Todos los planes</option>
                  <option value="Plan Básico">Plan Básico</option>
                  <option value="Plan Estándar">Plan Estándar</option>
                  <option value="Plan Premium">Plan Premium</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <h2 className="mt-3 text-xs font-semibold text-indigo-900">Consejo</h2>
            <p className="mt-1 text-xs leading-5 text-indigo-700">Revisa los anexos antes de responder y propone un calendario realista para cada entrega.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
