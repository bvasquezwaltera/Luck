import { describe, expect, it } from "vitest";
import { filterReviews } from "@/lib/filterReviews";
import type { ReviewEntry } from "@/types/review";

function makeReview(overrides: Partial<ReviewEntry>): ReviewEntry {
  return {
    id: "r-1",
    reviewerName: "Reviewer",
    reviewerInitials: "RV",
    countryCode: "BR",
    country: "Brasil",
    rating: 5,
    title: "Title",
    comment: "Comment",
    tags: [],
    service: "Desarrollo Web",
    dateValue: "2024-01",
    relativeDate: "Hace 1 mes",
    ...overrides,
  };
}

const reviews: ReviewEntry[] = [
  makeReview({ id: "r-1", rating: 5, service: "Desarrollo Web", dateValue: "2024-05" }),
  makeReview({ id: "r-2", rating: 4, service: "API REST", dateValue: "2024-01" }),
  makeReview({ id: "r-3", rating: 5, service: "Desarrollo Web", dateValue: "2024-03" }),
];

describe("filterReviews", () => {
  it("returns all reviews sorted by most recent when filters are 'all'", () => {
    const result = filterReviews(reviews, "all", "all", "recent");
    expect(result.map((r) => r.id)).toEqual(["r-1", "r-3", "r-2"]);
  });

  it("filters by rating", () => {
    const result = filterReviews(reviews, 4, "all", "recent");
    expect(result.map((r) => r.id)).toEqual(["r-2"]);
  });

  it("filters by service", () => {
    const result = filterReviews(reviews, "all", "Desarrollo Web", "recent");
    expect(result.map((r) => r.id)).toEqual(["r-1", "r-3"]);
  });

  it("sorts by oldest first when requested", () => {
    const result = filterReviews(reviews, "all", "all", "oldest");
    expect(result.map((r) => r.id)).toEqual(["r-2", "r-3", "r-1"]);
  });

  it("combines rating and service filters", () => {
    const result = filterReviews(reviews, 5, "Desarrollo Web", "recent");
    expect(result.map((r) => r.id)).toEqual(["r-1", "r-3"]);
  });
});
