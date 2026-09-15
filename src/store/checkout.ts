"use client";

import { create } from "zustand";
import type { HandoverMethod } from "@/lib/types";

interface CheckoutState {
  promoCode: string | null;
  handoverBySeller: Record<string, HandoverMethod>;
  setPromoCode: (code: string | null) => void;
  setHandover: (sellerId: string, method: HandoverMethod) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  promoCode: null,
  handoverBySeller: {},
  setPromoCode: (code) => set({ promoCode: code }),
  setHandover: (sellerId, method) =>
    set((state) => ({ handoverBySeller: { ...state.handoverBySeller, [sellerId]: method } })),
  reset: () => set({ promoCode: null, handoverBySeller: {} }),
}));
