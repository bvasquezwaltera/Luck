"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  CreditCard,
  LayoutGrid,
  MessageCircle,
  Settings,
  Star,
  Truck,
} from "lucide-react";
import { PanelBrandHeader } from "@/modules/panel/PanelBrandHeader";
import { PanelSidebar } from "@/modules/panel/PanelSidebar";
import { ConfigurationSection } from "@/modules/panel/freelancer/configuracion/ConfigurationSection";
import { DeliveriesSection } from "@/modules/panel/freelancer/deliveries/DeliveriesSection";
import { HomeSection } from "@/modules/panel/freelancer/home/HomeSection";
import { MessagesSection } from "@/modules/panel/freelancer/messages/MessagesSection";
import { PaymentsSection } from "@/modules/panel/freelancer/payments/PaymentsSection";
import { StatisticsSection } from "@/modules/panel/freelancer/statistics/StatisticsSection";
import { ReviewsSection } from "@/modules/panel/freelancer/reviews/ReviewsSection";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import type { FreelancerSectionId } from "@/types/freelancerSection";
import type { ReviewEntry } from "@/types/review";
import { useDraftProfile } from "@/hooks/useDraftProfile";
import fallbackProfileData from "@/data/exampleFreelancerProfile.json";

const menuItems: Array<{ id: FreelancerSectionId; label: string; icon: typeof LayoutGrid }> = [
  { id: "inicio", label: "Inicio", icon: LayoutGrid },
  { id: "mensajes", label: "Mensajes", icon: MessageCircle },
  { id: "entregas", label: "Entregas", icon: Truck },
  { id: "pagos", label: "Pagos", icon: CreditCard },
  { id: "estadisticas", label: "Estadísticas", icon: BarChart3 },
  { id: "reseñas", label: "Reseñas", icon: Star },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

export function FreelancerDashboard({
  embedded = false,
  profile,
  reviews = [],
}: {
  embedded?: boolean;
  profile?: FreelancerProfile;
  reviews?: ReviewEntry[];
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
      case "mensajes":
        return <MessagesSection />;
      case "entregas":
        return <DeliveriesSection />;
      case "pagos":
        return <PaymentsSection />;
      case "estadisticas":
        return <StatisticsSection />;
      case "reseñas":
        return <ReviewsSection reviews={reviews} />;
      case "configuracion":
        return <ConfigurationSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />;
      default:
        return null;
    }
  }, [activeSection, safeProfile, reviews, draftProfile]);

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
