"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Plus, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useChatStore } from "@/store/chat";

const TABS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/browse", label: "Browse", icon: LayoutGrid },
  { href: "/sell", label: "Sell", icon: Plus, elevated: true },
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/profile", label: "Me", icon: User },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const unread = useChatStore((s) => s.totalUnread());

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-border-hairline bg-white/95 shadow-elevated backdrop-blur lg:hidden">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        const Icon = tab.icon;
        if (tab.elevated) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 items-center justify-center"
            >
              <span className="-mt-6 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent text-white shadow-elevated ring-4 ring-white">
                <Icon size={22} />
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="relative flex flex-1 flex-col items-center justify-center gap-1"
          >
            <Icon size={20} className={active ? "text-accent-text" : "text-text-tertiary"} />
            <span
              className={cn(
                "label-mono text-[10px]",
                active ? "text-accent-text" : "text-text-tertiary"
              )}
            >
              {tab.label}
            </span>
            {tab.href === "/chats" && unread > 0 && (
              <span className="absolute right-[26%] top-1.5 h-2 w-2 rounded-full bg-accent" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
