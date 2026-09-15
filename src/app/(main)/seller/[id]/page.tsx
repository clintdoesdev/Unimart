"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { ProductCard } from "@/components/ProductCard";
import { apiGet, apiPost } from "@/lib/api";
import type { Listing, Review, SellerProfile } from "@/lib/types";
import { useAuthGuard } from "@/lib/auth";
import { cn } from "@/lib/cn";

export default function SellerProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { requireAuth } = useAuthGuard();
  const [seller, setSeller] = useState<SellerProfile | null | undefined>(undefined);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tab, setTab] = useState<"listings" | "reviews">("listings");

  useEffect(() => {
    apiGet<{ seller: SellerProfile }>(`/api/sellers/${params.id}`)
      .then((r) => setSeller(r.seller))
      .catch(() => setSeller(null));
    apiGet<{ listings: Listing[] }>(`/api/listings?sellerId=${params.id}`).then((r) => setListings(r.listings));
    apiGet<{ reviews: Review[] }>(`/api/reviews?targetId=${params.id}`).then((r) => setReviews(r.reviews));
  }, [params.id]);

  if (seller === undefined) {
    return <div className="flex flex-1 items-center justify-center text-text-tertiary">Loading...</div>;
  }
  if (seller === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-lg">Profile not found</p>
        <Link href="/home" className="text-accent">Back to home</Link>
      </div>
    );
  }

  function onMessage() {
    requireAuth(`/seller/${seller!.id}`, async () => {
      const listingId = listings[0]?.id;
      if (!listingId) return;
      const { conversationId } = await apiPost<{ conversationId: string }>("/api/conversations", { listingId });
      router.push(`/chats/${conversationId}`);
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title={seller.vendor ? "Vendor storefront" : "Seller profile"} />
      <div className="flex flex-col items-center gap-3 px-5 py-6 text-center lg:mx-auto lg:w-full lg:max-w-3xl">
        <Avatar name={seller.vendor?.businessName ?? seller.name} size={72} />
        <div>
          <p className="flex items-center justify-center gap-1.5 text-xl">
            {seller.vendor?.businessName ?? seller.name}
            {seller.vendor && <BadgeCheck size={18} className="text-accent" />}
          </p>
          <p className="label-mono mt-1 text-[11px] text-text-label">
            {seller.vendor ? seller.vendor.category : `${seller.course} · YR ${seller.year}`} · {seller.campus}
          </p>
        </div>
        {seller.vendor && <p className="max-w-md text-sm text-text-secondary">{seller.vendor.description}</p>}
        <div className="flex items-center gap-1.5 text-sm text-text-tertiary">
          <RatingStars rating={seller.rating} />
          <span>
            {seller.rating} ({seller.reviewCount} reviews)
          </span>
        </div>

        <div className="mt-2 flex gap-3">
          <button onClick={onMessage} className="h-10 rounded-full bg-accent px-5 text-[15px] text-white shadow-accent hover:bg-accent-hover">
            Message
          </button>
        </div>
      </div>

      <div className="border-b border-border-hairline px-5 lg:mx-auto lg:w-full lg:max-w-3xl">
        <div className="flex gap-6">
          <button
            onClick={() => setTab("listings")}
            className={cn(
              "label-mono border-b-2 py-3 text-[11px]",
              tab === "listings" ? "border-accent text-text-primary" : "border-transparent text-text-tertiary"
            )}
          >
            LISTINGS ({listings.length})
          </button>
          <button
            onClick={() => setTab("reviews")}
            className={cn(
              "label-mono border-b-2 py-3 text-[11px]",
              tab === "reviews" ? "border-accent text-text-primary" : "border-transparent text-text-tertiary"
            )}
          >
            REVIEWS ({seller.reviewCount})
          </button>
        </div>
      </div>

      <div className="px-5 py-5 lg:mx-auto lg:w-full lg:max-w-3xl">
        {tab === "listings" ? (
          listings.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-tertiary">No live listings right now.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {listings.map((l) => (
                <ProductCard key={l.id} listing={l} />
              ))}
            </div>
          )
        ) : reviews.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-tertiary">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-[28px] bg-card shadow-soft p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[15px]">{r.authorName}</p>
                  <RatingStars rating={r.rating} size={13} />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.tags.map((t) => (
                    <span key={t} className="label-mono rounded-full bg-placeholder-primary px-2.5 py-1 text-[10px] text-text-secondary">
                      {t}
                    </span>
                  ))}
                </div>
                {r.note && <p className="mt-2 text-sm text-text-secondary">{r.note}</p>}
                <p className="label-mono mt-2 text-[10px] text-text-faint">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
