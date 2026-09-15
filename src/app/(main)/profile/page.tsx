"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, List, Package, Heart, Wallet, Star, Store, BadgeCheck, ShieldCheck, Settings as SettingsIcon } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { Avatar } from "@/components/ui/Avatar";
import { StatTile } from "@/components/ui/misc";
import { apiGet } from "@/lib/api";
import { useSessionStore } from "@/store/session";

function ProfileContent() {
  const profile = useSessionStore((s) => s.profile);
  const vendor = useSessionStore((s) => s.vendor);
  const [balance, setBalance] = useState(0);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    apiGet<{ balance: number }>("/api/wallet").then((r) => setBalance(r.balance));
  }, []);

  useEffect(() => {
    if (!profile) return;
    apiGet<{ seller: { rating: number } }>(`/api/sellers/${profile.id}`).then((r) => setRating(r.seller.rating));
  }, [profile]);

  const nav = [
    { href: "/dashboard", label: "My listings", icon: List },
    { href: "/orders", label: "Orders", icon: Package },
    { href: "/saved", label: "Saved items", icon: Heart },
    { href: "/wallet", label: "Wallet & payouts", icon: Wallet },
    ...(profile ? [{ href: `/seller/${profile.id}`, label: "Reviews", icon: Star }] : []),
    ...(profile?.role === "VENDOR"
      ? [{ href: `/seller/${profile.id}`, label: "My storefront", icon: Store }]
      : [{ href: "/vendor/apply", label: "Sell as a vendor", icon: Store }]),
    ...(profile?.role === "ADMIN"
      ? [{ href: "/admin/vendors", label: "Vendor applications", icon: ShieldCheck }]
      : []),
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center gap-3 px-5 py-8 text-center lg:mx-auto lg:w-full lg:max-w-md">
        <Avatar name={profile?.fullName ?? "Guest"} size={72} />
        <div>
          <p className="flex items-center justify-center gap-1.5 text-xl">
            {profile?.fullName ?? "Guest"}
            {vendor?.status === "APPROVED" && <BadgeCheck size={18} className="text-accent" />}
          </p>
          <p className="label-mono mt-1 text-[11px] text-text-label">
            {profile ? `${profile.course} · YR ${profile.year}` : ""}
            {profile?.emailVerifiedAt ? " · VERIFIED ✓" : ""}
          </p>
          {vendor && vendor.status !== "APPROVED" && (
            <p className="label-mono mt-1 text-[10px] text-accent-text">
              VENDOR APPLICATION {vendor.status}
            </p>
          )}
        </div>

        <div className="mt-2 flex w-full gap-3">
          <StatTile label="WALLET" value={`₹${balance}`} />
          <StatTile label="RATING" value={rating !== null ? String(rating) : "—"} />
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border-hairline border-t border-border-hairline lg:mx-auto lg:w-full lg:max-w-md lg:rounded-[28px] lg:border-0 lg:bg-card lg:shadow-soft">
        {nav.map((item) => (
          <Link key={item.href + item.label} href={item.href} className="flex items-center gap-3 px-5 py-4 hover:bg-surface">
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
