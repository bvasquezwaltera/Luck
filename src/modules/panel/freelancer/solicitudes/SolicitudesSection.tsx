"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { SolicitudCard } from "@/modules/panel/freelancer/solicitudes/SolicitudCard";
import { Pagination } from "@/ui/Pagination";
import { Card } from "@/ui/Card";
import { Search } from "@/ui/Search";
import { Select } from "@/ui/Select";
import type { Solicitud, SolicitudCategory, SolicitudStatus } from "@/types/solicitud";
import solicitudesData from "@/data/solicitudes.json";
import { loadStoredSolicitudes } from "@/lib/solicitudStorage";

const defaultSolicitudes = solicitudesData.solicitudes as Solicitud[];
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

function countByStatus(solicitudes: Solicitud[], status: SolicitudStatus) {
  return solicitudes.filter((solicitud) => solicitud.status === status).length;
}

export function SolicitudesSection() {
  const [activeTab, setActiveTab] = useState<TabType>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<SolicitudCategory | "">("");
  const [plan, setPlan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [storedSolicitudes, setStoredSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    setStoredSolicitudes(loadStoredSolicitudes());
  }, []);

  const combinedSolicitudes = useMemo(() => [...storedSolicitudes, ...defaultSolicitudes], [storedSolicitudes]);

  const filteredSolicitudes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return combinedSolicitudes.filter((solicitud) => {
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
  }, [activeTab, category, plan, searchQuery, combinedSolicitudes]);

  const totalPages = Math.max(1, Math.ceil(filteredSolicitudes.length / ITEMS_PER_PAGE));
  const paginatedSolicitudes = filteredSolicitudes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const hasActiveFilters = Boolean(searchQuery || category || plan);

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

      <div className="space-y-4">
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex gap-6 overflow-x-auto border-b border-slate-200 px-5 sm:px-6">
            {tabs.map((tab) => {
              const count = tab.id === "todas" ? combinedSolicitudes.length : countByStatus(combinedSolicitudes, tab.id);
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
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex-1">
              <Search
                aria-label="Buscar solicitudes"
                placeholder="Buscar por título, cliente o plan..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              aria-label="Categoría"
              className="sm:w-48"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value as SolicitudCategory | "");
                setCurrentPage(1);
              }}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Plan del cliente"
              className="sm:w-48"
              value={plan}
              onChange={(event) => {
                setPlan(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Todos los planes</option>
              <option value="Plan Básico">Plan Básico</option>
              <option value="Plan Estándar">Plan Estándar</option>
              <option value="Plan Premium">Plan Premium</option>
            </Select>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:text-slate-300"
            >
              Limpiar filtros
            </button>
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
    </div>
  );
}
