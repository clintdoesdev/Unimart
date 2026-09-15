"use client";

import Link from "next/link";
import { ChevronRight, List, Package, Heart, Wallet, Star, Settings as SettingsIcon } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Avatar } from "@/components/ui/Avatar";
import { StatTile } from "@/components/ui/misc";
import { useSessionStore } from "@/store/session";
import { useWalletStore } from "@/store/wallet";
import { SELLERS } from "@/lib/mock-data";

const NAV = [
  { href: "/dashboard", label: "My listings", icon: List },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/saved", label: "Saved items", icon: Heart },
  { href: "/wallet", label: "Wallet & payouts", icon: Wallet },
  { href: "/seller/s1", label: "Reviews", icon: Star },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

function ProfileContent() {
  const profile = useSessionStore((s) => s.profile);
  const balance = useWalletStore((s) => s.balance);
  const me = SELLERS[0];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center gap-3 px-5 py-8 text-center lg:mx-auto lg:w-full lg:max-w-md">
        <Avatar name={profile?.fullName ?? "Guest"} size={72} />
        <div>
          <p className="text-xl">{profile?.fullName ?? "Guest"}</p>
          <p className="label-mono mt-1 text-[11px] text-text-label">
            {profile?.course ?? me.course} · YR {profile?.year ?? me.year} · VERIFIED ✓
          </p>
        </div>

        <div className="mt-2 flex w-full gap-3">
          <StatTile label="WALLET" value={`₹${balance}`} />
          <StatTile label="RATING" value={String(me.rating)} />
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border-hairline border-t border-border-hairline lg:mx-auto lg:w-full lg:max-w-md lg:rounded-[28px] lg:border-0 lg:bg-card lg:shadow-soft">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 px-5 py-4 hover:bg-surface">
            <item.icon size={18} className="text-text-tertiary" />
            <span className="flex-1 text-[15px]">{item.label}</span>
            <ChevronRight size={16} className="text-text-faint" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGate>
      <ProfileContent />
    </AuthGate>
  );
}
