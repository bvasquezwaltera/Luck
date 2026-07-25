import { ClientDashboard } from "@/modules/panel/client/ClientDashboard";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import exampleProfileData from "@/data/exampleClientProfile.json";

const exampleProfile = exampleProfileData as FreelancerProfile;

export default function ClientPanelPage() {
  return <ClientDashboard profile={exampleProfile} />;
}
