"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { DeliveryModuleDetailsModal } from "@/modules/panel/client/deliveries/DeliveryModuleDetailsModal";
import { DeliveryModuleGroup } from "@/modules/panel/client/deliveries/DeliveryModuleGroup";
import { DeliveryProjectCard } from "@/modules/panel/client/deliveries/DeliveryProjectCard";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Input } from "@/ui/Input";
import { Search } from "@/ui/Search";
import { Select } from "@/ui/Select";
import deliveryModulesData from "@/data/deliveryModules.json";

const deliveryModules = deliveryModulesData as DeliveryModule[];

type StatusTab = "Todas" | DeliveryModule["status"];

const statusTabs: StatusTab[] = ["Todas", "Nueva", "En proceso", "Culminado"];

export function DeliveriesSection() {
  const [selectedModule, setSelectedModule] = useState<DeliveryModule | null>(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StatusTab>("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(deliveryModules.map((module) => module.category))).sort(),
    [],
  );

  const hasActiveFilters = Boolean(
    searchQuery || category || dateFrom || dateTo || activeTab !== "Todas",
  );

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("");
    setDateFrom("");
    setDateTo("");
    setActiveTab("Todas");
  };

  function countByStatus(status: DeliveryModule["status"]) {
    return deliveryModules.filter((module) => module.status === status).length;
  }

  const filteredModules = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return deliveryModules.filter((module) => {
      const matchesTab = activeTab === "Todas" || module.status === activeTab;
      const matchesQuery =
        !query ||
        [module.title, module.freelancerName, module.requestTitle].join(" ").toLowerCase().includes(query);
      const matchesCategory = !category || module.category === category;
      const matchesFrom = !dateFrom || module.dueDateValue >= dateFrom;
      const matchesTo = !dateTo || module.dueDateValue <= dateTo;
      return matchesTab && matchesQuery && matchesCategory && matchesFrom && matchesTo;
    });
  }, [activeTab, searchQuery, category, dateFrom, dateTo]);

  function groupByFreelancer(modules: DeliveryModule[]) {
    const groups = new Map<string, DeliveryModule[]>();
    for (const deliveryModule of modules) {
      const existing = groups.get(deliveryModule.freelancerName) ?? [];
      groups.set(deliveryModule.freelancerName, [...existing, deliveryModule]);
    }
    return Array.from(groups.entries());
  }

  const groupedByFreelancer = useMemo(() => groupByFreelancer(filteredModules), [filteredModules]);

  // Los filtros solo deciden qué proyectos aparecen en la lista; una vez que un
  // proyecto califica, su tarjeta muestra las estadísticas reales de TODAS sus
  // entregas (no solo las que coinciden con el filtro).
  const visibleFreelancerNames = useMemo(
    () => new Set(filteredModules.map((module) => module.freelancerName)),
    [filteredModules],
  );
  const allGroupedByFreelancer = useMemo(() => groupByFreelancer(deliveryModules), []);
  const visibleProjects = useMemo(
    () => allGroupedByFreelancer.filter(([freelancerName]) => visibleFreelancerNames.has(freelancerName)),
    [allGroupedByFreelancer, visibleFreelancerNames],
  );

  const activeGroup = groupedByFreelancer.find(([freelancerName]) => freelancerName === selectedFreelancer);

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <PanelSectionHeader subtitle="Consulta el avance de cada entrega de tus freelancers." title="Entregas" />
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-6 overflow-x-auto border-b border-slate-100 px-1 pb-3">
          {statusTabs.map((tab) => {
            const count = tab === "Todas" ? deliveryModules.length : countByStatus(tab);
            const active = activeTab === tab;
            return (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-1 py-2 text-xs font-semibold transition ${
                  active ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-indigo-100" : "bg-slate-100"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Search
              aria-label="Buscar entregas"
              placeholder={activeGroup ? "Buscar por entrega..." : "Buscar por entrega, freelancer o solicitud..."}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          {!activeGroup && (
            <Select
              aria-label="Categoría"
              className="lg:w-48"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          )}
          <Input
            label="Desde"
            hideLabel
            aria-label="Desde"
            type="date"
            className="lg:w-40"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
          />
          <Input
            label="Hasta"
            hideLabel
            aria-label="Hasta"
            type="date"
            className="lg:w-40"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
          />
          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="shrink-0 text-xs font-medium text-indigo-600 transition hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:text-slate-300"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {activeGroup ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelectedFreelancer(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a proyectos
          </button>
          <DeliveryModuleGroup modules={activeGroup[1]} onSelectModule={setSelectedModule} />
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No se encontraron entregas con esos filtros.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {visibleProjects.map(([freelancerName, modules]) => (
            <DeliveryProjectCard
              key={freelancerName}
              freelancerName={freelancerName}
              modules={modules}
              onClick={() => setSelectedFreelancer(freelancerName)}
            />
          ))}
        </div>
      )}

      <DeliveryModuleDetailsModal
        key={selectedModule?.id ?? "none"}
        module={selectedModule}
        onClose={() => setSelectedModule(null)}
      />
    </div>
  );
}
