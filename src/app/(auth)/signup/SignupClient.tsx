"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Input, Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CAMPUSES } from "@/lib/mock-data";
import { useSessionStore } from "@/store/session";

export function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/home";
  const isLogin = searchParams.get("mode") === "login";
  const signUp = useSessionStore((s) => s.signUp);
  const verify = useSessionStore((s) => s.verify);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState(CAMPUSES[0]);
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /@[a-z0-9.-]+\.(edu|ac\.in)$/i.test(email) || email.endsWith("university.edu");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) {
      setError("Use your university email address (.edu / .ac.in)");
      return;
    }
    if (!isLogin && !agree) {
      setError("Please agree to the campus trading rules");
      return;
    }
    setError(null);
    signUp({ fullName: fullName || "Student", email, campus });
    if (isLogin) {
      verify();
      router.push(next);
    } else {
      router.push(`/verify?next=${encodeURIComponent(next)}`);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title={isLogin ? "Log in" : "Sign up"} />
      <form onSubmit={submit} className="flex flex-1 flex-col gap-5 px-5 py-6 lg:mx-auto lg:w-full lg:max-w-sm lg:py-16">
        <div className="hidden lg:block">
          <h1 className="text-2xl text-accent-text">{isLogin ? "Log in" : "Join Uni Mart"}</h1>
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

        <Button type="submit" size="lg" fullWidth>
          {isLogin ? "Log in" : "Send verification code"}
        </Button>

        <p className="text-center text-sm text-text-tertiary">
          {isLogin ? (
            <>
              New here?{" "}
              <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-accent-text">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href={`/signup?mode=login&next=${encodeURIComponent(next)}`} className="text-accent-text">
                Log in
              </Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
