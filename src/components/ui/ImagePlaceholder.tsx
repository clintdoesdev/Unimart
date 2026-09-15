"use client";

import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function ImagePlaceholder({
  label,
  className,
  rounded = "rounded-[20px]",
}: {
  label?: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      className={cn(
        "img-placeholder flex flex-col items-center justify-center gap-2 overflow-hidden",
        rounded,
        className
      )}
    >
      <ImageIcon size={22} strokeWidth={1.5} className="text-text-faint" />
      {label && (
        <span className="px-2 text-center text-[11px] font-medium text-text-faint">
          {label}
        </span>
      )}
    </div>
  );
}
