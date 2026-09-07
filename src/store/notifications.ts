"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotificationItem } from "@/lib/types";
import { NOTIFICATIONS } from "@/lib/mock-data";

interface NotificationsState {
  items: NotificationItem[];
  markAllRead: () => void;
  markRead: (id: string) => void;
  unreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: NOTIFICATIONS,
      markAllRead: () =>
        set((state) => ({ items: state.items.map((n) => ({ ...n, read: true })) })),
      markRead: (id) =>
        set((state) => ({
          items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      unreadCount: () => get().items.filter((n) => !n.read).length,
    }),
    { name: "unimart-notifications", skipHydration: true }
  )
);
