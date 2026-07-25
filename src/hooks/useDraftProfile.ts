import { useState } from "react";
import type { FreelancerProfile } from "@/types/freelancerProfile";

const BLANK_PROFILE: FreelancerProfile = {
  id: "",
  name: "",
  email: "",
  initials: "",
  rating: 0,
  reviewCount: 0,
  specialty: "",
  category: "",
  country: "",
  countryCode: "",
  timezone: "",
  online: false,
  languages: [],
  skills: [],
  badges: { successRate: 0, topRated: false, avgResponseTime: "" },
  stats: { completedProjects: 0, hoursWorked: 0, repeatClients: 0, memberSince: "", lastDelivery: "" },
  bio: "",
  differentiators: [],
  experience: [{ period: "", role: "", company: "", description: "" }],
  education: [{ period: "", degree: "", institution: "" }],
  tools: [],
  availabilityStatus: "",
  workMethods: { communication: [], projectManagement: [], versionControl: [] },
};

export function useDraftProfile(profile: FreelancerProfile | undefined, fallback: FreelancerProfile) {
  const safeProfile = profile ?? fallback;
  const [draftProfile, setDraftProfile] = useState<FreelancerProfile>(BLANK_PROFILE);

  return { safeProfile, draftProfile, setDraftProfile };
}
