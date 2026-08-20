import "server-only";
import { apiFetchServer } from "@/lib/api/server/httpServer";
import type { ReviewEntry } from "@/types/review";

export async function getReviews(freelancerId: string): Promise<ReviewEntry[]> {
  const response = await apiFetchServer(`/api/reviews/${freelancerId}`);
  const { reviews } = (await response.json()) as { reviews: ReviewEntry[] };
  return reviews;
}
