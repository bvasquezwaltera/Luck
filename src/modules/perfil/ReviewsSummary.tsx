import { Star, ShieldCheck } from "lucide-react";
import type { RatingBreakdown } from "@/lib/computeRatingBreakdown";
import { Card } from "@/ui/Card";
import { InfoCard } from "@/ui/InfoCard";

const STARS: (1 | 2 | 3 | 4 | 5)[] = [5, 4, 3, 2, 1];

export function ReviewsSummary({
  rating,
  reviewCount,
  breakdown,
}: {
  rating: number;
  reviewCount: number;
  breakdown: RatingBreakdown;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-center gap-1 text-center">
        <p className="text-4xl font-bold text-gray-900">{rating.toFixed(1)}</p>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
          ))}
        </div>
        <p className="text-xs text-gray-500">Basado en {reviewCount} reseñas</p>

        <div className="mt-4 flex w-full flex-col gap-1.5">
          {STARS.map((star) => {
            const count = breakdown[star];
            const percentage = reviewCount === 0 ? 0 : Math.round((count / reviewCount) * 100);
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-16 shrink-0 text-left">{star} estrellas</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <span
                    className="block h-full rounded-full bg-amber-500"
                    style={{ width: `${percentage}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <InfoCard
        icon={<ShieldCheck className="h-6 w-6 shrink-0 text-indigo-600" />}
        label="Reseñas verificadas"
        description="Todas las reseñas provienen de proyectos completados en Luck."
        className="!items-start border-indigo-100 !bg-indigo-50"
      />
    </div>
  );
}
