"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { MobileHeader } from "@/components/nav/MobileHeader";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Chip } from "@/components/ui/Chip";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { Category, Condition, HandoverMethod } from "@/lib/types";
import { conditionLabel, handoverLabel } from "@/lib/labels";
import { useSessionStore } from "@/store/session";

const CONDITIONS: Condition[] = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
const HANDOVERS: HandoverMethod[] = ["LOCKER", "MEET", "DELIVER"];

function SellContent() {
  const router = useRouter();
  const profile = useSessionStore((s) => s.profile);

  const [categories, setCategories] = useState<Category[]>([]);
  const [photos, setPhotos] = useState(0);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState(() => profile?.course ?? "");
  const [condition, setCondition] = useState<Condition>("GOOD");
  const [description, setDescription] = useState("");
  const [handover, setHandover] = useState<HandoverMethod[]>(["LOCKER"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ categories: Category[] }>("/api/categories").then((r) => {
      setCategories(r.categories);
      if (r.categories.length > 0) setCategory((c) => c || r.categories[0].id);
    });
  }, []);

  function toggleHandover(h: HandoverMethod) {
    setHandover((prev) => (prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]));
  }

  async function save(status: "LIVE" | "DRAFT") {
    setError(null);
    setSaving(true);
    try {
      await apiPost("/api/listings", {
        title: title || "Untitled listing",
        price: Number(price) || 0,
        category,
        department: department || "General",
        condition,
        description,
        handover,
        photoCount: Math.max(1, photos),
        status,
      });
      router.push("/dashboard");
    } catch (e) {
      if (e instanceof ApiError && status === "LIVE") {
        setError(e.message);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <MobileHeader title="New listing" onBack={() => router.push("/dashboard")} />

      <div className="flex flex-col gap-5 px-5 py-5 lg:mx-auto lg:w-full lg:max-w-lg">
        <div>
          <Label>Photos</Label>
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPhotos((p) => Math.min(6, p + 1))}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-border-strong text-text-faint"
            >
              <Plus size={22} />
            </button>
            {Array.from({ length: photos }).map((_, i) => (
              <div key={i} className="relative shrink-0">
                <ImagePlaceholder label={`photo ${i + 1}`} className="h-20 w-20" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => Math.max(0, p - 1))}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-bg text-text-secondary"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Data Structures textbook, 4th ed" />
        </div>

        <div>
          <Label>Price</Label>
          <div className="flex items-center gap-2 rounded-full border border-border-input bg-surface px-3.5">
            <span className="text-text-tertiary">₹</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              inputMode="numeric"
              className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-text-faint"
            />
          </div>
        </div>

        <div>
          <Label>Category</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Department</Label>
          <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. CSE" />
        </div>

        <div>
          <Label>Condition</Label>
          <Select value={condition} onChange={(e) => setCondition(e.target.value as Condition)}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {conditionLabel(c)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Condition, reason for selling, anything a buyer should know..." />
        </div>

        <div>
          <Label>Handover options</Label>
          <div className="flex flex-wrap gap-2">
            {HANDOVERS.map((h) => (
              <Chip key={h} active={handover.includes(h)} onClick={() => toggleHandover(h)}>
                {handoverLabel(h)}
              </Chip>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-text-destructive">{error}</p>}

        <div className="mt-2 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => save("DRAFT")} disabled={saving}>
            Save draft
          </Button>
          <Button className="flex-1" onClick={() => save("LIVE")} disabled={saving || !title || !price || !category}>
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SellPage() {
  return (
    <AuthGate>
      <SellContent />
    </AuthGate>
  );
}
