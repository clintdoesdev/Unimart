"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, Heart, Search } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Chip } from "@/components/ui/Chip";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, LISTINGS } from "@/lib/mock-data";
import { useSessionStore } from "@/store/session";
import { useNotificationsStore } from "@/store/notifications";
import { cn } from "@/lib/cn";

const FILTERS = [
  { id: "for-you", label: "For you" },
  { id: "nearby", label: "Nearby" },
  { id: "free", label: "Free" },
  { id: "new", label: "New" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function HomePage() {
  const profile = useSessionStore((s) => s.profile);
  const interests = useSessionStore((s) => s.interests);
  const unreadNotifs = useNotificationsStore((s) => s.unreadCount());
  const [activeFilter, setActiveFilter] = useState<FilterId>("for-you");
  const [campus, setCampus] = useState(profile?.campus ?? "North Campus");

  const listings = useMemo(() => {
    const list = [...LISTINGS];
    switch (activeFilter) {
      case "free":
        return list.filter((l) => l.free);
      case "new":
        return list.slice().reverse();
      case "nearby":
        return list.sort((a, b) => a.distanceMeters - b.distanceMeters);
      case "for-you":
      default:
        if (interests.length === 0) return list;
        return list.sort((a, b) => {
          const aMatch = interests.includes(a.category) ? 0 : 1;
          const bMatch = interests.includes(b.category) ? 0 : 1;
          return aMatch - bMatch;
        });
    }
  }, [activeFilter, interests]);

  return (
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[190px_1fr] lg:items-start lg:gap-8 lg:px-6 lg:py-6">
      {/* Desktop left rail */}
      <aside className="hidden lg:flex lg:flex-col lg:gap-6">
        <div>
          <p className="label-mono mb-1.5 text-[11px] text-text-label">Campus</p>
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="h-10 w-full rounded-full border border-border-input bg-surface px-3 text-sm outline-none focus:border-accent"
          >
            <option>{campus}</option>
          </select>
        </div>
        <div>
          <p className="label-mono mb-2 text-[11px] text-text-label">Categories</p>
          <nav className="flex flex-col gap-0.5">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/browse?category=${c.id}`}
                className="rounded-full px-4 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="label-mono mb-2 text-[11px] text-text-label">Quick filters</p>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Chip key={f.id} active={activeFilter === f.id} onClick={() => setActiveFilter(f.id)}>
                {f.label}
              </Chip>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 pt-5 lg:hidden">
          <div>
            <p className="label-mono text-[10px] text-text-label">{campus}</p>
            <p className="text-xl">Hey, {profile?.fullName?.split(" ")[0] ?? "there"} 👋</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Bell size={18} className="text-text-secondary" />
              {unreadNotifs > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />}
            </Link>
            <Link href="/saved" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Heart size={18} className="text-text-secondary" />
            </Link>
          </div>
        </div>

        <div className="px-5 pt-4 lg:hidden">
          <Link href="/search" className="flex h-11 items-center gap-2 rounded-full border border-border-input bg-surface px-3.5 text-text-faint">
            <Search size={16} />
            Search listings...
          </Link>
        </div>

        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5 lg:hidden">
          {FILTERS.map((f) => (
            <Chip key={f.id} active={activeFilter === f.id} onClick={() => setActiveFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>

        {/* Hero / promo banner */}
        <div className="px-5 pt-5 lg:px-0 lg:pt-0">
          <ImagePlaceholder
            label="HERO BANNER — freshers' week deals"
            className="h-32 w-full lg:h-44"
          />
        </div>

        <div className="mt-6 flex items-center justify-between px-5 lg:px-0">
          <h2 className="text-lg">Fresh listings</h2>
          <div className="flex items-center gap-3">
            <select className="label-mono hidden h-9 rounded-full border border-border-input bg-surface px-2 text-[11px] lg:block">
              <option>SORT: NEWEST</option>
              <option>SORT: PRICE LOW-HIGH</option>
              <option>SORT: PRICE HIGH-LOW</option>
            </select>
            <Link href="/search" className="label-mono text-[11px] text-accent-text">
              SEE ALL
            </Link>
          </div>
        </div>

        <div
          className={cn(
            "grid grid-cols-2 gap-3 px-5 pb-8 pt-4",
            "lg:grid-cols-4 lg:gap-5 lg:px-0"
          )}
        >
          {listings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </div>
  );
}
