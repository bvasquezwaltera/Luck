import { Star, BadgeCheck } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import type { ReviewEntry } from "@/types/review";
import { Avatar } from "@/ui/Avatar";
import { Badge } from "@/ui/Badge";

export function ReviewCard({ review }: { review: ReviewEntry }) {
  const Flag = Flags[review.countryCode as keyof typeof Flags];

  return (
    <div className="flex flex-col gap-3 border-b border-gray-100 py-5 first:pt-0 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar initials={review.reviewerInitials} name={review.reviewerName} />
          <div>
            <p className="flex items-center gap-1 text-xs font-semibold text-gray-900">
              {review.reviewerName}
              <BadgeCheck className="h-3.5 w-3.5 text-indigo-500" />
            </p>
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              {Flag && <Flag className="h-3 w-4 rounded-[1px]" />}
              {review.country}
            </p>
          </div>
        </div>
        <p className="shrink-0 text-right text-[11px] text-gray-400">{review.relativeDate}</p>
      </div>

      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i < review.rating ? "fill-amber-500 text-amber-500" : "text-gray-200"
            }`}
          />
        ))}
        <span className="ml-1 text-xs font-semibold text-gray-700">
          {review.rating.toFixed(1)}
        </span>
      </div>

      <p className="text-sm font-bold text-gray-900">{review.title}</p>
      <p className="text-xs leading-relaxed text-gray-600">{review.comment}</p>

      <div className="flex flex-wrap gap-2">
        {review.tags.map((tag) => (
          <Badge key={tag} className="!border !border-gray-200 !bg-white">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
