"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function MobileHeader({
  title,
  onBack,
  right,
  showBack = true,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
  showBack?: boolean;
}) {
  const router = useRouter();
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border-hairline px-4 lg:hidden">
      {showBack && (
        <button
          type="button"
          onClick={() => (onBack ? onBack() : router.back())}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 className="flex-1 truncate text-lg">{title}</h1>
      {right}
    </header>
  );
}
