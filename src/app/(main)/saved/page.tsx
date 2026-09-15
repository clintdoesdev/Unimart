"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { apiGet } from "@/lib/api";
import type { Listing } from "@/lib/types";

function SavedContent() {
  const [savedListings, setSavedListings] = useState<Listing[] | null>(null);

  useEffect(() => {
    apiGet<{ listings: Listing[] }>("/api/saved").then((r) => setSavedListings(r.listings));
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Saved items" showBack={false} />
      {savedListings === null ? (
        <p className="py-10 text-center text-sm text-text-tertiary">Loading...</p>
      ) : savedListings.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap the heart on any listing to save it for later."
          ctaLabel="Browse listings"
          ctaHref="/home"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5 py-5 lg:grid-cols-4 lg:px-6 lg:py-6">
          {savedListings.map((l) => (
            <ProductCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SavedPage() {
  return (
    <AuthGate>
      <SavedContent />
    </AuthGate>
  );
}
