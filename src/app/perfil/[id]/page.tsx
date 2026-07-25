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
import { SubscriptionsTab } from "@/modules/perfil/SubscriptionsTab";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import type { PortfolioProject } from "@/types/portfolioProject";
import type { ProfileTab } from "@/types/profileTab";
import type { ReviewEntry } from "@/types/review";
import type { SubscriptionPlan } from "@/types/subscriptionPlan";
import exampleProfileData from "@/data/exampleFreelancerProfile.json";
import exampleProjectsData from "@/data/exampleFreelancerProjects.json";
import subscriptionPlansData from "@/data/subscriptionPlans.json";
import reviewsData from "@/data/reviews.json";

const exampleReviews = reviewsData as ReviewEntry[];
const examplePlans = subscriptionPlansData as SubscriptionPlan[];
const exampleProfile = exampleProfileData as FreelancerProfile;
const exampleProjects = exampleProjectsData as PortfolioProject[];

export default function PerfilPage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("sobre-mi");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4">
          <Breadcrumb category={exampleProfile.category} name={exampleProfile.name} />
        </div>

        <div className="mb-6">
          <ProfileHeader profile={exampleProfile} />
        </div>

        <ProfileTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          reviewCount={exampleProfile.reviewCount}
        />

        <div className="mt-6">
          {activeTab === "sobre-mi" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
              <AboutTab profile={exampleProfile} />
              <ProfileSidebar profile={exampleProfile} />
            </div>
          )}
          {activeTab === "portafolio" && (
            <PortfolioTab projects={exampleProjects} email={exampleProfile.email} />
          )}
          {activeTab === "resenas" && (
            <ReviewsTab reviews={exampleReviews} rating={exampleProfile.rating} />
          )}
          {activeTab === "suscripciones" && <SubscriptionsTab plans={examplePlans} />}
        </div>
      </main>
    </div>
  );
}
