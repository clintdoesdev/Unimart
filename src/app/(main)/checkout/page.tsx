"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { RadioCard, Segmented } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { apiGet, apiPost } from "@/lib/api";
import type { CartGroup, HandoverMethod } from "@/lib/types";
import { useCheckoutStore } from "@/store/checkout";
import { useBadgeStore } from "@/store/badges";

const HANDOVER_OPTIONS: { value: HandoverMethod; title: string; subtitle: string }[] = [
  { value: "LOCKER", title: "Campus pickup point", subtitle: "Library lockers · Free" },
  { value: "MEET", title: "Meet the seller", subtitle: "Arrange in chat · Free" },
  { value: "DELIVER", title: "Hostel delivery", subtitle: "₹30 · Same day" },
];
const HANDOVER_COST = { LOCKER: 0, MEET: 0, DELIVER: 30 } as const;

const PROMO_CODE = "STUDENT50";
const PROMO_DISCOUNT = 50;

function CheckoutContent() {
  const router = useRouter();
  const [groups, setGroups] = useState<CartGroup[] | null>(null);
  const [payment, setPayment] = useState<"upi" | "card" | "wallet">("upi");
  const [placing, setPlacing] = useState(false);
  const promoCode = useCheckoutStore((s) => s.promoCode);
  const handoverBySeller = useCheckoutStore((s) => s.handoverBySeller);
  const setHandover = useCheckoutStore((s) => s.setHandover);
  const resetCheckout = useCheckoutStore((s) => s.reset);
  const refreshCart = useBadgeStore((s) => s.refreshCart);

  useEffect(() => {
    apiGet<{ groups: CartGroup[] }>("/api/cart").then((r) => {
      setGroups(r.groups);
      if (r.groups.length === 0) router.replace("/cart");
    });
  }, [router]);

  if (!groups) {
    return (
      <div className="flex flex-1 flex-col">
        <MobileHeader title="Checkout" />
      </div>
    );
  }
  if (groups.length === 0) return null;

  const subtotal = groups.reduce((sum, g) => sum + g.lines.reduce((s, l) => s + l.price * l.qty, 0), 0);
  const handoverTotal = groups.reduce((sum, g) => sum + HANDOVER_COST[handoverBySeller[g.sellerId] ?? "LOCKER"], 0);
  const discount = promoCode === PROMO_CODE ? PROMO_DISCOUNT : 0;
  const total = Math.max(0, subtotal + handoverTotal - discount);

  async function placeOrderNow() {
    setPlacing(true);
    try {
      const map: Record<string, HandoverMethod> = {};
      groups!.forEach((g) => {
        map[g.sellerId] = handoverBySeller[g.sellerId] ?? "LOCKER";
      });
      const { orders } = await apiPost<{ orders: { id: string; orderNumber: string }[] }>("/api/orders", {
        handoverBySeller: map,
        promoCode: promoCode ?? undefined,
      });
      resetCheckout();
      refreshCart();
      router.push(`/order-confirmed/${orders[0].id}`);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col pb-32 lg:pb-8">
      <MobileHeader title="Checkout" />

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 lg:px-6 lg:py-6">
        <div className="flex flex-col gap-6 px-5 py-5 lg:px-0 lg:py-0">
          <div className="label-mono hidden items-center gap-3 text-[11px] text-text-label lg:flex">
            <span className="text-text-faint">CART</span>
            <span>→</span>
            <span className="text-accent">HANDOVER</span>
            <span>→</span>
            <span className="text-accent">PAY</span>
          </div>

          <div>
            <p className="label-mono mb-3 text-[11px] text-text-label">HANDOVER</p>
            <div className="flex flex-col gap-5">
              {groups.map((group) => (
                <div key={group.sellerId}>
                  <p className="mb-2 text-sm text-text-tertiary">Sold by {group.seller.name}</p>
                  <div className="flex flex-col gap-2.5">
                    {HANDOVER_OPTIONS.map((opt) => (
                      <RadioCard
                        key={opt.value}
                        selected={(handoverBySeller[group.sellerId] ?? "LOCKER") === opt.value}
                        title={opt.title}
                        subtitle={opt.subtitle}
                        onSelect={() => setHandover(group.sellerId, opt.value)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="label-mono mb-3 text-[11px] text-text-label">PAYMENT</p>
            <Segmented
              value={payment}
              onChange={setPayment}
              options={[
                { value: "upi", label: "UPI" },
                { value: "card", label: "Card" },
                { value: "wallet", label: "Wallet" },
              ]}
            />
          </div>
        </div>

        {/* Summary column */}
        <div className="px-5 lg:sticky lg:top-20 lg:h-fit lg:px-0">
          <div className="flex flex-col gap-2 rounded-[28px] bg-card shadow-soft p-4">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Handover</span>
              <span>{handoverTotal === 0 ? "Free" : `₹${handoverTotal}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-accent">
                <span>Student code</span>
                <span>−₹{discount}</span>
              </div>
            )}
            <div className="mt-1 flex justify-between border-t border-border-hairline pt-2 text-[17px]">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <p className="mt-2 text-xs text-text-faint">
              Payment is held in escrow until you confirm pickup.
            </p>
            <div className="hidden lg:block">
              <Button fullWidth size="lg" className="mt-2" onClick={placeOrderNow} disabled={placing}>
                Place order
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border-hairline bg-surface px-5 py-3 lg:hidden">
        <Button fullWidth size="lg" onClick={placeOrderNow} disabled={placing}>
          Pay now · ₹{total}
        </Button>
        <p className="label-mono mt-2 text-center text-[10px] text-text-faint">PLACE ORDER</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGate>
      <CheckoutContent />
    </AuthGate>
  );
}
