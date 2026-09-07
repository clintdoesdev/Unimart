"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/misc";
import { INTEREST_OPTIONS } from "@/lib/mock-data";
import { useSessionStore } from "@/store/session";

export function InterestsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/home";
  const setInterests = useSessionStore((s) => s.setInterests);
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function continueOnboarding() {
    setInterests(selected);
    router.push(next);
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
          {INTEREST_OPTIONS.map((opt) => (
            <Chip key={opt.id} active={selected.includes(opt.id)} onClick={() => toggle(opt.id)} className="px-4 py-2.5">
              {opt.label}
            </Chip>
          ))}
        </div>

        <Button
          size="lg"
          fullWidth
          disabled={selected.length < 3}
          onClick={continueOnboarding}
          className="mt-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
