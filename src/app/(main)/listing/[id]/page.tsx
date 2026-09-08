"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { ChevronLeft, Heart, MessageCircle } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { DashedPanel } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ProductCard";
import {
  LISTINGS,
  conditionLabel,
  getListing,
  getSeller,
  handoverLabel,
} from "@/lib/mock-data";
import { useSavedStore } from "@/store/saved";
import { useCartStore } from "@/store/cart";
import { useChatStore } from "@/store/chat";
import { useAuthGuard } from "@/lib/auth";
import { cn } from "@/lib/cn";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const listing = getListing(params.id);
  const { requireAuth } = useAuthGuard();
  const saved = useSavedStore((s) => (listing ? s.isSaved(listing.id) : false));
  const toggleSaved = useSavedStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const startOrGetConversation = useChatStore((s) => s.startOrGetConversation);
  const [activePhoto, setActivePhoto] = useState(0);
  const [added, setAdded] = useState(false);

  const related = useMemo(() => {
    if (!listing) return [];
    return LISTINGS.filter((l) => l.department === listing.department && l.id !== listing.id).slice(0, 4);
  }, [listing]);

  if (!listing) {
    notFound();
  }

  const seller = getSeller(listing.sellerId)!;
  const photoCount = listing.photos;

  function onMessage() {
    requireAuth(`/listing/${listing!.id}`, () => {
      const convId = startOrGetConversation(listing!.sellerId, listing!.id);
      router.push(`/chats/${convId}`);
    });
  }

  function onAddToCart() {
    requireAuth(`/listing/${listing!.id}`, () => {
      addItem(listing!.id, listing!.sellerId);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    });
  }

  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-8">
      {/* Mobile header */}
      <header className="flex h-14 shrink-0 items-center justify-between px-4 lg:hidden">
        <button onClick={() => router.back()} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary">
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => requireAuth(`/listing/${listing.id}`, () => toggleSaved(listing.id))}
          aria-label="Save"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary"
        >
          <Heart size={20} className={saved ? "fill-accent-text text-accent-text" : ""} />
        </button>
      </header>

      {/* Desktop breadcrumb */}
      <div className="label-mono hidden px-6 pt-6 text-[11px] text-text-label lg:block">
        <Link href="/home" className="hover:text-text-primary">HOME</Link> /{" "}
        <Link href={`/search?category=${listing.category}`} className="hover:text-text-primary">
          {listing.category.replace("-", " ").toUpperCase()}
        </Link>{" "}
        / {listing.title.toUpperCase()}
      </div>

      <div className="lg:grid lg:grid-cols-[120px_320px_1fr] lg:gap-6 lg:px-6 lg:py-6">
        {/* Desktop thumbnail strip */}
        <div className="hidden flex-col gap-3 lg:flex">
          {Array.from({ length: photoCount }).map((_, i) => (
            <button key={i} onClick={() => setActivePhoto(i)}>
              <ImagePlaceholder
                label={`photo ${i + 1}`}
                className={cn("h-24 w-full", activePhoto === i && "border-accent")}
              />
            </button>
          ))}
        </div>

        {/* Gallery */}
        <div className="px-5 pt-4 lg:px-0 lg:pt-0">
          <div className="relative">
            <ImagePlaceholder label={`gallery — ${photoCount} photos`} className="aspect-[4/3] w-full lg:h-[300px] lg:w-[320px]" />
            <span className="label-mono absolute bottom-3 right-3 rounded-full bg-white/90 px-2 py-1 text-[10px] shadow-soft">
              {activePhoto + 1}/{photoCount}
            </span>
          </div>
          <div className="mt-3 flex justify-center gap-1.5 lg:hidden">
            {Array.from({ length: photoCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={cn("h-1.5 w-1.5 rounded-full", i === activePhoto ? "bg-accent" : "bg-placeholder-primary")}
              />
            ))}
          </div>
        </div>

        {/* Info column */}
        <div className="flex flex-col gap-5 px-5 pt-5 lg:px-0 lg:pt-0">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-2xl leading-tight">{listing.title}</h1>
            <p className="shrink-0 text-2xl text-accent-text">{listing.free ? "FREE" : `₹${listing.price}`}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="label-mono rounded-full bg-placeholder-primary px-3 py-1 text-[10px] text-text-secondary">
              {conditionLabel(listing.condition)}
            </span>
            <span className="label-mono rounded-full bg-placeholder-primary px-3 py-1 text-[10px] text-text-secondary">
              {listing.department}
            </span>
          </div>

          {/* Desktop buy panel */}
          <div className="hidden rounded-xl border border-border-card bg-card shadow-soft p-5 lg:sticky lg:top-20 lg:block">
            <p className="text-2xl text-accent-text">{listing.free ? "FREE" : `₹${listing.price}`}</p>
            <p className="mt-1 text-sm text-text-tertiary">Free campus pickup available</p>
            <div className="mt-4 flex gap-2.5">
              <Button fullWidth onClick={onAddToCart}>
                {added ? "Added ✓" : "Add to cart"}
              </Button>
              <button
                onClick={() => requireAuth(`/listing/${listing.id}`, () => toggleSaved(listing.id))}
                aria-label="Save"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-strong"
              >
                <Heart size={18} className={saved ? "fill-accent-text text-accent-text" : "text-text-secondary"} />
              </button>
            </div>
            <button
              onClick={onMessage}
              className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border-strong text-[15px]"
            >
              <MessageCircle size={16} />
              Message seller
            </button>
          </div>

          <p className="text-[15px] leading-relaxed text-text-secondary">{listing.description}</p>

          <DashedPanel>
            <p className="label-mono text-[11px] text-text-label">PICKUP WINDOW</p>
            <p className="mt-1 text-sm text-text-secondary">
              Available for {listing.handover.map(handoverLabel).join(", ")}
            </p>
          </DashedPanel>

          <Link
            href={`/seller/${seller.id}`}
            className="flex items-center gap-3 rounded-xl border border-border-card bg-card shadow-soft p-3.5"
          >
            <Avatar name={seller.name} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px]">
                {seller.name} <span className="text-text-tertiary">· Yr {seller.year}</span>
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-tertiary">
                <RatingStars rating={seller.rating} size={12} />
                <span>
                  {seller.rating} · {seller.salesCount} sales {seller.verified && "· Verified ✓"}
                </span>
              </div>
            </div>
            <span className="label-mono text-[11px] text-accent-text">VIEW</span>
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-6 px-5 lg:px-6">
          <h2 className="mb-3 text-lg">More from this department</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((l) => (
              <ProductCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky mobile action bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 flex items-center gap-2.5 border-t border-border-hairline bg-surface px-4 py-3 lg:hidden">
        <button
          onClick={() => requireAuth(`/listing/${listing.id}`, () => toggleSaved(listing.id))}
          aria-label="Save"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-strong"
        >
          <Heart size={18} className={saved ? "fill-accent-text text-accent-text" : "text-text-secondary"} />
        </button>
        <button
          onClick={onMessage}
          className="h-11 flex-1 rounded-xl border border-border-strong text-[15px]"
        >
          Message
        </button>
        <Button className="h-11 flex-[1.4]" onClick={onAddToCart}>
          {added ? "Added ✓" : "Add to cart"}
        </Button>
      </div>
    </div>
  );
}
