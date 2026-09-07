"use client";

import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";
import { useHydrationStore } from "@/store/hydration";

export function useAuthGuard() {
  const router = useRouter();
  const status = useSessionStore((s) => s.status);
  const hydrated = useHydrationStore((s) => s.hydrated);

  function requireAuth(intendedPath: string, action?: () => void) {
    if (hydrated && status === "verified") {
      action?.();
      return true;
    }
    router.push(`/welcome?next=${encodeURIComponent(intendedPath)}`);
    return false;
  }

  return { requireAuth, isVerified: status === "verified" };
}
