import { ClientDashboard } from "@/modules/panel/client/ClientDashboard";
import { requireRole } from "@/lib/api/server/requireRole";
import { getClientProfile } from "@/lib/api/server/clientProfile";
import type { FreelancerProfile } from "@/types/freelancerProfile";
import exampleProfileData from "@/data/exampleClientProfile.json";

const exampleProfile = exampleProfileData as FreelancerProfile;

export default async function ClientPanelPage() {
  const authProfile = await requireRole("client");
  const clientProfile = await getClientProfile();

  // Los datos reales del cliente (nombre, email, país, zona horaria) pisan el
  // perfil de ejemplo; el resto del panel todavía no tiene backend.
  const profile: FreelancerProfile = {
    ...exampleProfile,
    id: authProfile.id,
    name: clientProfile?.name ?? authProfile.nombre_completo,
    email: clientProfile?.email ?? "",
    initials: clientProfile?.initials ?? exampleProfile.initials,
    country: clientProfile?.country ?? "",
    countryCode: clientProfile?.countryCode ?? "",
    timezone: clientProfile?.timezone ?? "",
  };

  return <ClientDashboard profile={profile} />;
}
