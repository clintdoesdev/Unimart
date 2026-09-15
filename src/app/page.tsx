"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";

export default function RootPage() {
  const router = useRouter();
  const hydrated = useSessionStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    router.replace("/home");
  }, [hydrated, router]);

  return null;
}
