"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, Heart } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useBadgeStore } from "@/store/badges";
import { useSessionStore } from "@/store/session";

export function TopBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const cartCount = useBadgeStore((s) => s.cartCount);
  const unread = useBadgeStore((s) => s.unreadChats);
  const unreadNotifs = useBadgeStore((s) => s.unreadNotifications);
  const profile = useSessionStore((s) => s.profile);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="shadow-pill sticky top-0 z-30 hidden h-16 items-center gap-6 bg-white px-6 lg:flex">
      <Link href="/home" className="shrink-0 text-xl font-semibold tracking-tight text-accent">
        Uni Mart
      </Link>

      <form onSubmit={submitSearch} className="relative max-w-md flex-1">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you shopping for today?"
          className="h-12 w-full rounded-full border border-border-input bg-white py-1 pl-5 pr-14 text-sm text-text-primary outline-none placeholder:text-text-secondary"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-accent transition-colors hover:bg-accent-hover"
        >
          <ArrowRight size={16} />
        </button>
      </form>

      <nav className="label-mono flex items-center gap-5 text-[11px] text-text-secondary">
        <Link href="/browse" className="hover:text-text-primary">
          BROWSE
        </Link>
        <Link href="/chats" className="relative hover:text-text-primary">
          CHATS
          {unread > 0 && (
            <span className="absolute -right-2 -top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          )}
        </Link>
        <Link href="/saved" className="hover:text-text-primary">
          SAVED
        </Link>
        <Link href="/cart" className="flex items-center gap-1.5 hover:text-text-primary">
          CART {cartCount > 0 && `(${cartCount})`}
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/notifications" className="relative text-text-secondary hover:text-text-primary">
          <Bell size={19} />
          {unreadNotifs > 0 && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent" />
          )}
        </Link>
        <Link href="/saved" className="text-text-secondary hover:text-text-primary">
          <Heart size={19} />
        </Link>
        <Link
          href="/sell"
          className="label-mono rounded-full bg-accent px-4 py-2.5 text-[11px] text-white shadow-accent hover:bg-accent-hover"
        >
          + SELL
        </Link>
        <Link href="/profile">
          <Avatar name={profile?.fullName ?? "Guest"} size={34} />
        </Link>
      </div>
    </header>
  );
}
