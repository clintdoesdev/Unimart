"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "shadow-pill shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors duration-150",
        active
          ? "border-accent bg-accent text-white"
          : "border-border-card bg-white text-text-secondary hover:border-border-strong hover:text-text-primary",
        className
      )}
      {...props}
    />
  );
}
