"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, BadgeCheck } from "lucide-react";
import type { Listing } from "@/lib/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { apiPost } from "@/lib/api";
import { useAuthGuard } from "@/lib/auth";
import { cn } from "@/lib/cn";

export function ProductCard({
  listing,
  onToggleSaved,
}: {
  listing: Listing;
  onToggleSaved?: (saved: boolean) => void;
}) {
  const [saved, setSaved] = useState(!!listing.saved);
  const { requireAuth } = useAuthGuard();

  async function toggleSaved() {
    const next = !saved;
    setSaved(next);
    onToggleSaved?.(next);
    try {
      const res = await apiPost<{ saved: boolean }>(`/api/saved/${listing.id}`);
      setSaved(res.saved);
    } catch {
      setSaved(!next);
    }
  }

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="flex flex-col gap-3 rounded-[28px] bg-card p-2 shadow-soft transition-shadow hover:shadow-elevated"
    >
      <div className="relative">
        <ImagePlaceholder label="product shot" className="aspect-square w-full" rounded="rounded-[20px]" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            requireAuth(`/listing/${listing.id}`, toggleSaved);
          }}
          aria-label="Save listing"
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-pill backdrop-blur"
        >
          <Heart size={16} className={cn(saved ? "fill-accent text-accent" : "text-text-secondary")} />
        </button>
        {listing.seller.vendor && (
          <span className="label-mono absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[9px] text-accent shadow-pill">
            <BadgeCheck size={11} />
            VENDOR
          </span>
        )}
      </div>
      <div className="px-1.5 pb-2">
        <p className="truncate text-sm font-semibold tracking-tight text-text-primary">{listing.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-text-secondary">
          {listing.department} · {listing.location}
        </p>
        <p className="mt-1 text-sm font-medium text-accent">{listing.free ? "FREE" : `₹${listing.price}`}</p>
      </div>
    </Link>
  );
}
