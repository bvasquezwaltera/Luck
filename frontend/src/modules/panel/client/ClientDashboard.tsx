"use client";

import { useMemo, useState } from "react";
import {
  CreditCard,
  Inbox,
  LayoutGrid,
  MessageCircle,
  Settings,
  Truck,
} from "lucide-react";
import { PanelBrandHeader } from "@/modules/panel/PanelBrandHeader";
import { WelcomeModal } from "@/modules/panel/onboarding/WelcomeModal";
import { useOnboarding } from "@/hooks/useOnboarding";
import type { OnboardingState } from "@/lib/onboardingSteps";
import { PanelMobileNav } from "@/modules/panel/PanelMobileNav";
import { PanelSidebar } from "@/modules/panel/PanelSidebar";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { ConfigurationSection } from "@/modules/panel/client/configuracion/ConfigurationSection";
import { DeliveriesSection } from "@/modules/panel/client/deliveries/DeliveriesSection";
import { HomeSection } from "@/modules/panel/client/home/HomeSection";
import { MessagesSection } from "@/modules/panel/client/messages/MessagesSection";
import { PaymentsSection } from "@/modules/panel/client/payments/PaymentsSection";
import { SolicitudesSection } from "@/modules/panel/client/projects/ProjectsSection";
import type { ClientSectionId } from "@/types/clientSection";
import type { ClientSolicitud } from "@/types/clientSolicitud";
import type { ContractDeliveries } from "@/types/deliveryApi";
import type { ClientPaymentSummary, PaymentRecord } from "@/types/payment";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import { useDraftProfile } from "@/hooks/useDraftProfile";
import fallbackProfileData from "@/data/exampleClientProfile.json";

const menuItems: Array<{ id: ClientSectionId; label: string; icon: typeof LayoutGrid }> = [
  { id: "inicio", label: "Inicio", icon: LayoutGrid },
  { id: "solicitudes", label: "Solicitudes", icon: Inbox },
  { id: "mensajes", label: "Mensajes", icon: MessageCircle },
  { id: "entregas", label: "Entregas", icon: Truck },
  { id: "pagos", label: "Pagos", icon: CreditCard },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

const EMPTY_SUMMARY: ClientPaymentSummary = { activeContracts: 0, monthlySpend: 0, nextChargeAt: null };

export function ClientDashboard({
  embedded = false,
  profile,
  solicitudes = [],
  payments = [],
  paymentSummary = EMPTY_SUMMARY,
  deliveries = [],
  onboarding = "completado",
}: {
  embedded?: boolean;
  // Hasta dónde llegó la guía de bienvenida; sin dato (la vista de ejemplo) no se muestra.
  onboarding?: OnboardingState;
  profile?: FreelancerProfile;
  solicitudes?: ClientSolicitud[];
  // null = el servidor falló al cargarlos (la sección lo avisa); si no se pasan, se muestran vacíos.
  payments?: PaymentRecord[] | null;
  paymentSummary?: ClientPaymentSummary | null;
  deliveries?: ContractDeliveries[] | null;
}) {
  const [activeSection, setActiveSection] = useState<ClientSectionId>("solicitudes");
  // Sin sesión real (la vista de ejemplo incrustada) no hay mensajes que consultar.
  const unreadMessages = useUnreadMessages(!embedded);
  // Las secciones sin contenido todavía se ven en el menú pero no se pueden abrir.
  const sidebarItems = menuItems.map((item) => ({
    ...item,
    ...(item.id === "mensajes" ? { badge: unreadMessages } : {}),
    disabled: ["inicio"].includes(item.id),
  }));

  // El cliente casi no tiene nada que configurar: su bienvenida es un solo aviso que se cierra y no vuelve.
  const guide = useOnboarding(onboarding);

  const { safeProfile, draftProfile, setDraftProfile } = useDraftProfile(
    profile,
    fallbackProfileData as FreelancerProfile,
  );

  const panelContent = useMemo(() => {
    switch (activeSection) {
      case "inicio":
        return <HomeSection profile={safeProfile} />;
      case "solicitudes":
        return <SolicitudesSection solicitudes={solicitudes} onGoToDeliveries={() => setActiveSection("entregas")} />;
      case "mensajes":
        return <MessagesSection />;
      case "entregas":
        return <DeliveriesSection contracts={deliveries} />;
      case "pagos":
        return <PaymentsSection payments={payments} summary={paymentSummary} />;
      case "configuracion":
        return <ConfigurationSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />;
      default:
        return null;
    }
  }, [activeSection, safeProfile, draftProfile, solicitudes, payments, paymentSummary, deliveries]);

  if (embedded) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <PanelBrandHeader className="mb-4" />

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <PanelSidebar
            menuItems={sidebarItems}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            className="rounded-xl bg-indigo-50 p-3"
          />

          <section className="rounded-xl bg-indigo-50 p-4">
            <div className="space-y-4">{panelContent}</div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <PanelMobileNav menuItems={sidebarItems} activeSection={activeSection} onSectionChange={setActiveSection} />
        <PanelSidebar
          menuItems={sidebarItems}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          showHeader
          className="w-full border-b border-slate-200 bg-white lg:w-[220px] lg:border-b-0 lg:border-r"
        />

        <main className="flex-1 p-4 sm:p-6">
          <div className="space-y-4">{panelContent}</div>
        </main>

        <WelcomeModal
          role="client"
          name={safeProfile.name}
          open={guide.state !== "completado"}
          onStart={() => {
            guide.advance("completado");
            window.location.assign("/");
          }}
          onLater={() => guide.advance("completado")}
        />
      </div>
    </div>
  );
}
