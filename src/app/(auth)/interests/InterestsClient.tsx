"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/misc";
import { useSessionStore } from "@/store/session";
import { apiGet } from "@/lib/api";
import type { Category } from "@/lib/types";

export function InterestsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/home";
  const setInterests = useSessionStore((s) => s.setInterests);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiGet<{ categories: Category[] }>("/api/categories").then((r) => setCategories(r.categories));
  }, []);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function continueOnboarding() {
    setSubmitting(true);
    try {
      await setInterests(selected);
      router.push(next);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Pick your interests" showBack={false} />
      <div className="flex flex-1 flex-col gap-6 px-5 py-6 lg:mx-auto lg:w-full lg:max-w-md">
        <ProgressBar percent={66} />

        <div>
          <p className="text-lg">What are you into?</p>
          <p className="label-mono mt-1 text-[11px] text-text-label">PICK 3 OR MORE</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {categories.map((opt) => (
            <Chip key={opt.id} active={selected.includes(opt.id)} onClick={() => toggle(opt.id)} className="px-4 py-2.5">
              {opt.name}
            </Chip>
          ))}
        </div>

        <Button
          size="lg"
          fullWidth
          disabled={selected.length < 3 || submitting}
          onClick={continueOnboarding}
          className="mt-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
