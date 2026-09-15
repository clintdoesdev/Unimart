"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, X } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Stepper } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { getListing, getSeller } from "@/lib/mock-data";
import { HANDOVER_COST, cartGroupSubtotal, useCartStore } from "@/store/cart";

const PROMO_CODE = "STUDENT50";
const PROMO_DISCOUNT = 50;

function CartContent() {
  const router = useRouter();
  const groups = useCartStore((s) => s.groups);
  const promoCode = useCartStore((s) => s.promoCode);
  const applyPromoCode = useCartStore((s) => s.applyPromoCode);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const [promoInput, setPromoInput] = useState("");

  const subtotal = groups.reduce((sum, g) => sum + cartGroupSubtotal(g), 0);
  const handoverTotal = groups.reduce((sum, g) => sum + HANDOVER_COST[g.handoverMethod], 0);
  const discount = promoCode === PROMO_CODE ? PROMO_DISCOUNT : 0;
  const total = Math.max(0, subtotal + handoverTotal - discount);

  if (groups.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <MobileHeader title="Cart" showBack={false} />
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse listings and add something you like."
          ctaLabel="Browse listings"
          ctaHref="/home"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-40 lg:pb-8">
      <MobileHeader title="Cart" showBack={false} />

      <div className="flex flex-col gap-6 px-5 py-5 lg:mx-auto lg:w-full lg:max-w-2xl lg:py-8">
        {groups.map((group) => {
          const seller = getSeller(group.sellerId);
          return (
            <div key={group.sellerId}>
              <p className="label-mono mb-2.5 text-[11px] text-text-label">
                SOLD BY {seller?.name.toUpperCase()}
              </p>
              <div className="flex flex-col divide-y divide-border-hairline rounded-[28px] bg-card shadow-soft">
                {group.lines.map((line) => {
                  const listing = getListing(line.listingId);
                  if (!listing) return null;
                  return (
                    <div key={line.listingId} className="flex items-center gap-3 p-3.5">
                      <div className="img-placeholder h-14 w-14 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px]">{listing.title}</p>
                        <p className="mt-0.5 text-accent-text">₹{listing.price}</p>
                      </div>
                      <Stepper qty={line.qty} onChange={(qty) => setQty(line.listingId, qty)} />
                      <button
                        onClick={() => removeItem(line.listingId)}
                        aria-label="Remove item"
                        className="text-text-faint hover:text-text-destructive"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="rounded-[20px] bg-accent-tile p-3.5">
          {discount > 0 ? (
            <p className="text-sm text-accent-text">Student code applied −₹{discount}</p>
          ) : (
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Promo code (try STUDENT50)"
                className="h-10 flex-1 rounded-full border border-border-input bg-white px-4 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={() => applyPromoCode(promoInput.trim().toUpperCase())}
                className="label-mono rounded-full border border-border-strong bg-white px-4 text-[11px]"
              >
                APPLY
              </button>
            </div>
          )}
        </div>

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
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border-hairline bg-surface px-5 py-3 lg:static lg:mx-auto lg:mt-2 lg:w-full lg:max-w-2xl lg:border-0 lg:bg-transparent lg:px-0">
        <Button fullWidth size="lg" onClick={() => router.push("/checkout")}>
          Checkout · ₹{total}
        </Button>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <AuthGate>
      <CartContent />
    </AuthGate>
  );
}
