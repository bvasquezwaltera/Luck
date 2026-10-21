"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Plus } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { DeliveryClientGroup } from "@/modules/panel/freelancer/deliveries/DeliveryClientGroup";
import { DeliveryModuleDetailsModal } from "@/modules/panel/freelancer/deliveries/DeliveryModuleDetailsModal";
import { DeliveryProjectCard } from "@/modules/panel/freelancer/deliveries/DeliveryProjectCard";
import { NewDeliveryModal } from "@/modules/panel/freelancer/deliveries/NewDeliveryModal";
import { toDeliveryProjects, type DeliveryProject } from "@/lib/deliveryAdapter";
import type { ContractDeliveries } from "@/types/deliveryApi";
import type { DeliveryModule } from "@/types/deliveryModule";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Search } from "@/ui/Search";
import { Select } from "@/ui/Select";

type StatusTab = "Todas" | DeliveryModule["status"];

const statusTabs: StatusTab[] = ["Todas", "Nueva", "En proceso", "Culminado"];

// contracts llega como null cuando el servidor falló: se avisa en vez de mostrar "sin proyectos".
export function DeliveriesSection({ contracts: initialContracts }: { contracts: ContractDeliveries[] | null }) {
  const [contracts, setContracts] = useState(initialContracts);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [showNewDelivery, setShowNewDelivery] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const projects = useMemo(() => toDeliveryProjects(contracts ?? []), [contracts]);
  const allModules = useMemo(() => projects.flatMap((project) => project.modules), [projects]);
  const categories = useMemo(
    () => Array.from(new Set(projects.map((project) => project.category))).sort(),
    [projects],
  );

  const hasActiveFilters = Boolean(searchQuery || category || dateFrom || dateTo || activeTab !== "Todas");

  function clearFilters() {
    setSearchQuery("");
    setCategory("");
    setDateFrom("");
    setDateTo("");
    setActiveTab("Todas");
  }

  function matches(module: DeliveryModule) {
    const query = searchQuery.trim().toLowerCase();
    return (
      (activeTab === "Todas" || module.status === activeTab) &&
      (!query || [module.title, module.clientName, module.requestTitle].join(" ").toLowerCase().includes(query)) &&
      (!category || module.category === category) &&
      (!dateFrom || module.dueDateValue >= dateFrom) &&
      (!dateTo || module.dueDateValue <= dateTo)
    );
  }

  // Los filtros deciden qué proyectos aparecen; los que aún no tienen entregas solo se ven sin filtros.
  const visibleProjects = projects.filter((project) =>
    hasActiveFilters ? project.modules.some(matches) : true,
  );
  const activeProject: DeliveryProject | undefined = projects.find((project) => project.contractId === selectedContractId);
  const selectedModule = allModules.find((module) => module.id === selectedModuleId) ?? null;

  if (contracts === null) {
    return (
      <div className="space-y-4">
        <SectionHeader />
        <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-800">No se pudieron cargar tus entregas.</p>
          <p className="mt-1 text-xs text-slate-500">Recarga la página para intentarlo de nuevo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader />

      {projects.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">Aún no tienes proyectos</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
            Cuando un cliente pague una solicitud que aceptaste, su proyecto aparecerá aquí y podrás planificar las
            entregas.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-6 overflow-x-auto border-b border-slate-100 px-1 pb-3">
              {statusTabs.map((tab) => {
                const count = tab === "Todas" ? allModules.length : allModules.filter((module) => module.status === tab).length;
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
                  placeholder={activeProject ? "Buscar por entrega..." : "Buscar por entrega, cliente o proyecto..."}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              {!activeProject && (
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

          {activeProject ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedContractId(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver a proyectos
              </button>

              <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-slate-900">{activeProject.title}</h3>
                  <p className="mt-1 text-sm italic text-slate-600">Cliente: {activeProject.counterpartName}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activeProject.revisionsLimit === null
                      ? "Revisiones del plan: sin límite"
                      : `Revisiones del plan: ${activeProject.revisionsUsed} de ${activeProject.revisionsLimit} usadas por el cliente`}
                  </p>
                </div>
                <Button className="!min-w-0 shrink-0 gap-1.5 !px-4" onClick={() => setShowNewDelivery(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Nueva entrega
                </Button>
              </div>

              {activeProject.modules.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-10 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-700">Aún no planificaste entregas</p>
                  <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                    Crea la primera entrega con su descripción y fecha límite. El cliente la verá y podrás ir subiendo
                    tus avances.
                  </p>
                </div>
              ) : activeProject.modules.filter(matches).length === 0 ? (
                <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-sm text-slate-500">No se encontraron entregas con esos filtros.</p>
                </div>
              ) : (
                <DeliveryClientGroup
                  modules={activeProject.modules.filter(matches)}
                  onSelectModule={(module) => setSelectedModuleId(module.id)}
                />
              )}
            </div>
          ) : visibleProjects.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center shadow-sm">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No se encontraron entregas con esos filtros.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {visibleProjects.map((project) => (
                <DeliveryProjectCard
                  key={project.contractId}
                  project={project}
                  onClick={() => setSelectedContractId(project.contractId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeProject && (
        <NewDeliveryModal
          open={showNewDelivery}
          contractId={activeProject.contractId}
          projectTitle={activeProject.title}
          onClose={() => setShowNewDelivery(false)}
          onCreated={setContracts}
        />
      )}

      <DeliveryModuleDetailsModal
        key={selectedModule?.id ?? "none"}
        module={selectedModule}
        onClose={() => setSelectedModuleId(null)}
        onChanged={setContracts}
      />
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <PanelSectionHeader subtitle="Planifica tus entregas y mantén al cliente informado de cada avance." title="Entregas" />
    </div>
  );
}
