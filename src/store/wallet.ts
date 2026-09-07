"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WalletLedgerEntry } from "@/lib/types";
import { WALLET_BALANCE, WALLET_LEDGER } from "@/lib/mock-data";

interface WalletState {
  balance: number;
  ledger: WalletLedgerEntry[];
  withdraw: (amount: number) => void;
  topUp: (amount: number) => void;
  addPayout: (amount: number, label: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      balance: WALLET_BALANCE,
      ledger: WALLET_LEDGER,
      withdraw: (amount) =>
        set((state) => ({
          balance: Math.max(0, state.balance - amount),
          ledger: [
            { id: `w-${Date.now()}`, label: "Withdraw to bank", amount, type: "debit", createdAt: "Just now" },
            ...state.ledger,
          ],
        })),
      topUp: (amount) =>
        set((state) => ({
          balance: state.balance + amount,
          ledger: [
            { id: `w-${Date.now()}`, label: "Top up via UPI", amount, type: "credit", createdAt: "Just now" },
            ...state.ledger,
          ],
        })),
      addPayout: (amount, label) =>
        set((state) => ({
          balance: state.balance + amount,
          ledger: [
            { id: `w-${Date.now()}`, label, amount, type: "credit", createdAt: "Just now" },
            ...state.ledger,
          ],
        })),
    }),
    { name: "unimart-wallet", skipHydration: true }
  )
);
