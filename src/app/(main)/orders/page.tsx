"use client";

import { useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/misc";
import { cn } from "@/lib/cn";
import { useOrdersStore } from "@/store/orders";
import type { Order } from "@/lib/types";

const STATUS_LABEL: Record<Order["status"], string> = {
  paid: "PAID",
  dropped: "DROPPED AT LOCKER",
  "ready-for-pickup": "READY FOR PICKUP",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

function OrdersContent() {
  const [tab, setTab] = useState<"buying" | "selling">("buying");
  const allOrders = useOrdersStore((s) => s.orders);
  const orders = allOrders.filter((o) => o.role === tab);

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="My orders" showBack={false} />

      <div className="border-b border-border-hairline px-5 lg:mx-auto lg:w-full lg:max-w-2xl">
        <div className="flex gap-6">
          {(["buying", "selling"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "label-mono border-b-2 py-3 text-[11px]",
                tab === t ? "border-accent text-text-primary" : "border-transparent text-text-tertiary"
              )}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 py-5 lg:mx-auto lg:w-full lg:max-w-2xl">
        {orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description={tab === "buying" ? "Orders you place will show up here." : "Orders from your buyers will show up here."}
            ctaLabel="Browse listings"
            ctaHref="/home"
          />
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border-card bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="label-mono text-[11px] text-text-label">{order.id}</p>
                <Badge tone={order.status === "completed" ? "muted" : "accent"}>
                  {STATUS_LABEL[order.status]}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="img-placeholder h-12 w-12 shrink-0 rounded-lg border border-border-card" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px]">{order.items[0]?.title}</p>
                  <p className="label-mono text-[10px] text-text-label">₹{order.total} · {order.createdAt}</p>
                </div>
              </div>
              <div className="mt-3">
                {order.status === "ready-for-pickup" || order.status === "paid" ? (
                  <Link
                    href={`/orders/${order.id}`}
                    className="label-mono inline-flex h-9 items-center rounded-lg border border-border-strong px-3.5 text-[11px]"
                  >
                    SHOW PICKUP CODE
                  </Link>
                ) : order.status === "completed" && !order.reviewed && tab === "buying" ? (
                  <Link
                    href={`/rate/${order.id}`}
                    className="label-mono inline-flex h-9 items-center rounded-lg bg-accent px-3.5 text-[11px] text-white"
                  >
                    RATE SELLER
                  </Link>
                ) : (
                  <Link
                    href={`/orders/${order.id}`}
                    className="label-mono inline-flex h-9 items-center rounded-lg border border-border-strong px-3.5 text-[11px]"
                  >
                    VIEW ORDER
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGate>
      <OrdersContent />
    </AuthGate>
  );
}
