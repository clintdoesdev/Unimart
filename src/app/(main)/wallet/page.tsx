"use client";

import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Button } from "@/components/ui/Button";
import { useWalletStore } from "@/store/wallet";
import { cn } from "@/lib/cn";

function WalletContent() {
  const balance = useWalletStore((s) => s.balance);
  const ledger = useWalletStore((s) => s.ledger);
  const withdraw = useWalletStore((s) => s.withdraw);
  const topUp = useWalletStore((s) => s.topUp);

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Wallet & payouts" />

      <div className="flex flex-col gap-6 px-5 py-5 lg:mx-auto lg:w-full lg:max-w-2xl">
        <div className="rounded-2xl border border-border-card bg-card shadow-soft p-5">
          <p className="label-mono text-[11px] text-text-label">BALANCE</p>
          <p className="my-2 text-4xl text-accent-text">₹{balance}</p>
          <div className="mt-3 flex gap-3">
            <Button className="flex-1" onClick={() => withdraw(200)}>
              Withdraw
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => topUp(500)}>
              Top up
            </Button>
          </div>
        </div>

        <div>
          <p className="label-mono mb-3 text-[11px] text-text-label">ACTIVITY</p>
          <div className="flex flex-col divide-y divide-border-hairline rounded-xl border border-border-card bg-card shadow-soft">
            {ledger.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p className="text-[15px]">{entry.label}</p>
                  <p className="label-mono mt-0.5 text-[10px] text-text-label">{entry.createdAt}</p>
                </div>
                <p className={cn("text-[15px]", entry.type === "credit" ? "text-accent-text" : "text-text-tertiary")}>
                  {entry.type === "credit" ? "+" : "−"}₹{entry.amount}
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
