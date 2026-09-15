"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/misc";
import { apiPost, ApiError } from "@/lib/api";
import { CAMPUSES } from "@/lib/labels";
import { useSessionStore } from "@/store/session";

function VendorApplyContent() {
  const router = useRouter();
  const profile = useSessionStore((s) => s.profile);
  const vendor = useSessionStore((s) => s.vendor);
  const refresh = useSessionStore((s) => s.refresh);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Food & drink");
  const [description, setDescription] = useState("");
  const [campus, setCampus] = useState(profile?.campus ?? CAMPUSES[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (vendor && vendor.status !== "REJECTED") {
    return (
      <div className="flex flex-1 flex-col">
        <MobileHeader title="Vendor application" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-tile text-accent">
            <Store size={28} />
          </div>
          <div>
            <p className="text-lg">{vendor.businessName}</p>
            <div className="mt-2 flex justify-center">
              <Badge tone={vendor.status === "APPROVED" ? "accent" : "muted"}>{vendor.status}</Badge>
            </div>
          </div>
          <p className="max-w-xs text-sm text-text-secondary">
            {vendor.status === "APPROVED"
              ? "Your storefront is live. You can publish vendor listings from the sell page."
              : "Your application is under review. We'll notify you once it's approved."}
          </p>
        </div>
      </div>
    );
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      await apiPost("/api/vendor/apply", { businessName, category, description, campus });
      await refresh();
      router.push("/profile");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Sell as a vendor" />
      <div className="flex flex-col gap-5 px-5 py-5 lg:mx-auto lg:w-full lg:max-w-lg">
        <p className="text-sm text-text-secondary">
          Vendor accounts are for verified campus businesses — cafes, print shops, tutoring services and
          more. Approved vendors get a storefront badge and can list ongoing services, not just one-off items.
        </p>

        <div>
          <Label>Business name</Label>
          <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Campus Cafe" />
        </div>

        <div>
          <Label>Category</Label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Food & drink" />
        </div>

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

        <div>
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What do you sell, and why should students trust you?"
          />
        </div>

        {error && <p className="text-sm text-text-destructive">{error}</p>}

        <Button
          size="lg"
          fullWidth
          onClick={submit}
          disabled={submitting || !businessName.trim() || description.trim().length < 10}
        >
          Submit application
        </Button>
      </div>
    </div>
  );
}

export default function VendorApplyPage() {
  return (
    <AuthGate>
      <VendorApplyContent />
    </AuthGate>
  );
}
