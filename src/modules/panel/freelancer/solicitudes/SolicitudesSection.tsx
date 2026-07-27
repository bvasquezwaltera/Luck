"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { SolicitudCard } from "@/modules/panel/freelancer/solicitudes/SolicitudCard";
import { Pagination } from "@/ui/Pagination";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Input } from "@/ui/Input";
import type { Solicitud, SolicitudStatus } from "@/types/solicitud";
import solicitudesData from "@/data/solicitudes.json";

const ITEMS_PER_PAGE = 5;

type TabType = SolicitudStatus | "todas";

export function SolicitudesSection() {
  const solicitudes = solicitudesData.solicitudes as Solicitud[];
  
  const [activeTab, setActiveTab] = useState<TabType>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter by status
  const filteredBySatus = useMemo(() => {
    if (activeTab === "todas") return solicitudes;
    return solicitudes.filter((sol) => sol.status === activeTab);
  }, [activeTab, solicitudes]);

  // Filter by search
  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return filteredBySatus;
    const query = searchQuery.toLowerCase();
    return filteredBySatus.filter(
      (sol) =>
        sol.titulo.toLowerCase().includes(query) ||
        sol.clienteName.toLowerCase().includes(query)
    );
  }, [filteredBySatus, searchQuery]);

  // Paginate
  const totalPages = Math.ceil(filteredBySearch.length / ITEMS_PER_PAGE);
  const paginatedSolicitudes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBySearch.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBySearch, currentPage]);

  // Summary counts
  const summary = useMemo(() => {
    return {
      nuevas: solicitudes.filter((s) => s.status === "nueva").length,
      sin_responder: solicitudes.filter((s) => s.status === "sin_responder").length,
      respondidas: solicitudes.filter((s) => s.status === "respondida").length,
      archivadas: solicitudes.filter((s) => s.status === "archivada").length,
    };
  }, [solicitudes]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <PanelSectionHeader 
          subtitle="Revisa y responde a las solicitudes de proyectos que los clientes te han enviado."
          title="Solicitudes" 
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-2xl">
        <div className="flex gap-8 px-6 overflow-x-auto">
          {(["todas", "nueva", "sin_responder", "respondida", "archivada"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labels = {
              todas: "Todas",
              nueva: "Nuevas",
              sin_responder: "Sin responder",
              respondida: "Respondidas",
              archivada: "Archivadas",
            };
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`border-b-2 px-1 py-4 text-sm font-medium transition ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-3 bg-white rounded-b-2xl px-6 pt-4 pb-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por título o cliente..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline-neutral"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs"
          >
            Filtros
          </Button>
          {searchQuery && (
            <Button
              variant="outline-neutral"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="text-xs"
            >
              Limpiar búsqueda
            </Button>
          )}
        </div>

        {/* Summary */}
        {!showFilters && (
          <div className="grid grid-cols-4 gap-2 pt-2 text-xs">
            <div>
              <div className="font-medium text-slate-600">Nuevas</div>
              <div className="text-base font-semibold text-slate-900">{summary.nuevas}</div>
            </div>
            <div>
              <div className="font-medium text-slate-600">Sin responder</div>
              <div className="text-base font-semibold text-slate-900">{summary.sin_responder}</div>
            </div>
            <div>
              <div className="font-medium text-slate-600">Respondidas</div>
              <div className="text-base font-semibold text-slate-900">{summary.respondidas}</div>
            </div>
            <div>
              <div className="font-medium text-slate-600">Archivadas</div>
              <div className="text-base font-semibold text-slate-900">{summary.archivadas}</div>
            </div>
          </div>
        )}
      </div>

      {/* Solicitudes list */}
      {paginatedSolicitudes.length > 0 ? (
        <>
          <Card className="flex flex-col overflow-hidden">
            {paginatedSolicitudes.map((solicitud) => (
              <SolicitudCard key={solicitud.id} solicitud={solicitud} />
            ))}
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">No se encontraron solicitudes</p>
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-2xl bg-blue-50 p-4 border border-blue-200">
        <p className="text-xs text-blue-700">
          💡 Responde rápido a las nuevas solicitudes para aumentar tus posibilidades de ser contratado.
        </p>
      </div>
    </div>
  );
}
