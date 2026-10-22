"use client";

import { useState } from "react";
import { Header } from "@/modules/inicio/Header";
import { Breadcrumb } from "@/modules/perfil/Breadcrumb";
import { ProfileHeader } from "@/modules/perfil/ProfileHeader";
import { ProfileTabs } from "@/modules/perfil/ProfileTabs";
import { AboutTab } from "@/modules/perfil/AboutTab";
import { ProfileSidebar } from "@/modules/perfil/ProfileSidebar";
import { PortfolioTab } from "@/modules/perfil/PortfolioTab";
import { ReviewsTab } from "@/modules/perfil/ReviewsTab";
import { RequestPlanDrawer, type ViewerRole } from "@/modules/perfil/RequestPlanDrawer";
import { SubscriptionsTab } from "@/modules/perfil/SubscriptionsTab";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import type { PortfolioProject } from "@/types/portfolioProject";
import type { ProfileTab } from "@/types/profileTab";
import type { ReviewEntry } from "@/types/review";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";

export function PerfilPageClient({
  profile,
  reviews,
  projects,
  plans,
  viewerRole,
  initialPlanId = null,
}: {
  profile: FreelancerProfile;
  reviews: ReviewEntry[];
  projects: PortfolioProject[];
  plans: SubscriptionPlan[];
  viewerRole: ViewerRole;
  initialPlanId?: string | null;
}) {
  // Si se llegó con ?plan= (p. ej. al volver del login), se abre ese plan directamente.
  const initialPlan = plans.find((plan) => plan.id === initialPlanId) ?? null;
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialPlan ? "suscripciones" : "sobre-mi");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(initialPlan);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4">
          <Breadcrumb category={profile.category} name={profile.name} />
        </div>

        <div className="mb-6">
          <ProfileHeader profile={profile} />
        </div>

        <ProfileTabs activeTab={activeTab} onChange={setActiveTab} reviewCount={profile.reviewCount} />

        <div className="mt-6">
          {activeTab === "sobre-mi" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
              <AboutTab profile={profile} />
              <ProfileSidebar profile={profile} />
            </div>
          )}
          {activeTab === "portafolio" && (
            <PortfolioTab projects={projects} email={profile.email} />
          )}
          {activeTab === "resenas" && <ReviewsTab reviews={reviews} rating={profile.rating} />}
          {activeTab === "suscripciones" && <SubscriptionsTab plans={plans} onChoosePlan={setSelectedPlan} />}
        </div>
      </main>

      <RequestPlanDrawer
        plan={selectedPlan}
        freelancer={profile}
        viewerRole={viewerRole}
        onClose={() => setSelectedPlan(null)}
      />
    </div>
  );
}
