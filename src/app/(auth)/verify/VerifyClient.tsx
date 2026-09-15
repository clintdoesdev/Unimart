"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Button } from "@/components/ui/Button";
import { useSessionStore } from "@/store/session";
import { ApiError } from "@/lib/api";

const CODE_LENGTH = 5;

export function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/home";
  const email = searchParams.get("email") ?? "";
  const verifyOtp = useSessionStore((s) => s.verifyOtp);
  const resendOtp = useSessionStore((s) => s.resendOtp);

  const [digits, setDigits] = useState<string[]>(["", "", "", "", ""]);
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function handleChange(i: number, value: string) {
    const char = value.slice(-1).replace(/[^a-zA-Z0-9]/g, "");
    const nextDigits = [...digits];
    nextDigits[i] = char;
    setDigits(nextDigits);
    if (char && i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  const complete = digits.every((d) => d.length === 1);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete || !email) return;
    setError(null);
    setSubmitting(true);
    try {
      await verifyOtp(email, digits.join(""));
      router.push(`/interests?next=${encodeURIComponent(next)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (!email) return;
    try {
      await resendOtp(email);
      setSeconds(30);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError("Please wait a little longer before requesting another code.");
      } else {
        setError("Couldn't resend the code, try again shortly.");
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Verify student status" onBack={() => router.push("/signup")} />
      <form onSubmit={submit} className="flex flex-1 flex-col items-center gap-6 px-5 py-8 text-center">
        <p className="text-[15px] text-text-secondary">
          Enter the 5-character code sent to
          <br />
          <span className="text-text-primary">{email || "your email"}</span>
        </p>

        <div className="flex gap-2.5">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="text"
              className="h-14 w-12 rounded-2xl border border-border-input bg-surface text-center text-xl uppercase outline-none focus:border-accent"
            />
          ))}
        </div>

        {error && <p className="text-sm text-text-destructive">{error}</p>}

        <p className="label-mono text-[11px] text-text-label">
          {seconds > 0 ? (
            `RESEND IN 00:${seconds.toString().padStart(2, "0")}`
          ) : (
            <button type="button" onClick={resend} className="text-accent">
              RESEND CODE
            </button>
          )}
        </p>

        <Button type="submit" size="lg" fullWidth disabled={!complete || submitting} className="mt-auto max-w-xs">
          {submitting ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </div>
  );
}
