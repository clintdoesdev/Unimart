"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function RatingStars({
  rating,
  size = 14,
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          className={cn(!interactive && "cursor-default")}
        >
          <Star
            size={size}
            className={i <= Math.round(rating) ? "fill-accent-text text-accent-text" : "text-text-faint"}
          />
        </button>
      ))}
    </div>
  );
}
