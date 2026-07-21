import { describe, expect, it } from "vitest";
import { computeRatingBreakdown } from "@/lib/computeRatingBreakdown";
import type { ReviewEntry } from "@/types/review";

function makeReview(rating: number, id: string): ReviewEntry {
  return {
    id,
    reviewerName: "Reviewer",
    reviewerInitials: "RV",
    countryCode: "BR",
    country: "Brasil",
    rating,
    title: "Title",
    comment: "Comment",
    tags: [],
    service: "Desarrollo Web",
    dateValue: "2024-01",
    relativeDate: "Hace 1 mes",
  };
}

describe("computeRatingBreakdown", () => {
  it("counts reviews per star rating, including zero counts", () => {
    const reviews = [
      makeReview(5, "r-1"),
      makeReview(5, "r-2"),
      makeReview(4, "r-3"),
    ];

    expect(computeRatingBreakdown(reviews)).toEqual({ 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 });
  });

  it("returns all zeros for an empty list", () => {
    expect(computeRatingBreakdown([])).toEqual({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  });
});
