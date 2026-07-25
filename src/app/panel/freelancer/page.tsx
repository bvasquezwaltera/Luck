import { FreelancerDashboard } from "@/modules/panel/freelancer/FreelancerDashboard";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import type { ReviewEntry } from "@/types/review";
import exampleProfileData from "@/data/exampleFreelancerProfile.json";
import reviewsData from "@/data/reviews.json";

const exampleProfile = exampleProfileData as FreelancerProfile;
const exampleReviews = reviewsData as ReviewEntry[];

export default function FreelancerPanelPage() {
  return <FreelancerDashboard profile={exampleProfile} reviews={exampleReviews} />;
}
