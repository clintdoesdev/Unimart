"use client";

import { Heart } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/ProductCard";
import { useSavedStore } from "@/store/saved";
import { LISTINGS } from "@/lib/mock-data";

function SavedContent() {
  const savedIds = useSavedStore((s) => s.ids);
  const savedListings = LISTINGS.filter((l) => savedIds.includes(l.id));

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Saved items" showBack={false} />
      {savedListings.length === 0 ? (
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
