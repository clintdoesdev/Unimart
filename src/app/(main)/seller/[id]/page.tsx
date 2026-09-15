"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { ProductCard } from "@/components/ProductCard";
import { getSeller, listingsBySeller, REVIEWS } from "@/lib/mock-data";
import { useAuthGuard } from "@/lib/auth";
import { useChatStore } from "@/store/chat";
import { cn } from "@/lib/cn";

export default function SellerProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const seller = getSeller(params.id);
  const { requireAuth } = useAuthGuard();
  const [tab, setTab] = useState<"listings" | "reviews">("listings");
  const [following, setFollowing] = useState(false);
  const startOrGetConversation = useChatStore((s) => s.startOrGetConversation);

  if (!seller) notFound();

  const listings = listingsBySeller(seller.id).filter((l) => l.status === "live");

  function onMessage() {
    requireAuth(`/seller/${seller!.id}`, () => {
      const listingId = listings[0]?.id ?? "l1";
      const convId = startOrGetConversation(seller!.id, listingId);
      router.push(`/chats/${convId}`);
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Seller profile" />
      <div className="flex flex-col items-center gap-3 px-5 py-6 text-center lg:mx-auto lg:w-full lg:max-w-3xl">
        <Avatar name={seller.name} size={72} />
        <div>
          <p className="text-xl">{seller.name}</p>
          <p className="label-mono mt-1 text-[11px] text-text-label">
            {seller.course} · YR {seller.year} · {seller.campus}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-text-tertiary">
          <RatingStars rating={seller.rating} />
          <span>
            {seller.rating} ({seller.reviewCount} reviews)
          </span>
        </div>

        <div className="mt-2 flex gap-3">
          <button onClick={onMessage} className="h-10 rounded-full border border-border-strong px-5 text-[15px]">
            Message
          </button>
          <button
            onClick={() => requireAuth(`/seller/${seller!.id}`, () => setFollowing((f) => !f))}
            className={cn(
              "h-10 rounded-full px-5 text-[15px]",
              following ? "border border-accent text-accent-text" : "bg-accent text-white"
            )}
          >
            {following ? "Following" : "Follow"}
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
        ) : (
          <div className="flex flex-col gap-4">
            {REVIEWS.map((r) => (
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
                <p className="label-mono mt-2 text-[10px] text-text-faint">{r.createdAt}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
