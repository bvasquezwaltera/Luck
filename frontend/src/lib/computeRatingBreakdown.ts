import type { ReviewEntry } from "@/types/review";

export type RatingBreakdown = Record<1 | 2 | 3 | 4 | 5, number>;

export function computeRatingBreakdown(reviews: ReviewEntry[]): RatingBreakdown {
  const breakdown: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  for (const review of reviews) {
    const rating = review.rating as 1 | 2 | 3 | 4 | 5;
    if (rating in breakdown) {
      breakdown[rating] += 1;
    }
  }

  return breakdown;
}
