"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Button } from "@/components/ui/Button";
import { apiGet, apiPost } from "@/lib/api";
import type { WalletLedgerEntry } from "@/lib/types";
import { cn } from "@/lib/cn";

function WalletContent() {
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState<WalletLedgerEntry[]>([]);

  function load() {
    apiGet<{ balance: number; ledger: WalletLedgerEntry[] }>("/api/wallet").then((r) => {
      setBalance(r.balance);
      setLedger(r.ledger);
    });
  }

  useEffect(load, []);

  async function withdraw() {
    await apiPost("/api/wallet/withdraw", { amount: Math.min(200, balance) || 1 }).catch(() => {});
    load();
  }

  async function topUp() {
    await apiPost("/api/wallet/topup", { amount: 500 });
    load();
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Wallet & payouts" />

      <div className="flex flex-col gap-6 px-5 py-5 lg:mx-auto lg:w-full lg:max-w-2xl">
        <div className="rounded-[28px] bg-card shadow-soft p-5">
          <p className="label-mono text-[11px] text-text-label">BALANCE</p>
          <p className="my-2 text-4xl text-accent-text">₹{balance}</p>
          <div className="mt-3 flex gap-3">
            <Button className="flex-1" onClick={withdraw} disabled={balance <= 0}>
              Withdraw
            </Button>
            <Button variant="secondary" className="flex-1" onClick={topUp}>
              Top up
            </Button>
          </div>
        </div>

        <div>
          <p className="label-mono mb-3 text-[11px] text-text-label">ACTIVITY</p>
          <div className="flex flex-col divide-y divide-border-hairline rounded-[28px] bg-card shadow-soft">
            {ledger.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-text-tertiary">No activity yet.</p>
            )}
            {ledger.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-[15px]">{entry.label}</p>
                  <p className="label-mono mt-0.5 text-[10px] text-text-label">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className={cn("text-[15px]", entry.type === "CREDIT" ? "text-accent-text" : "text-text-tertiary")}>
                  {entry.type === "CREDIT" ? "+" : "−"}₹{entry.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <AuthGate>
      <WalletContent />
    </AuthGate>
  );
}
