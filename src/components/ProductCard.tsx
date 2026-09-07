"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Listing } from "@/lib/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { useSavedStore } from "@/store/saved";
import { useAuthGuard } from "@/lib/auth";
import { cn } from "@/lib/cn";

export function ProductCard({ listing }: { listing: Listing }) {
  const saved = useSavedStore((s) => s.isSaved(listing.id));
  const toggle = useSavedStore((s) => s.toggle);
  const { requireAuth } = useAuthGuard();

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col gap-2 rounded-xl border border-transparent p-1.5 transition-colors hover:border-border-card"
    >
      <div className="relative">
        <ImagePlaceholder label="product shot" className="aspect-square w-full" />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            requireAuth(`/listing/${listing.id}`, () => toggle(listing.id));
          }}
          aria-label="Save listing"
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-bg/70 backdrop-blur"
        >
          <Heart size={16} className={cn(saved ? "fill-accent-text text-accent-text" : "text-text-secondary")} />
        </button>
      </div>
      <div>
        <p className="truncate text-[15px] leading-tight">{listing.title}</p>
        <p className="label-mono mt-0.5 truncate text-[10px] text-text-label">
          {listing.department} · {listing.location}
        </p>
        <p className="mt-1 text-accent-text">{listing.free ? "FREE" : `₹${listing.price}`}</p>
      </div>
    </Link>
  );
}
