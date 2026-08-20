import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";
import type { Freelancer } from "@/types/freelancer";

export async function getFreelancerList(): Promise<Freelancer[]> {
  const response = await apiFetchServer("/api/freelancers");
  const { freelancers } = (await response.json()) as { freelancers: Freelancer[] };
  return freelancers;
}
