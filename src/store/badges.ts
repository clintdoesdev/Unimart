"use client";

import { create } from "zustand";
import { apiGet } from "@/lib/api";
import type { ConversationSummary, NotificationItem } from "@/lib/types";

interface BadgeState {
  cartCount: number;
  unreadChats: number;
  unreadNotifications: number;
  refreshAll: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshChats: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useBadgeStore = create<BadgeState>()((set, get) => ({
  cartCount: 0,
  unreadChats: 0,
  unreadNotifications: 0,

  refreshAll: async () => {
    await Promise.all([get().refreshCart(), get().refreshChats(), get().refreshNotifications()]);
  },

  refreshCart: async () => {
    try {
      const { groups } = await apiGet<{ groups: { lines: { qty: number }[] }[] }>("/api/cart");
      const count = groups.reduce((sum, g) => sum + g.lines.reduce((s, l) => s + l.qty, 0), 0);
      set({ cartCount: count });
    } catch {
      set({ cartCount: 0 });
    }
  },

  refreshChats: async () => {
    try {
      const { conversations } = await apiGet<{ conversations: ConversationSummary[] }>("/api/conversations");
      set({ unreadChats: conversations.reduce((sum, c) => sum + c.unreadCount, 0) });
    } catch {
      set({ unreadChats: 0 });
    }
  },

  refreshNotifications: async () => {
    try {
      const { items } = await apiGet<{ items: NotificationItem[] }>("/api/notifications");
      set({ unreadNotifications: items.filter((n) => !n.read).length });
    } catch {
      set({ unreadNotifications: 0 });
    }
  },
}));
