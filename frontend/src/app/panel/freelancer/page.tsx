import { FreelancerDashboard } from "@/modules/panel/freelancer/FreelancerDashboard";
import { requireRole } from "@/lib/api/server/requireRole";
import { getFreelancerProfile } from "@/lib/api/server/profile";
import { getReviews } from "@/lib/api/server/reviews";
import { getFreelancerPaymentSummary, getReceivedPayments } from "@/lib/api/server/payments";
import { getReceivedSolicitudes } from "@/lib/api/server/solicitudes";

export default async function FreelancerPanelPage() {
  const authProfile = await requireRole("freelancer");
  const [profile, reviews, solicitudes, payments, paymentSummary] = await Promise.all([
    getFreelancerProfile(authProfile.id),
    getReviews(authProfile.id),
    getReceivedSolicitudes(),
    getReceivedPayments(),
    getFreelancerPaymentSummary(),
  ]);

  return <FreelancerDashboard profile={profile ?? undefined} reviews={reviews}
      solicitudes={solicitudes}
      payments={payments}
      paymentSummary={paymentSummary}
    />;
}
