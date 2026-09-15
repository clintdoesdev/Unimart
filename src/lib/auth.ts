"use client";

import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";

export function useAuthGuard() {
  const router = useRouter();
  const status = useSessionStore((s) => s.status);
  const hydrated = useSessionStore((s) => s.hydrated);

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
