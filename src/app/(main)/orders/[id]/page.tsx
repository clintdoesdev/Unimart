"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { DashedPanel } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { useOrdersStore } from "@/store/orders";
import { useChatStore } from "@/store/chat";
import { cn } from "@/lib/cn";

function OrderTrackingContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const order = useOrdersStore((s) => s.getOrder(params.id));
  const markCollected = useOrdersStore((s) => s.markCollected);
  const startOrGetConversation = useChatStore((s) => s.startOrGetConversation);

  if (!order) notFound();

  function chatSeller() {
    const listingId = order!.items[0]?.listingId ?? "l1";
    const convId = startOrGetConversation(order!.sellerId, listingId);
    router.push(`/chats/${convId}`);
  }

  return (
    <div className="flex flex-1 flex-col pb-28 lg:pb-8">
      <MobileHeader title={order.id} />

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
                  {step.timestamp && <p className="label-mono mt-0.5 text-[10px] text-text-label">{step.timestamp}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={chatSeller} className="h-11 flex-1 rounded-xl border border-border-strong text-[15px]">
            Chat seller
          </button>
          {order.status !== "completed" && (
            <Button className="flex-1" onClick={() => markCollected(order!.id)}>
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
