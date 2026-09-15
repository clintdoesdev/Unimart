"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiGet, apiPost } from "@/lib/api";
import type { NotificationItem } from "@/lib/types";
import { useBadgeStore } from "@/store/badges";
import { cn } from "@/lib/cn";

function NotificationsContent() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const refreshNotifications = useBadgeStore((s) => s.refreshNotifications);

  function load() {
    apiGet<{ items: NotificationItem[] }>("/api/notifications").then((r) => setItems(r.items));
  }

  useEffect(load, []);

  const today = items.filter((n) => n.group === "today");
  const earlier = items.filter((n) => n.group === "earlier");

  async function markAllRead() {
    await apiPost("/api/notifications/read-all");
    load();
    refreshNotifications();
  }

  async function markRead(id: string) {
    await apiPost(`/api/notifications/${id}/read`);
    load();
    refreshNotifications();
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader
        title="Notifications"
        showBack={false}
        right={
          <button onClick={markAllRead} className="label-mono text-[11px] text-accent-text">
            MARK ALL
          </button>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="flex flex-col lg:mx-auto lg:w-full lg:max-w-2xl lg:py-4">
          {today.length > 0 && (
            <div>
              <p className="label-mono px-5 py-3 text-[11px] text-text-label">TODAY</p>
              {today.map((n) => (
                <NotificationRow key={n.id} message={n.message} createdAt={n.createdAt} read={n.read} onClick={() => markRead(n.id)} />
              ))}
            </div>
          )}
          {earlier.length > 0 && (
            <div>
              <p className="label-mono px-5 py-3 text-[11px] text-text-label">EARLIER</p>
              {earlier.map((n) => (
                <NotificationRow key={n.id} message={n.message} createdAt={n.createdAt} read={n.read} onClick={() => markRead(n.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  message,
  createdAt,
  read,
  onClick,
}: {
  message: string;
  createdAt: string;
  read: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn("flex w-full items-start gap-3 px-5 py-3.5 text-left", !read && "bg-surface")}
    >
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", read ? "bg-text-faint" : "bg-accent")} />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] text-text-primary">{message}</p>
        <p className="label-mono mt-0.5 text-[10px] text-text-label">{new Date(createdAt).toLocaleString()}</p>
      </div>
    </button>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGate>
      <NotificationsContent />
    </AuthGate>
  );
}
