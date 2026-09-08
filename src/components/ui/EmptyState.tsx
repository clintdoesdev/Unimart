"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-tile">
        <Icon size={26} className="text-accent-text" />
      </div>
      <div>
        <p className="text-lg font-medium text-text-primary">{title}</p>
        <p className="mt-1 text-sm text-text-tertiary">{description}</p>
      </div>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-1 inline-flex h-9 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-white shadow-soft transition-colors duration-150 hover:bg-accent-text"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
