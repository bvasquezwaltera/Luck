import { Select } from "@/ui/Select";
import type { ReviewRatingFilter, ReviewSortOrder } from "@/lib/filterReviews";

export function ReviewsFilters({
  ratingFilter,
  onRatingChange,
  sortOrder,
  onSortOrderChange,
}: {
  ratingFilter: ReviewRatingFilter;
  onRatingChange: (rating: ReviewRatingFilter) => void;
  sortOrder: ReviewSortOrder;
  onSortOrderChange: (order: ReviewSortOrder) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Select
        value={ratingFilter === "all" ? "all" : String(ratingFilter)}
        onChange={(e) =>
          onRatingChange(e.target.value === "all" ? "all" : Number(e.target.value))
        }
      >
        <option value="all">Todas las reseñas</option>
        <option value="5">5 estrellas</option>
        <option value="4">4 estrellas</option>
        <option value="3">3 estrellas</option>
        <option value="2">2 estrellas</option>
        <option value="1">1 estrella</option>
      </Select>

      <Select
        value={sortOrder}
        onChange={(e) => onSortOrderChange(e.target.value as ReviewSortOrder)}
        className="w-full sm:w-auto"
      >
        <option value="recent">Más recientes</option>
        <option value="oldest">Más antiguos</option>
      </Select>
    </div>
  );
}
