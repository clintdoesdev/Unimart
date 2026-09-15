"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { Badge } from "@/components/ui/misc";
import { Button } from "@/components/ui/Button";
import { apiGet, apiPost } from "@/lib/api";
import { useSessionStore } from "@/store/session";
import { cn } from "@/lib/cn";
import type { VendorStatus } from "@/lib/types";

interface AdminVendor {
  id: string;
  businessName: string;
  category: string;
  description: string;
  campus: string;
  status: VendorStatus;
  createdAt: string;
  owner: { email: string; fullName: string };
}

const TABS: { value: VendorStatus | "ALL"; label: string }[] = [
  { value: "PENDING", label: "PENDING" },
  { value: "APPROVED", label: "APPROVED" },
  { value: "REJECTED", label: "REJECTED" },
  { value: "ALL", label: "ALL" },
];

function AdminVendorsContent() {
  const profile = useSessionStore((s) => s.profile);
  const [tab, setTab] = useState<VendorStatus | "ALL">("PENDING");
  const [vendors, setVendors] = useState<AdminVendor[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    const qs = tab === "ALL" ? "" : `?status=${tab}`;
    apiGet<{ vendors: AdminVendor[] }>(`/api/admin/vendors${qs}`)
      .then((r) => setVendors(r.vendors))
      .catch(() => setVendors([]));
  }

  useEffect(load, [tab]);

  if (profile && profile.role !== "ADMIN") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <p className="text-lg">Admins only</p>
        <p className="text-sm text-text-tertiary">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  async function act(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      await apiPost(`/api/admin/vendors/${id}/${action}`);
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="Vendor applications" showBack={false} />

      <div className="border-b border-border-hairline px-5 lg:mx-auto lg:w-full lg:max-w-3xl">
        <div className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "label-mono border-b-2 py-3 text-[11px]",
                tab === t.value ? "border-accent text-text-primary" : "border-transparent text-text-tertiary"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 py-5 lg:mx-auto lg:w-full lg:max-w-3xl">
        {vendors === null ? (
          <p className="py-10 text-center text-sm text-text-tertiary">Loading...</p>
        ) : vendors.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-tertiary">No vendor applications here.</p>
        ) : (
          vendors.map((v) => (
            <div key={v.id} className="rounded-[28px] bg-card shadow-soft p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px]">{v.businessName}</p>
                  <p className="label-mono mt-0.5 text-[10px] text-text-label">
                    {v.category} · {v.campus}
                  </p>
                </div>
                <Badge tone={v.status === "APPROVED" ? "accent" : v.status === "REJECTED" ? "destructive" : "muted"}>
                  {v.status}
                </Badge>
              </div>
              <p className="mt-2.5 text-sm text-text-secondary">{v.description}</p>
              <p className="label-mono mt-2.5 text-[10px] text-text-faint">
                {v.owner.fullName} · {v.owner.email}
              </p>
              {v.status === "PENDING" && (
                <div className="mt-3 flex gap-2.5">
                  <Button size="sm" className="flex-1" onClick={() => act(v.id, "approve")} disabled={busyId === v.id}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => act(v.id, "reject")}
                    disabled={busyId === v.id}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <AuthGate>
      <AdminVendorsContent />
    </AuthGate>
  );
}
