"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { ReviewEntry } from "@/types/review";
import {
  filterReviews,
  type ReviewRatingFilter,
  type ReviewSortOrder,
} from "@/lib/filterReviews";
import { computeRatingBreakdown } from "@/lib/computeRatingBreakdown";
import { Card } from "@/ui/Card";
import { Pagination } from "@/ui/Pagination";
import { ReviewsSummary } from "@/modules/perfil/ReviewsSummary";
import { ReviewsFilters } from "@/modules/perfil/ReviewsFilters";
import { ReviewCard } from "@/modules/perfil/ReviewCard";

const PAGE_SIZE = 6;

export function ReviewsTab({
  reviews,
  rating,
  showSummary = true,
  showFilters = true,
}: {
  reviews: ReviewEntry[];
  rating: number;
  showSummary?: boolean;
  showFilters?: boolean;
}) {
  const [ratingFilter, setRatingFilter] = useState<ReviewRatingFilter>("all");
  const [sortOrder, setSortOrder] = useState<ReviewSortOrder>("recent");
  const [currentPage, setCurrentPage] = useState(1);

  const breakdown = useMemo(() => computeRatingBreakdown(reviews), [reviews]);

  const filtered = useMemo(
    () => filterReviews(reviews, ratingFilter, "all", sortOrder),
    [reviews, ratingFilter, sortOrder],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageReviews = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  function handleRatingChange(next: ReviewRatingFilter) {
    setRatingFilter(next);
    setCurrentPage(1);
  }

  function handleSortOrderChange(next: ReviewSortOrder) {
    setSortOrder(next);
    setCurrentPage(1);
  }

  if (reviews.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Star className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500">Aún no hay reseñas.</p>
      </Card>
    );
  }

  return (
    <div className={`grid grid-cols-1 gap-6 ${showSummary ? "lg:grid-cols-[240px_1fr]" : ""}`}>
      {showSummary && (
        <ReviewsSummary rating={rating} reviewCount={reviews.length} breakdown={breakdown} />
      )}

      <div className="flex flex-col gap-4">
        {showFilters && (
          <ReviewsFilters
            ratingFilter={ratingFilter}
            onRatingChange={handleRatingChange}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
          />
        )}

        <Card className="flex flex-col">
          {pageReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </Card>

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-gray-500">
            Mostrando {rangeStart} a {rangeEnd} de {filtered.length} reseñas
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
