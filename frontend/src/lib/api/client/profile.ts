import { apiFetch } from "@/lib/api/httpClient";
import type { FreelancerProfile } from "@/types/freelancerProfile";

export async function saveFreelancerProfile(
  freelancerId: string,
  profile: FreelancerProfile,
): Promise<{ error?: string }> {
  const response = await apiFetch(`/api/profile/${freelancerId}`, {
    method: "POST",
    body: JSON.stringify(profile),
  });
  return response.json();
}
