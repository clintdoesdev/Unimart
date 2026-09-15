"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { RadioCard, Segmented } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { getListing, getSeller } from "@/lib/mock-data";
import type { HandoverMethod } from "@/lib/types";
import { HANDOVER_COST, cartGroupSubtotal, useCartStore } from "@/store/cart";
import { useOrdersStore } from "@/store/orders";

const HANDOVER_OPTIONS: { value: HandoverMethod; title: string; subtitle: string }[] = [
  { value: "locker", title: "Campus pickup point", subtitle: "Library lockers · Free" },
  { value: "meet", title: "Meet the seller", subtitle: "Arrange in chat · Free" },
  { value: "deliver", title: "Hostel delivery", subtitle: "₹30 · Same day" },
];

const PROMO_CODE = "STUDENT50";
const PROMO_DISCOUNT = 50;

function CheckoutContent() {
  const router = useRouter();
  const groups = useCartStore((s) => s.groups);
  const promoCode = useCartStore((s) => s.promoCode);
  const setHandoverForSeller = useCartStore((s) => s.setHandoverForSeller);
  const clearCart = useCartStore((s) => s.clearCart);
  const placeOrder = useOrdersStore((s) => s.placeOrder);
  const [payment, setPayment] = useState<"upi" | "card" | "wallet">("upi");
  const [placing, setPlacing] = useState(false);

  const subtotal = groups.reduce((sum, g) => sum + cartGroupSubtotal(g), 0);
  const handoverTotal = groups.reduce((sum, g) => sum + HANDOVER_COST[g.handoverMethod], 0);
  const discount = promoCode === PROMO_CODE ? PROMO_DISCOUNT : 0;
  const total = Math.max(0, subtotal + handoverTotal - discount);

  useEffect(() => {
    if (!placing && groups.length === 0) {
      router.replace("/cart");
    }
  }, [placing, groups.length, router]);

  if (groups.length === 0) {
    return null;
  }

  function placeOrderNow() {
    setPlacing(true);
    let firstOrderId = "";
    groups.forEach((group, i) => {
      const items = group.lines
        .map((line) => {
          const listing = getListing(line.listingId);
          return listing ? { listingId: listing.id, title: listing.title, price: listing.price, qty: line.qty } : null;
        })
        .filter(Boolean) as { listingId: string; title: string; price: number; qty: number }[];
      const groupSubtotal = cartGroupSubtotal(group);
      const order = placeOrder({
        sellerId: group.sellerId,
        items,
        subtotal: groupSubtotal,
        handoverCost: HANDOVER_COST[group.handoverMethod],
        discount: i === 0 ? discount : 0,
        total: groupSubtotal + HANDOVER_COST[group.handoverMethod] - (i === 0 ? discount : 0),
        handoverMethod: group.handoverMethod,
      });
      if (i === 0) firstOrderId = order.id;
    });
    clearCart();
    router.push(`/order-confirmed/${firstOrderId}`);
  }

  return (
    <div className="flex flex-1 flex-col pb-32 lg:pb-8">
      <MobileHeader title="Checkout" />

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8 lg:px-6 lg:py-6">
        <div className="flex flex-col gap-6 px-5 py-5 lg:px-0 lg:py-0">
          <div className="label-mono hidden items-center gap-3 text-[11px] text-text-label lg:flex">
            <span className="text-text-faint">CART</span>
            <span>→</span>
            <span className="text-accent-text">HANDOVER</span>
            <span>→</span>
            <span className="text-accent-text">PAY</span>
          </div>

          <div>
            <p className="label-mono mb-3 text-[11px] text-text-label">HANDOVER</p>
            <div className="flex flex-col gap-5">
              {groups.map((group) => {
                const seller = getSeller(group.sellerId);
                return (
                  <div key={group.sellerId}>
                    <p className="mb-2 text-sm text-text-tertiary">Sold by {seller?.name}</p>
                    <div className="flex flex-col gap-2.5">
                      {HANDOVER_OPTIONS.map((opt) => (
                        <RadioCard
                          key={opt.value}
                          selected={group.handoverMethod === opt.value}
                          title={opt.title}
                          subtitle={opt.subtitle}
                          onSelect={() => setHandoverForSeller(group.sellerId, opt.value)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
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
            {payment === "wallet" && (
              <p className="mt-2 text-sm text-text-tertiary">Wallet balance: ₹720</p>
            )}
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
              <div className="flex justify-between text-sm text-accent-text">
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
