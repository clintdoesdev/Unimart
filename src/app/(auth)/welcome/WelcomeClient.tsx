"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function WelcomeClient() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/home";

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-10 px-8 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-2xl text-white">
          UM
        </div>
        <h1 className="text-4xl text-accent-text">Uni Mart</h1>
        <p className="max-w-xs text-[15px] text-text-secondary">
          Sign in with your email to message sellers, buy and sell.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="flex h-12 items-center justify-center rounded-full bg-accent text-[15px] text-white shadow-accent transition-colors hover:bg-accent-hover"
        >
          Join with uni email
        </Link>
        <Link
          href={`/signup?mode=login&next=${encodeURIComponent(next)}`}
          className="flex h-12 items-center justify-center rounded-full border border-border-strong text-[15px] text-text-primary"
        >
          I already have an account
        </Link>
        <Link
          href={next}
          className="label-mono mt-2 text-[11px] text-text-tertiary underline underline-offset-4"
        >
          Continue browsing as guest
        </Link>
      </div>
    </div>
  );
}
