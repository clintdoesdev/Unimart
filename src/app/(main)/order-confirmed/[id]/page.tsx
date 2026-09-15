"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { DashedPanel } from "@/components/ui/misc";
import { apiGet } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";

function OrderConfirmedContent() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null | undefined>(undefined);

  useEffect(() => {
    apiGet<{ order: OrderDetail }>(`/api/orders/${params.id}`)
      .then((r) => setOrder(r.order))
      .catch(() => setOrder(null));
  }, [params.id]);

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

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-16 text-center lg:mx-auto lg:max-w-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white">
        <Check size={30} />
      </div>
      <div>
        <h1 className="text-2xl">Order placed</h1>
        <p className="mt-1.5 text-[15px] text-text-secondary">
          Your payment is held safely until you confirm pickup.
        </p>
      </div>

      <DashedPanel className="w-full">
        <p className="label-mono text-[11px] text-text-label">PICKUP CODE</p>
        <p className="my-2 mono-code text-4xl tracking-[0.2em] text-accent-text">{order.pickupCode}</p>
        <div className="mt-3 flex justify-between border-t border-border-hairline pt-3 text-sm text-text-secondary">
          <span>{order.orderNumber}</span>
          <span>₹{order.total}</span>
        </div>
      </DashedPanel>

      <div className="flex w-full flex-col gap-3">
        <Link
          href={`/orders/${order.id}`}
          className="flex h-12 items-center justify-center rounded-full bg-accent text-[15px] text-white shadow-accent hover:bg-accent-hover"
        >
          Track order
        </Link>
        <Link
          href="/home"
          className="flex h-12 items-center justify-center rounded-full border border-border-strong text-[15px]"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <AuthGate>
      <OrderConfirmedContent />
    </AuthGate>
  );
}
