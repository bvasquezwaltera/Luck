"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CreditCard, Filter, Inbox, Layers, Paperclip, RotateCcw } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import {
  ClientSolicitudDetailsModal,
} from "@/modules/panel/client/projects/ClientSolicitudDetailsModal";
import { PaymentDrawer } from "@/modules/panel/client/projects/PaymentDrawer";
import { SolicitudRowCard, type RowDetail, type RowFact } from "@/modules/panel/SolicitudRowCard";
import { CLIENT_LABEL, CLIENT_TONE, payHint } from "@/modules/panel/client/projects/clientSolicitudStatus";
import { solicitudCategoryConfig } from "@/modules/panel/solicitudCategoryConfig";
import { formatMoney } from "@/lib/formatMoney";
import { formatSolicitudDate } from "@/lib/formatSolicitudDate";
import { toPanelCategory } from "@/lib/receivedSolicitudAdapter";
import type { ClientSolicitud, ClientSolicitudStatus } from "@/types/clientSolicitud";
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

export function SolicitudesSection({
  solicitudes,
  onGoToDeliveries,
}: {
  solicitudes: ClientSolicitud[];
  onGoToDeliveries?: () => void;
}) {
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
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <PanelSectionHeader
          icon={Inbox}
          subtitle="Gestiona tus pedidos y mantén visible el avance de cada solicitud."
          title="Solicitudes"
          stats={[
            { label: "enviadas", value: solicitudes.filter((item) => item.status === "enviada").length, tone: "amber" },
            { label: "por pagar", value: solicitudes.filter((item) => item.status === "aceptada").length, tone: "indigo" },
            { label: "contratadas", value: solicitudes.filter((item) => item.status === "contratada").length, tone: "emerald" },
          ]}
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
                  <SolicitudRow key={solicitud.id} solicitud={solicitud} onGoToDeliveries={onGoToDeliveries} />
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

function SolicitudRow({
  solicitud,
  onGoToDeliveries,
}: {
  solicitud: ClientSolicitud;
  onGoToDeliveries?: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const category = solicitudCategoryConfig[toPanelCategory(solicitud.category)];
  const revisions = Number.parseInt(solicitud.plan.revisions, 10) || 0;

  const facts: RowFact[] = [];
  if (solicitud.desiredDate) {
    facts.push({ icon: CalendarDays, label: `Para el ${formatSolicitudDate(solicitud.desiredDate)}` });
  }
  if (solicitud.plan.activeProjects) {
    facts.push({ icon: Layers, label: `${solicitud.plan.activeProjects} proyectos activos` });
  }
  if (revisions > 0) {
    facts.push({ icon: RotateCcw, label: `${revisions} ${revisions === 1 ? "revisión" : "revisiones"}` });
  }
  if (solicitud.attachments.length > 0) {
    facts.push({
      icon: Paperclip,
      label: `${solicitud.attachments.length} ${solicitud.attachments.length === 1 ? "anexo" : "anexos"}`,
    });
  }

  const details: RowDetail[] = [];
  if (solicitud.status === "contratada" && solicitud.payment) {
    details.push({ label: "Pagado", value: formatMoney(solicitud.payment.amount) });
    details.push({ label: "Próximo cobro", value: formatSolicitudDate(solicitud.payment.nextChargeAt) });
  } else if (solicitud.status === "enviada") {
    details.push({ label: "Estado", value: "Esperando al freelancer" });
  } else if (solicitud.status === "aceptada") {
    details.push({ label: "Siguiente paso", value: "Pagar" });
  }

  // Pagar está siempre a la vista, pero solo se habilita con la solicitud aceptada; con el contrato ya
  // activo, el paso siguiente es ir a las entregas.
  const actions = (
    <>
      {solicitud.status === "contratada" ? (
        <Button className="w-full min-w-0 gap-1.5" onClick={onGoToDeliveries} disabled={!onGoToDeliveries}>
          Ir a entregas
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button
          className="w-full min-w-0 gap-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          title={payHint(solicitud.status)}
          onClick={() => setShowPay(true)}
          disabled={solicitud.status !== "aceptada"}
        >
          <CreditCard className="h-3.5 w-3.5" />
          Pagar {formatMoney(solicitud.plan.price)}
        </Button>
      )}
      <Button variant="outline-neutral" className="w-full min-w-0" onClick={() => setShowDetails(true)}>
        Ver detalles
      </Button>
    </>
  );

  return (
    <>
      <SolicitudRowCard
        tone={CLIENT_TONE[solicitud.status]}
        statusLabel={CLIENT_LABEL[solicitud.status]}
        title={solicitud.title}
        categoryIcon={category.icon}
        categoryClassName={category.className}
        person={{ name: solicitud.freelancer.name, initials: solicitud.freelancer.initials }}
        planLine={`Plan ${solicitud.plan.name}`}
        description={solicitud.description}
        facts={facts}
        footer={`${solicitud.category || category.label} · Enviada el ${formatSolicitudDate(solicitud.createdAt)}`}
        price={{ amount: formatMoney(solicitud.plan.price), period: "/mes" }}
        details={details}
        actions={actions}
      />

      <ClientSolicitudDetailsModal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        solicitud={solicitud}
        onGoToDeliveries={onGoToDeliveries}
        onPay={() => {
          setShowDetails(false);
          setShowPay(true);
        }}
      />
      <PaymentDrawer open={showPay} solicitud={solicitud} onClose={() => setShowPay(false)} />
    </>
  );
}
