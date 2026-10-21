import { FreelancerDashboard } from "@/modules/panel/freelancer/FreelancerDashboard";
import { requireRole } from "@/lib/api/server/requireRole";
import { getFreelancerProfile } from "@/lib/api/server/profile";
import { getReviews } from "@/lib/api/server/reviews";
import { getReceivedSolicitudes } from "@/lib/api/server/solicitudes";

export default async function FreelancerPanelPage() {
  const authProfile = await requireRole("freelancer");
  const [profile, reviews, solicitudes] = await Promise.all([
    getFreelancerProfile(authProfile.id),
    getReviews(authProfile.id),
    getReceivedSolicitudes(),
  ]);

  return <FreelancerDashboard profile={profile ?? undefined} reviews={reviews} solicitudes={solicitudes} />;
}
