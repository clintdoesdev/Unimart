"use client";

import { cn } from "@/lib/cn";

export function ImagePlaceholder({
  label,
  className,
  rounded = "rounded-xl",
}: {
  label?: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={cn(
        "img-placeholder flex items-center justify-center overflow-hidden border border-border-card",
        rounded,
        className
      )}
    >
      {label && (
        <span className="label-mono px-2 text-center text-[10px] text-text-label">
          {label}
        </span>
      )}
    </div>
  );
}
