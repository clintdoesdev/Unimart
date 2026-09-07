"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORIES, LISTINGS, getSeller } from "@/lib/mock-data";
import { useSessionStore } from "@/store/session";

export function BrowseClient() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("category");
  const [query, setQuery] = useState("");
  const profile = useSessionStore((s) => s.profile);
  const department = profile?.course ?? "CSE";

  const filteredCategories = useMemo(
    () => CATEGORIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const trending = useMemo(() => {
    const base = preselected
      ? LISTINGS.filter((l) => l.category === preselected)
      : LISTINGS.filter((l) => l.department === department);
    return base.slice(0, 6);
  }, [preselected, department]);

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Browse" showBack={false} />
      <div className="flex flex-1 flex-col gap-6 px-5 py-5 lg:px-6 lg:py-6">
        <div className="flex h-11 items-center gap-2 rounded-xl border border-border-input bg-surface px-3.5 lg:max-w-sm">
          <Search size={16} className="text-text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-text-faint"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {filteredCategories.map((c) => (
            <Link
              key={c.id}
              href={`/search?category=${c.id}`}
              className="flex items-center gap-3 rounded-xl border border-border-card bg-card px-4 py-3.5 transition-colors hover:border-accent"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-tile text-text-primary">
                <CategoryIcon icon={c.icon} />
              </span>
              <span>
                <span className="block text-[15px]">{c.name}</span>
                <span className="label-mono block text-[10px] text-text-label">{c.listingCount} listings</span>
              </span>
            </Link>
          ))}
        </div>

        <div>
          <p className="label-mono mb-3 text-[11px] text-text-label">
            {preselected ? `${preselected.replace("-", " ").toUpperCase()} LISTINGS` : `TRENDING IN YOUR DEPT`}
          </p>
          <div className="flex flex-col divide-y divide-border-hairline rounded-xl border border-border-card bg-card">
            {trending.map((listing) => {
              const seller = getSeller(listing.sellerId);
              return (
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface"
                >
                  <div className="img-placeholder h-12 w-12 shrink-0 rounded-lg border border-border-card" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px]">{listing.title}</p>
                    <p className="label-mono truncate text-[10px] text-text-label">
                      {seller?.name} · {listing.location}
                    </p>
                  </div>
                  <p className="shrink-0 text-accent-text">{listing.free ? "FREE" : `₹${listing.price}`}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
