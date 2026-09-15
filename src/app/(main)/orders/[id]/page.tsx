"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { DashedPanel } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { apiGet, apiPost } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";
import { cn } from "@/lib/cn";

function OrderTrackingContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null | undefined>(undefined);
  const [collecting, setCollecting] = useState(false);

  function load() {
    apiGet<{ order: OrderDetail }>(`/api/orders/${params.id}`)
      .then((r) => setOrder(r.order))
      .catch(() => setOrder(null));
  }

  useEffect(load, [params.id]);

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

  async function chatSeller() {
    const listingId = order!.items[0]?.listingId;
    if (!listingId) return;
    const { conversationId } = await apiPost<{ conversationId: string }>("/api/conversations", { listingId });
    router.push(`/chats/${conversationId}`);
  }

  async function markCollected() {
    setCollecting(true);
    try {
      await apiPost(`/api/orders/${order!.id}/collect`);
      load();
    } finally {
      setCollecting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-28 lg:pb-8">
      <MobileHeader title={order.orderNumber} />

      <div className="flex flex-col gap-6 px-5 py-5 lg:mx-auto lg:w-full lg:max-w-2xl">
        <ImagePlaceholder label="CAMPUS MAP — LIBRARY LOCKERS" className="h-40 w-full" />

        <DashedPanel>
          <p className="label-mono text-[11px] text-text-label">PICKUP CODE</p>
          <p className="my-1 mono-code text-3xl tracking-[0.2em] text-accent-text">{order.pickupCode}</p>
        </DashedPanel>

        <div>
          <p className="label-mono mb-4 text-[11px] text-text-label">STATUS</p>
          <div className="flex flex-col">
            {order.timeline.map((step, i) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2",
                      step.done ? "border-accent bg-accent" : "border-border-strong bg-transparent"
                    )}
                  />
                  {i < order.timeline.length - 1 && (
                    <span className={cn("w-0.5 flex-1", step.done ? "bg-accent" : "bg-border-hairline")} style={{ minHeight: 28 }} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={cn("text-[15px]", !step.done && "text-text-tertiary")}>{step.label}</p>
                  {step.timestamp && (
                    <p className="label-mono mt-0.5 text-[10px] text-text-label">
                      {new Date(step.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={chatSeller} className="h-11 flex-1 rounded-full border border-border-strong text-[15px]">
            Chat seller
          </button>
          {order.role === "buying" && order.status !== "COMPLETED" && (
            <Button className="flex-1" onClick={markCollected} disabled={collecting}>
              I&apos;ve collected
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <AuthGate>
      <OrderTrackingContent />
    </AuthGate>
  );
}
