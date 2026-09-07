"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartGroup, HandoverMethod } from "@/lib/types";
import { getListing } from "@/lib/mock-data";

interface CartState {
  groups: CartGroup[];
  promoCode: string | null;
  addItem: (listingId: string, sellerId: string) => void;
  removeItem: (listingId: string) => void;
  setQty: (listingId: string, qty: number) => void;
  setHandoverForSeller: (sellerId: string, method: HandoverMethod) => void;
  applyPromoCode: (code: string) => void;
  clearCart: () => void;
  totalItemCount: () => number;
}

export const HANDOVER_COST: Record<HandoverMethod, number> = {
  locker: 0,
  meet: 0,
  deliver: 30,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      groups: [],
      promoCode: null,
      addItem: (listingId, sellerId) =>
        set((state) => {
          const groups = state.groups.map((g) => ({ ...g, lines: [...g.lines] }));
          let group = groups.find((g) => g.sellerId === sellerId);
          if (!group) {
            group = { sellerId, lines: [], handoverMethod: "locker" };
            groups.push(group);
          }
          const line = group.lines.find((l) => l.listingId === listingId);
          if (line) {
            line.qty += 1;
          } else {
            group.lines.push({ listingId, qty: 1 });
          }
          return { groups };
        }),
      removeItem: (listingId) =>
        set((state) => {
          const groups = state.groups
            .map((g) => ({ ...g, lines: g.lines.filter((l) => l.listingId !== listingId) }))
            .filter((g) => g.lines.length > 0);
          return { groups };
        }),
      setQty: (listingId, qty) =>
        set((state) => ({
          groups: state.groups.map((g) => ({
            ...g,
            lines: g.lines.map((l) =>
              l.listingId === listingId ? { ...l, qty: Math.max(1, qty) } : l
            ),
          })),
        })),
      setHandoverForSeller: (sellerId, method) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.sellerId === sellerId ? { ...g, handoverMethod: method } : g
          ),
        })),
      applyPromoCode: (code) => set({ promoCode: code }),
      clearCart: () => set({ groups: [], promoCode: null }),
      totalItemCount: () =>
        get().groups.reduce(
          (sum, g) => sum + g.lines.reduce((s, l) => s + l.qty, 0),
          0
        ),
    }),
    { name: "unimart-cart", skipHydration: true }
  )
);

export function cartGroupSubtotal(group: CartGroup): number {
  return group.lines.reduce((sum, line) => {
    const listing = getListing(line.listingId);
    return sum + (listing?.price ?? 0) * line.qty;
  }, 0);
}
