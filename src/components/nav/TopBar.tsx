"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Heart, Search } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useCartStore } from "@/store/cart";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";
import { useNotificationsStore } from "@/store/notifications";

export function TopBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const cartCount = useCartStore((s) => s.totalItemCount());
  const unread = useChatStore((s) => s.totalUnread());
  const unreadNotifs = useNotificationsStore((s) => s.unreadCount());
  const profile = useSessionStore((s) => s.profile);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center gap-6 border-b border-border-hairline bg-white px-6 shadow-soft lg:flex">
      <Link href="/home" className="shrink-0 text-xl font-bold text-accent-text">
        Uni Mart
      </Link>

      <form onSubmit={submitSearch} className="flex-1 max-w-md">
        <div className="flex h-10 items-center gap-2 rounded-lg border border-border-input bg-bg px-3">
          <Search size={16} className="text-text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search listings, categories..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-text-faint"
          />
        </div>
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
          className="label-mono rounded-lg bg-accent px-3.5 py-2 text-[11px] text-white shadow-soft hover:bg-accent-text"
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
