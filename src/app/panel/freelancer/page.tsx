import { FreelancerDashboard } from "@/modules/panel/freelancer/FreelancerDashboard";
import { requireRole } from "@/server/auth/requireRole";
import { getFreelancerProfile } from "@/server/profile/actions";
import { getReviews } from "@/server/reviews/actions";

export default async function FreelancerPanelPage() {
  const authProfile = await requireRole("freelancer");
  const [profile, reviews] = await Promise.all([
    getFreelancerProfile(authProfile.id),
    getReviews(authProfile.id),
  ]);

  return <FreelancerDashboard profile={profile ?? undefined} reviews={reviews} />;
}
