"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Input, Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CAMPUSES } from "@/lib/labels";
import { isUniversityEmail } from "@/lib/university-email";
import { useSessionStore } from "@/store/session";
import { ApiError } from "@/lib/api";

export function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/home";
  const isLogin = searchParams.get("mode") === "login";
  const signUp = useSessionStore((s) => s.signUp);
  const login = useSessionStore((s) => s.login);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState(CAMPUSES[0]);
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailValid = isUniversityEmail(email);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) {
      setError("Use your university email address (.edu / .ac.in)");
      return;
    }
    if (!isLogin && !agree) {
      setError("Please agree to the campus trading rules");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        router.push(next);
      } else {
        await signUp({ fullName: fullName || "Student", email, campus, password });
        router.push(`/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        router.push(`/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`);
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title={isLogin ? "Log in" : "Sign up"} />
      <form onSubmit={submit} className="flex flex-1 flex-col gap-5 px-5 py-6 lg:mx-auto lg:w-full lg:max-w-sm lg:py-16">
        <div className="hidden lg:block">
          <h1 className="text-2xl text-accent">{isLogin ? "Log in" : "Join Uni Mart"}</h1>
        </div>

        {!isLogin && (
          <div>
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
          </div>
        )}

        <div>
          <Label>University email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className={email.length > 0 && !emailValid ? "border-text-destructive" : "border-accent"}
          />
          <p className="mt-1.5 text-xs text-text-tertiary">Must match an allowed university domain</p>
        </div>

        {!isLogin && (
          <div>
            <Label>Campus</Label>
            <Select value={campus} onChange={(e) => setCampus(e.target.value)}>
              {CAMPUSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {!isLogin && (
          <label className="flex items-start gap-2.5 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
            />
            I agree to the campus trading rules
          </label>
        )}

        {error && <p className="text-sm text-text-destructive">{error}</p>}

        <Button type="submit" size="lg" fullWidth disabled={submitting}>
          {submitting ? "Please wait..." : isLogin ? "Log in" : "Send verification code"}
        </Button>

        <p className="text-center text-sm text-text-tertiary">
          {isLogin ? (
            <>
              New here?{" "}
              <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-accent">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={`/signup?mode=login&next=${encodeURIComponent(next)}`} className="text-accent">
                Log in
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
