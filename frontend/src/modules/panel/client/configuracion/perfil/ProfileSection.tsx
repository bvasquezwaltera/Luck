import type { Dispatch, SetStateAction } from "react";
import { EditProfileSection } from "@/modules/panel/client/configuracion/perfil/EditProfileSection";
import type { FreelancerProfile } from "@/types/freelancerProfile";

export function ProfileSection({
  draftProfile,
  setDraftProfile,
}: {
  draftProfile: FreelancerProfile;
  setDraftProfile: Dispatch<SetStateAction<FreelancerProfile>>;
}) {
  return <EditProfileSection draftProfile={draftProfile} setDraftProfile={setDraftProfile} />;
}
