"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { StatTile, Badge } from "@/components/ui/misc";
import { useSellingStore } from "@/store/selling";
import { useOrdersStore } from "@/store/orders";
import { cn } from "@/lib/cn";
import type { Listing } from "@/lib/types";

const NAV_ITEMS = ["Overview", "Listings", "Orders", "Messages", "Payouts", "Reviews"];
const CHART = [3, 5, 2, 6, 4, 7, 9];

const STATUS_META: Record<Listing["status"], { label: string; tone: "accent" | "muted" }> = {
  live: { label: "LIVE", tone: "accent" },
  draft: { label: "DRAFT", tone: "muted" },
  sold: { label: "SOLD", tone: "muted" },
};

function DashboardContent() {
  const myListings = useSellingStore((s) => s.myListings);
  const setListingStatus = useSellingStore((s) => s.setListingStatus);
  const allOrders = useOrdersStore((s) => s.orders);
  const orders = allOrders.filter((o) => o.role === "selling");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [nav, setNav] = useState("Overview");

  const earned = useMemo(
    () => orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + o.total, 0),
    [orders]
  );
  const active = myListings.filter((l) => l.status === "live").length;
  const views = myListings.reduce((sum, l) => sum + l.views, 0);
  const sales = orders.filter((o) => o.status === "completed").length;

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Seller dashboard" showBack={false} />

      <div className="lg:grid lg:grid-cols-[190px_1fr] lg:gap-8 lg:px-6 lg:py-6">
        <aside className="hidden lg:block">
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => setNav(item)}
                className={cn(
                  "rounded-full px-4 py-2 text-left text-sm",
                  nav === item ? "bg-surface text-text-primary" : "text-text-secondary hover:bg-surface"
                )}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col gap-6 px-5 py-5 lg:px-0 lg:py-0">
          <div className="flex gap-3">
            <StatTile label="EARNED" value={`₹${earned}`} />
            <StatTile label="ACTIVE" value={String(active)} />
            <StatTile label="VIEWS" value={String(views)} />
            <div className="hidden flex-1 lg:block">
              <StatTile label="SALES" value={String(sales)} />
            </div>
          </div>

          <div className="hidden rounded-[28px] bg-card shadow-soft p-5 lg:block">
            <p className="label-mono mb-4 text-[11px] text-text-label">LAST 7 DAYS</p>
            <div className="flex h-32 gap-3">
              {CHART.map((v, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
                  <div
                    className={cn("w-full rounded-t-md", i === CHART.length - 1 ? "bg-accent" : "bg-placeholder-primary")}
                    style={{ height: `${(v / 9) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-3">
              {CHART.map((_, i) => (
                <span key={i} className="label-mono flex-1 text-center text-[9px] text-text-faint">
                  D{i + 1}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="label-mono text-[11px] text-text-label">MY LISTINGS</p>
            <Link href="/sell" className="label-mono hidden text-[11px] text-accent-text lg:block">
              + NEW LISTING
            </Link>
          </div>

          {/* Mobile list */}
          <div className="flex flex-col divide-y divide-border-hairline rounded-[28px] bg-card shadow-soft lg:hidden">
            {myListings.map((listing) => (
              <div key={listing.id} className="flex items-center gap-3 p-3.5">
                <div className="img-placeholder h-12 w-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px]">{listing.title}</p>
                  <p className="label-mono mt-0.5 text-[10px] text-text-label">
                    {listing.status === "sold"
                      ? `SOLD ₹${listing.price}`
                      : listing.status === "draft"
                        ? "DRAFT"
                        : `LIVE · ${listing.saves} SAVES`}
                  </p>
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenuId(openMenuId === listing.id ? null : listing.id)} className="p-1 text-text-tertiary">
                    <MoreHorizontal size={18} />
                  </button>
                  {openMenuId === listing.id && (
                    <div className="absolute right-0 top-8 z-10 w-40 rounded-2xl border border-border-card bg-surface py-1 shadow-elevated">
                      {listing.status !== "sold" && (
                        <button
                          onClick={() => {
                            setListingStatus(listing.id, "sold");
                            setOpenMenuId(null);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-placeholder-secondary"
                        >
                          Mark as sold
                        </button>
                      )}
                      {listing.status === "draft" && (
                        <button
                          onClick={() => {
                            setListingStatus(listing.id, "live");
                            setOpenMenuId(null);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-placeholder-secondary"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-[28px] bg-white shadow-soft lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="label-mono border-b border-border-hairline bg-card text-left text-[10px] text-text-label">
                  <th className="px-4 py-3 font-normal">ITEM</th>
                  <th className="px-4 py-3 font-normal">PRICE</th>
                  <th className="px-4 py-3 font-normal">STATUS</th>
                  <th className="px-4 py-3 font-normal">SAVES</th>
                  <th className="px-4 py-3 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {myListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-border-hairline last:border-0">
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="img-placeholder h-10 w-10 shrink-0 rounded-xl" />
                      <span className="truncate">{listing.title}</span>
                    </td>
                    <td className="px-4 py-3 text-accent-text">₹{listing.price}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_META[listing.status].tone}>{STATUS_META[listing.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3">{listing.saves}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button onClick={() => setOpenMenuId(openMenuId === listing.id ? null : listing.id)} className="p-1 text-text-tertiary">
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenuId === listing.id && (
                          <div className="absolute right-0 top-7 z-10 w-40 rounded-2xl border border-border-card bg-surface py-1 text-left shadow-elevated">
                            {listing.status !== "sold" && (
                              <button
                                onClick={() => {
                                  setListingStatus(listing.id, "sold");
                                  setOpenMenuId(null);
                                }}
                                className="block w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-placeholder-secondary"
                              >
                                Mark as sold
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link
            href="/sell"
            className="flex h-[52px] w-full items-center justify-center rounded-full bg-accent text-[15px] text-white shadow-accent lg:hidden"
          >
            + New listing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGate>
      <DashboardContent />
    </AuthGate>
  );
}
