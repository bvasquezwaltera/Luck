import { ClientDashboard } from "@/modules/panel/client/ClientDashboard";
import { requireRole } from "@/lib/api/server/requireRole";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import exampleProfileData from "@/data/exampleClientProfile.json";

const exampleProfile = exampleProfileData as FreelancerProfile;

export default async function ClientPanelPage() {
  const profile = await requireRole("client");

  return <ClientDashboard profile={{ ...exampleProfile, name: profile.nombre_completo }} />;
}
