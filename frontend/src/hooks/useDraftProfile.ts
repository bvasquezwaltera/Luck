import { useState } from "react";
import type { FreelancerProfile } from "@/types/freelancerProfile";

export function useDraftProfile(profile: FreelancerProfile | undefined, fallback: FreelancerProfile) {
  const safeProfile = profile ?? fallback;
  const [draftProfile, setDraftProfile] = useState<FreelancerProfile>(safeProfile);

  return { safeProfile, draftProfile, setDraftProfile };
}
