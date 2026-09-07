"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";
import { useHydrationStore } from "@/store/hydration";

export default function RootPage() {
  const router = useRouter();
  const status = useSessionStore((s) => s.status);
  const hydrated = useHydrationStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    router.replace(status === "unverified" ? "/verify" : "/home");
  }, [hydrated, status, router]);

  return null;
}
