"use client";

import { useMemo, useState } from "react";
import { CreditCard, Eye, Filter, Inbox, Paperclip } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import {
  CLIENT_STATUS_CONFIG,
  ClientSolicitudDetailsModal,
  payHint,
} from "@/modules/panel/client/projects/ClientSolicitudDetailsModal";
import { PaymentDrawer } from "@/modules/panel/client/projects/PaymentDrawer";
import { solicitudCategoryConfig } from "@/modules/panel/solicitudCategoryConfig";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import { toPanelCategory } from "@/lib/receivedSolicitudAdapter";
import type { ClientSolicitud, ClientSolicitudStatus } from "@/types/clientSolicitud";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Pagination } from "@/ui/Pagination";
import { Search } from "@/ui/Search";
import { Select } from "@/ui/Select";

const ITEMS_PER_PAGE = 5;
type TabId = ClientSolicitudStatus | "todas";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "enviada", label: "Enviadas" },
  { id: "aceptada", label: "Aceptadas" },
  { id: "contratada", label: "Contratadas" },
  { id: "rechazada", label: "Rechazadas" },
];

export function SolicitudesSection({ solicitudes }: { solicitudes: ClientSolicitud[] }) {
  const [activeTab, setActiveTab] = useState<TabId>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [plan, setPlan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Los filtros de categoría y plan se arman con lo que el cliente realmente tiene.
  const categories = useMemo(
    () => Array.from(new Set(solicitudes.map((item) => item.category).filter(Boolean))).sort(),
    [solicitudes],
  );
  const plans = useMemo(() => Array.from(new Set(solicitudes.map((item) => item.plan.name))).sort(), [solicitudes]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return solicitudes.filter((item) => {
      const matchesTab = activeTab === "todas" || item.status === activeTab;
      const matchesCategory = !category || item.category === category;
      const matchesPlan = !plan || item.plan.name === plan;
      const matchesSearch =
        !query ||
        [item.title, item.freelancer.name, item.description, item.plan.name].join(" ").toLowerCase().includes(query);
      return matchesTab && matchesCategory && matchesPlan && matchesSearch;
    });
  }, [solicitudes, activeTab, category, plan, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visible = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const hasActiveFilters = Boolean(searchQuery || category || plan);

  function countFor(tab: TabId) {
    return tab === "todas" ? solicitudes.length : solicitudes.filter((item) => item.status === tab).length;
  }

  function clearFilters() {
    setSearchQuery("");
    setCategory("");
    setPlan("");
    setActiveTab("todas");
    setCurrentPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <PanelSectionHeader
          subtitle="Gestiona tus pedidos y mantén visible el avance de cada solicitud."
          title="Solicitudes"
        />
      </div>

      {solicitudes.length === 0 ? (
        <div className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Inbox className="h-7 w-7" />
          </div>
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold text-slate-900">Aún no tienes solicitudes</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Elige un freelancer y un plan desde su perfil para enviar tu primera solicitud. Aquí verás su
              respuesta.
            </p>
          </div>
          <Button variant="soft" className="!min-w-0 !px-5" href="/">
            Explorar freelancers
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="flex gap-6 overflow-x-auto border-b border-slate-200 px-5 sm:px-6">
              {TABS.map((tab) => {
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
                      {countFor(tab.id)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="flex-1">
                <Search
                  aria-label="Buscar solicitudes"
                  placeholder="Buscar por título, freelancer o plan..."
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
                  setCategory(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todas las categorías</option>
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="Plan"
                className="sm:w-48"
                value={plan}
                onChange={(event) => {
                  setPlan(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todos los planes</option>
                {plans.map((value) => (
                  <option key={value} value={value}>
                    Plan {value}
                  </option>
                ))}
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

          {visible.length > 0 ? (
            <>
              <Card className="overflow-hidden">
                {visible.map((solicitud) => (
                  <SolicitudRow key={solicitud.id} solicitud={solicitud} />
                ))}
              </Card>
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <Filter className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No se encontraron solicitudes</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SolicitudRow({ solicitud }: { solicitud: ClientSolicitud }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const status = CLIENT_STATUS_CONFIG[solicitud.status];
  const category = solicitudCategoryConfig[toPanelCategory(solicitud.category)];
  const CategoryIcon = category.icon;
  const revisions = Number.parseInt(solicitud.plan.revisions, 10) || 0;

  return (
    <>
      <article className="group border-b border-slate-100 px-4 py-5 transition last:border-b-0 hover:bg-slate-50/60 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${category.className}`}>
            <CategoryIcon className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{solicitud.title}</h3>
              <Badge className={`${status.className} whitespace-nowrap text-[11px] font-medium`}>{status.label}</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {solicitud.freelancer.name} <span className="mx-1 text-slate-300">•</span> Plan {solicitud.plan.name}
            </p>

            <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600">{solicitud.description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {solicitud.desiredDate && (
                <Badge className="!bg-rose-50 !text-rose-600">
                  Fecha deseada: {formatSolicitudDate(solicitud.desiredDate)}
                </Badge>
              )}
              {solicitud.plan.activeProjects && (
                <Badge className="!bg-indigo-50 !text-indigo-600">
                  Proyectos activos: {solicitud.plan.activeProjects}
                </Badge>
              )}
              {revisions > 0 && (
                <Badge className="!bg-emerald-50 !text-emerald-600">
                  {revisions} {revisions === 1 ? "revisión" : "revisiones"}
                </Badge>
              )}
              {solicitud.category && <Badge className={category.className}>{solicitud.category}</Badge>}
              {solicitud.attachments.length > 0 && (
                <Badge className="flex items-center gap-1 !bg-slate-100 !text-slate-500">
                  <Paperclip className="h-3 w-3" />
                  {solicitud.attachments.length} {solicitud.attachments.length === 1 ? "anexo" : "anexos"}
                </Badge>
              )}
            </div>

            <p className="mt-4 text-[11px] text-slate-400">Enviada el {formatSolicitudDate(solicitud.createdAt)}</p>
          </div>

          <div className="flex shrink-0 flex-row items-center gap-4 border-t border-slate-100 pt-4 lg:w-44 lg:flex-col lg:items-stretch lg:border-t-0 lg:pt-0">
            <div className="flex-1 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 lg:flex-none">
              <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-500">Plan solicitado</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Plan {solicitud.plan.name}</p>
              <p className="mt-1 text-[11px] text-slate-500">${solicitud.plan.price} /mes</p>
              {solicitud.payment && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Próximo cobro: {formatSolicitudDate(solicitud.payment.nextChargeAt)}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <Button
                  variant="outline-neutral"
                  aria-label="Ver detalles"
                  title="Ver detalles"
                  className="!min-w-0 h-8 w-8 !px-0"
                  onClick={() => setShowDetails(true)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  aria-label="Pagar"
                  title={payHint(solicitud.status)}
                  className="!min-w-0 h-8 gap-1.5 !px-3 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setShowPay(true)}
                  disabled={solicitud.status !== "aceptada"}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  {solicitud.status === "contratada" ? "Pagado" : "Pagar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <ClientSolicitudDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        solicitud={solicitud}
        onPay={() => {
          setShowDetails(false);
          setShowPay(true);
        }}
      />
      <PaymentDrawer open={showPay} solicitud={solicitud} onClose={() => setShowPay(false)} />
    </>
  );
}
