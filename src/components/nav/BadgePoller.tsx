"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session";
import { useBadgeStore } from "@/store/badges";

const POLL_MS = 15000;

export function BadgePoller() {
  const status = useSessionStore((s) => s.status);
  const refreshAll = useBadgeStore((s) => s.refreshAll);

  useEffect(() => {
    if (status !== "verified") return;
    refreshAll();
    const interval = setInterval(refreshAll, POLL_MS);
    return () => clearInterval(interval);
  }, [status, refreshAll]);

  return null;
}
