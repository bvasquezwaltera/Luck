import type { ReviewEntry } from "@/types/review";

export type ReviewSortOrder = "recent" | "oldest";
export type ReviewRatingFilter = number | "all";

export function filterReviews(
  reviews: ReviewEntry[],
  rating: ReviewRatingFilter,
  service: string,
  sortOrder: ReviewSortOrder,
): ReviewEntry[] {
  const filtered = reviews.filter((review) => {
    const matchesRating = rating === "all" || review.rating === rating;
    const matchesService = service === "all" || review.service === service;
    return matchesRating && matchesService;
  });

  const sorted = [...filtered].sort((a, b) => a.dateValue.localeCompare(b.dateValue));

  return sortOrder === "recent" ? sorted.reverse() : sorted;
}
