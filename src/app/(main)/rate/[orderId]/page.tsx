"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { Chip } from "@/components/ui/Chip";
import { Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiGet, apiPost } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";

const TAGS = ["On time", "As described", "Friendly", "Fair price"];

function RateContent() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null | undefined>(undefined);
  const [sellerName, setSellerName] = useState("Seller");
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGet<{ order: OrderDetail }>(`/api/orders/${params.orderId}`)
      .then((r) => {
        setOrder(r.order);
        setSellerName(r.order.counterpartName);
      })
      .catch(() => setOrder(null));
  }, [params.orderId]);

  if (order === undefined) {
    return <div className="flex flex-1 items-center justify-center text-text-tertiary">Loading...</div>;
  }
  if (order === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-lg">Order not found</p>
        <Link href="/home" className="text-accent">Back to home</Link>
      </div>
    );
  }

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function submit() {
    setSubmitting(true);
    try {
      await apiPost(`/api/orders/${order!.id}/review`, { rating, tags, note: note.trim() || undefined });
      router.push("/orders");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Rate the trade" />
      <div className="flex flex-1 flex-col gap-6 px-5 py-6 lg:mx-auto lg:w-full lg:max-w-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar name={sellerName} size={64} />
          <p className="text-lg">{sellerName}</p>
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

        <Button size="lg" fullWidth onClick={submit} disabled={submitting} className="mt-auto">
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
