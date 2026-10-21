import { notFound } from "next/navigation";
import { PerfilPageClient } from "@/modules/perfil/PerfilPageClient";
import { getPortfolioProjects } from "@/lib/api/server/portfolioProjects";
import { getViewerRole } from "@/lib/api/server/currentUser";
import { getFreelancerProfile } from "@/lib/api/server/profile";
import { getReviews } from "@/lib/api/server/reviews";
import { getSubscriptionPlans } from "@/lib/api/server/subscriptionPlans";

export default async function PerfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { plan } = await searchParams;
  const [profile, plans, projects, reviews, viewerRole] = await Promise.all([
    getFreelancerProfile(id),
    getSubscriptionPlans(id),
    getPortfolioProjects(id),
    getReviews(id),
    getViewerRole(),
  ]);

  if (!profile) {
    notFound();
  }

  // getSubscriptionPlans rellena los 3 niveles con plantillas en blanco para
  // que el editor de Configuración siempre tenga algo que mostrar; en la
  // página pública solo deben verse los planes que el freelancer guardó.
  const savedPlans = plans.filter((plan) => !plan.id.startsWith("nuevo-"));

  return (
    <PerfilPageClient
      profile={profile}
      reviews={reviews}
      projects={projects}
      plans={savedPlans}
      viewerRole={viewerRole}
      initialPlanId={typeof plan === "string" ? plan : null}
    />
  );
}
