import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";
import type { FreelancerProfile } from "@/types/freelancerProfile";

export async function getFreelancerProfile(freelancerId: string): Promise<FreelancerProfile | null> {
  const response = await apiFetchServer(`/api/profile/${freelancerId}`);
  const { profile } = (await response.json()) as { profile: FreelancerProfile | null };
  return profile;
}
