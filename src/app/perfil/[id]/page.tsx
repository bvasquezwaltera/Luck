import { notFound } from "next/navigation";
import { PerfilPageClient } from "@/modules/perfil/PerfilPageClient";
import { getPortfolioProjects } from "@/server/portfolioProjects/actions";
import { getFreelancerProfile } from "@/server/profile/actions";
import { getReviews } from "@/server/reviews/actions";
import { getSubscriptionPlans } from "@/server/subscriptionPlans/actions";

export default async function PerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, plans, projects, reviews] = await Promise.all([
    getFreelancerProfile(id),
    getSubscriptionPlans(id),
    getPortfolioProjects(id),
    getReviews(id),
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
    />
  );
}
