"use client";

import { useMemo, useState } from "react";
import {
  CreditCard,
  Inbox,
  LayoutGrid,
  MessageCircle,
  Settings,
  Star,
  Truck,
} from "lucide-react";
import { PanelBrandHeader } from "@/modules/panel/PanelBrandHeader";
import { PaymentsSection } from "@/modules/panel/freelancer/payments/PaymentsSection";
import { PanelSidebar } from "@/modules/panel/PanelSidebar";
import { ConfigurationSection } from "@/modules/panel/freelancer/configuracion/ConfigurationSection";
import { DeliveriesSection } from "@/modules/panel/freelancer/deliveries/DeliveriesSection";
import { HomeSection } from "@/modules/panel/freelancer/home/HomeSection";
import { MessagesSection } from "@/modules/panel/freelancer/messages/MessagesSection";
import { SolicitudesSection } from "@/modules/panel/freelancer/solicitudes/SolicitudesSection";
import { ReviewsSection } from "@/modules/panel/freelancer/reviews/ReviewsSection";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import type { FreelancerSectionId } from "@/types/freelancerSection";
import type { ContractDeliveries } from "@/types/deliveryApi";
import type { FreelancerPaymentSummary, PaymentRecord } from "@/types/payment";
import type { ReceivedSolicitud } from "@/types/receivedSolicitud";
import type { ReviewEntry } from "@/types/review";
import { useDraftProfile } from "@/hooks/useDraftProfile";
import fallbackProfileData from "@/data/exampleFreelancerProfile.json";

const menuItems: Array<{ id: FreelancerSectionId; label: string; icon: typeof LayoutGrid }> = [
  { id: "inicio", label: "Inicio", icon: LayoutGrid },
  { id: "solicitudes", label: "Solicitudes", icon: Inbox },
  { id: "mensajes", label: "Mensajes", icon: MessageCircle },
  { id: "entregas", label: "Entregas", icon: Truck },
  { id: "pagos", label: "Pagos", icon: CreditCard },
  { id: "reseñas", label: "Reseñas", icon: Star },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

const EMPTY_SUMMARY: FreelancerPaymentSummary = {
  commissionRate: 5,
  totalGross: 0,
  totalCommission: 0,
  totalNet: 0,
  activeContracts: 0,
  monthlyNet: 0,
  nextChargeAt: null,
};

export function FreelancerDashboard({
  embedded = false,
  profile,
  reviews = [],
  solicitudes = [],
  payments = [],
  paymentSummary = EMPTY_SUMMARY,
  deliveries = [],
}: {
  embedded?: boolean;
  profile?: FreelancerProfile;
  reviews?: ReviewEntry[];
  solicitudes?: ReceivedSolicitud[];
  // null = el servidor falló al cargarlos (la sección lo avisa); si no se pasan, se muestran vacíos.
  payments?: PaymentRecord[] | null;
  paymentSummary?: FreelancerPaymentSummary | null;
  deliveries?: ContractDeliveries[] | null;
}) {
  const [activeSection, setActiveSection] = useState<FreelancerSectionId>("inicio");

  const { safeProfile, draftProfile, setDraftProfile } = useDraftProfile(
    profile,
    fallbackProfileData as FreelancerProfile,
  );

  const panelContent = useMemo(() => {
    switch (activeSection) {
      case "inicio":
        return <HomeSection profile={safeProfile} />;
      case "solicitudes":
        return <SolicitudesSection solicitudes={solicitudes} />;
      case "mensajes":
        return <MessagesSection />;
      case "entregas":
        return <DeliveriesSection contracts={deliveries} />;
      case "pagos":
        return <PaymentsSection payments={payments} summary={paymentSummary} />;
      case "reseñas":
        return <ReviewsSection reviews={reviews} />;
      case "configuracion":
        return <ConfigurationSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />;
      default:
        return null;
    }
  }, [activeSection, safeProfile, reviews, draftProfile, solicitudes, payments, paymentSummary, deliveries]);

  if (embedded) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <PanelBrandHeader className="mb-4" />

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <PanelSidebar
            menuItems={menuItems}
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
        <PanelSidebar
          menuItems={menuItems}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          showHeader
          className="w-full border-b border-slate-200 bg-white lg:w-[220px] lg:border-b-0 lg:border-r"
        />

        <main className="flex-1 p-4 sm:p-6">
          <div className="space-y-4">{panelContent}</div>
        </main>
      </div>
    </div>
  );
}
