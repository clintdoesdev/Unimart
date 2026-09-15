"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Heart, MessageCircle } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { DashedPanel } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ProductCard";
import { conditionLabel, handoverLabel } from "@/lib/labels";
import { apiGet, apiPost } from "@/lib/api";
import type { Listing, SellerProfile } from "@/lib/types";
import { useAuthGuard } from "@/lib/auth";
import { useBadgeStore } from "@/store/badges";
import { useSessionStore } from "@/store/session";
import { cn } from "@/lib/cn";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { requireAuth } = useAuthGuard();
  const refreshCart = useBadgeStore((s) => s.refreshCart);
  const profile = useSessionStore((s) => s.profile);

  const [listing, setListing] = useState<Listing | null | undefined>(undefined);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [related, setRelated] = useState<Listing[]>([]);
  const [saved, setSaved] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [added, setAdded] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestRef.current;
    apiGet<{ listing: Listing }>(`/api/listings/${params.id}`)
      .then(({ listing }) => {
        if (requestRef.current !== requestId) return;
        setListing(listing);
        setSaved(!!listing.saved);
        apiGet<{ seller: SellerProfile }>(`/api/sellers/${listing.seller.id}`).then((r) => {
          if (requestRef.current === requestId) setSeller(r.seller);
        });
        apiGet<{ listings: Listing[] }>(
          `/api/listings?department=${encodeURIComponent(listing.department)}&excludeId=${listing.id}&pageSize=4`
        ).then((r) => {
          if (requestRef.current === requestId) setRelated(r.listings);
        });
      })
      .catch(() => {
        if (requestRef.current === requestId) setListing(null);
      });
  }, [params.id]);

  if (listing === undefined) {
    return <div className="flex flex-1 items-center justify-center text-text-tertiary">Loading...</div>;
  }
  if (listing === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-lg">Listing not found</p>
        <Link href="/home" className="text-accent">Back to home</Link>
      </div>
    );
  }

  const photoCount = listing.photoCount;
  const isOwner = profile?.id === listing.seller.id;

  async function toggleSaved() {
    const next = !saved;
    setSaved(next);
    try {
      const res = await apiPost<{ saved: boolean }>(`/api/saved/${listing!.id}`);
      setSaved(res.saved);
    } catch {
      setSaved(!next);
    }
  }

  function onMessage() {
    requireAuth(`/listing/${listing!.id}`, async () => {
      const { conversationId } = await apiPost<{ conversationId: string }>("/api/conversations", {
        listingId: listing!.id,
      });
      router.push(`/chats/${conversationId}`);
    });
  }

  function onAddToCart() {
    requireAuth(`/listing/${listing!.id}`, async () => {
      await apiPost("/api/cart", { listingId: listing!.id });
      refreshCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    });
  }

  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-8">
      {/* Mobile header */}
      <header className="flex h-14 shrink-0 items-center justify-between px-4 lg:hidden">
        <button onClick={() => router.back()} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary">
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => requireAuth(`/listing/${listing.id}`, toggleSaved)}
          aria-label="Save"
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary"
        >
          <Heart size={20} className={saved ? "fill-accent text-accent" : ""} />
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
                className={cn("h-24 w-full", activePhoto === i && "ring-2 ring-accent")}
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
            <p className="shrink-0 text-2xl text-accent">{listing.free ? "FREE" : `₹${listing.price}`}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="label-mono rounded-full bg-placeholder-primary px-3 py-1 text-[10px] text-text-secondary">
              {conditionLabel(listing.condition)}
            </span>
            <span className="label-mono rounded-full bg-placeholder-primary px-3 py-1 text-[10px] text-text-secondary">
              {listing.department}
            </span>
            {listing.seller.vendor && (
              <span className="label-mono rounded-full bg-accent-tile px-3 py-1 text-[10px] text-accent">
                {listing.seller.vendor.businessName}
              </span>
            )}
          </div>

          {/* Desktop buy panel */}
          <div className="hidden rounded-[28px] bg-card shadow-soft p-5 lg:sticky lg:top-20 lg:block">
            <p className="text-2xl text-accent">{listing.free ? "FREE" : `₹${listing.price}`}</p>
            {isOwner ? (
              <>
                <p className="mt-1 text-sm text-text-tertiary">This is your listing.</p>
                <Link
                  href="/dashboard"
                  className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-accent text-[15px] text-white shadow-accent hover:bg-accent-hover"
                >
                  Manage in dashboard
                </Link>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-text-tertiary">Free campus pickup available</p>
                <div className="mt-4 flex gap-2.5">
                  <Button fullWidth onClick={onAddToCart}>
                    {added ? "Added ✓" : "Add to cart"}
                  </Button>
                  <button
                    onClick={() => requireAuth(`/listing/${listing.id}`, toggleSaved)}
                    aria-label="Save"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-strong"
                  >
                    <Heart size={18} className={saved ? "fill-accent text-accent" : "text-text-secondary"} />
                  </button>
                </div>
                <button
                  onClick={onMessage}
                  className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-[15px]"
                >
                  <MessageCircle size={16} />
                  Message seller
                </button>
              </>
            )}
          </div>

          <p className="text-[15px] leading-relaxed text-text-secondary">{listing.description}</p>

          <DashedPanel>
            <p className="label-mono text-[11px] text-text-label">PICKUP WINDOW</p>
            <p className="mt-1 text-sm text-text-secondary">
              Available for {listing.handover.map(handoverLabel).join(", ")}
            </p>
          </DashedPanel>

          <Link
            href={`/seller/${listing.seller.id}`}
            className="flex items-center gap-3 rounded-[28px] bg-card shadow-soft p-3.5"
          >
            <Avatar name={listing.seller.name} size={44} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px]">
                {listing.seller.name} <span className="text-text-tertiary">· Yr {listing.seller.year}</span>
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-tertiary">
                {seller && (
                  <>
                    <RatingStars rating={seller.rating} size={12} />
                    <span>
                      {seller.rating} · {seller.salesCount} sales {seller.verified && "· Verified ✓"}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span className="label-mono text-[11px] text-accent">VIEW</span>
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
        {isOwner ? (
          <Link
            href="/dashboard"
            className="flex h-11 w-full items-center justify-center rounded-full bg-accent text-[15px] text-white shadow-accent"
          >
            Manage in dashboard
          </Link>
        ) : (
          <>
            <button
              onClick={() => requireAuth(`/listing/${listing.id}`, toggleSaved)}
              aria-label="Save"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-strong"
            >
              <Heart size={18} className={saved ? "fill-accent text-accent" : "text-text-secondary"} />
            </button>
            <button
              onClick={onMessage}
              className="h-11 flex-1 rounded-full border border-border-strong text-[15px]"
            >
              Message
            </button>
            <Button className="h-11 flex-[1.4]" onClick={onAddToCart}>
              {added ? "Added ✓" : "Add to cart"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
