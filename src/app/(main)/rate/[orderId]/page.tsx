"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { Chip } from "@/components/ui/Chip";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { getSeller } from "@/lib/mock-data";
import { useOrdersStore } from "@/store/orders";

const TAGS = ["On time", "As described", "Friendly", "Fair price"];

function RateContent() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const order = useOrdersStore((s) => s.getOrder(params.orderId));
  const markReviewed = useOrdersStore((s) => s.markReviewed);
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");

  if (!order) notFound();

  const seller = getSeller(order.sellerId);

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function submit() {
    markReviewed(order!.id);
    router.push("/orders");
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Rate the trade" />
      <div className="flex flex-1 flex-col gap-6 px-5 py-6 lg:mx-auto lg:w-full lg:max-w-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar name={seller?.name ?? "Seller"} size={64} />
          <p className="text-lg">{seller?.name}</p>
          <RatingStars rating={rating} size={26} interactive onChange={setRating} />
        </div>

        <div>
          <p className="label-mono mb-3 text-[11px] text-text-label">QUICK TAGS</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Chip key={tag} active={tags.includes(tag)} onClick={() => toggleTag(tag)}>
                {tag}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="label-mono mb-2 text-[11px] text-text-label">NOTE (OPTIONAL)</p>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Share more about your experience..." />
        </div>

        <Button size="lg" fullWidth onClick={submit} className="mt-auto">
          Submit review
        </Button>
      </div>
    </div>
  );
}

export default function RatePage() {
  return (
    <AuthGate>
      <RateContent />
    </AuthGate>
  );
}
