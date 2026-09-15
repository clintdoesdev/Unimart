"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Filter, Grid2x2, List, Search as SearchIcon, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORIES, LISTINGS, conditionLabel, getSeller, handoverLabel } from "@/lib/mock-data";
import type { Condition, HandoverMethod } from "@/lib/types";
import { cn } from "@/lib/cn";

const CONDITIONS: Condition[] = ["new", "like-new", "good", "fair"];
const HANDOVERS: HandoverMethod[] = ["locker", "meet", "deliver"];
const PAGE_SIZE = 8;

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [handovers, setHandovers] = useState<HandoverMethod[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  const activeFilterCount =
    (maxPrice < 5000 ? 1 : 0) + (conditions.length > 0 ? 1 : 0) + (handovers.length > 0 ? 1 : 0);

  const results = useMemo(() => {
    return LISTINGS.filter((l) => {
      if (query && !l.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (category && l.category !== category) return false;
      if (l.price > maxPrice) return false;
      if (conditions.length && !conditions.includes(l.condition)) return false;
      if (handovers.length && !l.handover.some((h) => handovers.includes(h))) return false;
      return true;
    });
  }, [query, category, maxPrice, conditions, handovers]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleIn<T>(arr: T[], value: T, setter: (v: T[]) => void) {
    setter(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  }

  function submitQuery(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    router.replace(`/search?q=${encodeURIComponent(query)}${category ? `&category=${category}` : ""}`);
  }

  const filterControls = (
    <div className="flex flex-col gap-6">
      <div>
        <p className="label-mono mb-3 text-[11px] text-text-label">Category</p>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="h-10 w-full rounded-full border border-border-input bg-surface px-3 text-sm outline-none focus:border-accent"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="label-mono text-[11px] text-text-label">Price range</p>
          <p className="text-sm text-text-secondary">Up to ₹{maxPrice}</p>
        </div>
        <input
          type="range"
          min={0}
          max={5000}
          step={50}
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(Number(e.target.value));
            setPage(1);
          }}
          className="mt-3 w-full accent-[var(--color-accent)]"
        />
      </div>

      <div>
        <p className="label-mono mb-3 text-[11px] text-text-label">Condition</p>
        <div className="flex flex-col gap-2">
          {CONDITIONS.map((c) => (
            <label key={c} className="flex items-center gap-2.5 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={conditions.includes(c)}
                onChange={() => {
                  toggleIn(conditions, c, setConditions);
                  setPage(1);
                }}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              {conditionLabel(c)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="label-mono mb-3 text-[11px] text-text-label">Handover</p>
        <div className="flex flex-col gap-2">
          {HANDOVERS.map((h) => (
            <label key={h} className="flex items-center gap-2.5 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={handovers.includes(h)}
                onChange={() => {
                  toggleIn(handovers, h, setHandovers);
                  setPage(1);
                }}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              {handoverLabel(h)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border-hairline px-4 lg:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-secondary"
        >
          <ChevronLeft size={20} />
        </button>
        <form onSubmit={submitQuery} className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="h-11 w-full rounded-full border border-border-input bg-surface px-4 text-base outline-none focus:border-accent"
          />
        </form>
      </header>

      <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-8 lg:px-6 lg:py-6">
        {/* Desktop filter rail */}
        <aside className="hidden lg:block">
          <form onSubmit={submitQuery} className="mb-6 flex h-11 items-center gap-2 rounded-full border border-border-input bg-surface px-4">
            <SearchIcon size={16} className="text-text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
            />
          </form>
          <p className="label-mono mb-4 text-[11px] text-text-label">
            {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
          </p>
          {filterControls}
        </aside>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between px-5 py-3 lg:px-0 lg:py-0">
            <p className="text-[15px] text-text-secondary">
              {results.length} result{results.length === 1 ? "" : "s"}
              {query && ` for "${query}"`}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="label-mono flex items-center gap-1.5 rounded-full border border-border-input px-3 py-2 text-[11px] text-text-secondary lg:hidden"
              >
                <Filter size={13} />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              <div className="hidden items-center gap-1 lg:flex">
                <button
                  onClick={() => setView("list")}
                  className={cn("rounded-full p-2", view === "list" ? "bg-accent text-white" : "text-text-tertiary")}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={cn("rounded-full p-2", view === "grid" ? "bg-accent text-white" : "text-text-tertiary")}
                  aria-label="Grid view"
                >
                  <Grid2x2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={SearchIcon}
              title="No results found"
              description="Try adjusting your search or filters."
              ctaLabel="Clear filters"
              ctaHref="/search"
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-3 px-5 pb-8 lg:grid-cols-3 lg:px-0 xl:grid-cols-4">
              {pageResults.map((l) => (
                <ProductCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border-hairline px-5 pb-8 lg:px-0">
              {pageResults.map((listing) => {
                const seller = getSeller(listing.sellerId);
                return (
                  <Link
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="flex items-center gap-3 py-3.5 hover:bg-surface"
                  >
                    <div className="img-placeholder h-16 w-16 shrink-0 rounded-xl lg:h-[76px] lg:w-24" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px]">{listing.title}</p>
                      <p className="label-mono mt-0.5 truncate text-[10px] text-text-label">
                        {conditionLabel(listing.condition)} · {seller?.name}
                      </p>
                      <p className="label-mono mt-0.5 text-[10px] text-text-faint">
                        {listing.location} · {listing.distanceMeters}m away
                      </p>
                    </div>
                    <p className="shrink-0 text-accent-text">{listing.free ? "FREE" : `₹${listing.price}`}</p>
                  </Link>
                );
              })}
            </div>
          )}

          {results.length > 0 && (
            <div className="label-mono mt-2 flex items-center justify-center gap-4 pb-8 text-[11px] text-text-secondary">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:text-text-faint">
                PREV
              </button>
              <span>
                PAGE {page} / {pageCount}
              </span>
              <button disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)} className="disabled:text-text-faint">
                NEXT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSheetOpen(false)} />
          <div className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-elevated transition-transform duration-200 ease-out">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong" />
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg">Filters</p>
              <button onClick={() => setSheetOpen(false)} aria-label="Close">
                <X size={20} className="text-text-secondary" />
              </button>
            </div>
            {filterControls}
            <Button fullWidth size="lg" className="mt-6" onClick={() => setSheetOpen(false)}>
              Show {results.length} items
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
