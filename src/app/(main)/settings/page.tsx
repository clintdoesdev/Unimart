"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { useSessionStore } from "@/store/session";
import { cn } from "@/lib/cn";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-accent" : "bg-placeholder-primary")}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function SettingsContent() {
  const router = useRouter();
  const logout = useSessionStore((s) => s.logout);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [onlyCampus, setOnlyCampus] = useState(false);

  function handleLogout() {
    logout();
    router.push("/welcome");
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Settings" />

      <div className="flex flex-col gap-7 px-5 py-5 lg:mx-auto lg:w-full lg:max-w-lg">
        <section>
          <p className="label-mono mb-2 text-[11px] text-text-label">ACCOUNT</p>
          <div className="flex flex-col divide-y divide-border-hairline rounded-[28px] bg-card shadow-soft">
            {["Edit profile", "Campus & hostel", "Payment methods"].map((label) => (
              <button key={label} className="flex items-center justify-between px-4 py-3.5 text-left text-[15px]">
                {label}
                <ChevronRight size={16} className="text-text-faint" />
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="label-mono mb-2 text-[11px] text-text-label">PREFERENCES</p>
          <div className="flex flex-col divide-y divide-border-hairline rounded-[28px] bg-card shadow-soft">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[15px]">Push notifications</span>
              <Toggle checked={pushNotifs} onChange={setPushNotifs} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[15px]">Dark theme</span>
              <Toggle checked={darkTheme} onChange={setDarkTheme} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[15px]">Only my campus</span>
              <Toggle checked={onlyCampus} onChange={setOnlyCampus} />
            </div>
          </div>
        </section>

        <section>
          <p className="label-mono mb-2 text-[11px] text-text-label">SUPPORT</p>
          <div className="flex flex-col divide-y divide-border-hairline rounded-[28px] bg-card shadow-soft">
            {["Trading rules & safety", "Report a problem"].map((label) => (
              <button key={label} className="flex items-center justify-between px-4 py-3.5 text-left text-[15px]">
                {label}
                <ChevronRight size={16} className="text-text-faint" />
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-4 py-3.5 text-left text-[15px] text-text-destructive"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGate>
      <SettingsContent />
    </AuthGate>
  );
}
