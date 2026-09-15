"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSessionStore } from "@/store/session";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useSessionStore((s) => s.status);
  const hydrated = useSessionStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && status !== "verified") {
      router.replace(`/welcome?next=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, status, pathname, router]);

  if (!hydrated) return null;
  if (status !== "verified") return null;
  return <>{children}</>;
}
