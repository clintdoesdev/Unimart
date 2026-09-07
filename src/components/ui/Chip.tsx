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
        "label-mono shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-[11px] transition-colors duration-150",
        active
          ? "border-accent bg-accent text-white"
          : "border-border-input bg-surface text-text-secondary hover:border-border-strong",
        className
      )}
      {...props}
    />
  );
}
