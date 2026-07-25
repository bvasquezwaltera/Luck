"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Calendar } from "lucide-react";
import { PanelSectionHeader } from "@/modules/panel/PanelSectionHeader";
import { ReviewCard } from "@/modules/panel/freelancer/reviews/ReviewCard";
import type { ReviewEntry } from "@/types/review";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Select } from "@/ui/Select";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatDateValue(dateValue: string) {
  const [year, month] = dateValue.split("-");
  return `${MONTH_LABELS[Number(month) - 1]} ${year}`;
}

type SortOrder = "recent" | "oldest";

export function ReviewsSection({ reviews }: { reviews: ReviewEntry[] }) {
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const availableDates = useMemo(
    () => Array.from(new Set(reviews.map((review) => review.dateValue))).sort(),
    [reviews],
  );

  const visibleReviews = useMemo(() => {
    const filtered = reviews.filter((review) => {
      const afterFrom = !dateFrom || review.dateValue >= dateFrom;
      const beforeTo = !dateTo || review.dateValue <= dateTo;
      return afterFrom && beforeTo;
    });

    const sorted = [...filtered].sort((a, b) => a.dateValue.localeCompare(b.dateValue));
    return sortOrder === "recent" ? sorted.reverse() : sorted;
  }, [reviews, sortOrder, dateFrom, dateTo]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <PanelSectionHeader subtitle="Bienvenido de nuevo" title="Reseñas" />
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Select
          aria-label="Orden"
          icon={<ArrowUpDown className="h-3.5 w-3.5" />}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value as SortOrder)}
          className="w-auto"
        >
          <option value="recent">Más recientes</option>
          <option value="oldest">Más antiguas</option>
        </Select>

        <Select
          aria-label="Desde"
          icon={<Calendar className="h-3.5 w-3.5" />}
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          className="w-auto"
        >
          <option value="">Desde</option>
          {availableDates.map((date) => (
            <option key={date} value={date}>
              {formatDateValue(date)}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Hasta"
          icon={<Calendar className="h-3.5 w-3.5" />}
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          className="w-auto"
        >
          <option value="">Hasta</option>
          {availableDates.map((date) => (
            <option key={date} value={date}>
              {formatDateValue(date)}
            </option>
          ))}
        </Select>

        {(sortOrder !== "recent" || dateFrom || dateTo) && (
          <Button
            variant="outline-neutral"
            className="!min-w-0 !px-3"
            onClick={() => {
              setSortOrder("recent");
              setDateFrom("");
              setDateTo("");
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      <Card className="flex flex-col">
        {visibleReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            reply={replies[review.id]}
            onSaveReply={(reviewId, reply) =>
              setReplies((current) => ({ ...current, [reviewId]: reply }))
            }
          />
        ))}
      </Card>
    </div>
  );
}
