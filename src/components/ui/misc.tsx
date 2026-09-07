"use client";

import { cn } from "@/lib/cn";

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-placeholder-secondary">
      <div
        className="h-full rounded-full bg-accent transition-all duration-200 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-xl border border-border-card bg-card px-3.5 py-3">
      <p className="label-mono text-[10px] text-text-label">{label}</p>
      <p className="mt-1 text-xl">{value}</p>
    </div>
  );
}

export function Badge({
  children,
  tone = "accent",
}: {
  children: React.ReactNode;
  tone?: "accent" | "muted" | "destructive";
}) {
  const toneClasses = {
    accent: "bg-accent text-white",
    muted: "bg-placeholder-primary text-text-secondary",
    destructive: "bg-text-destructive/20 text-text-destructive",
  }[tone];
  return (
    <span className={cn("label-mono rounded-full px-2 py-0.5 text-[10px]", toneClasses)}>
      {children}
    </span>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border border-border-card bg-card", className)}>
      {children}
    </div>
  );
}

export function Stepper({
  qty,
  onChange,
  max,
}: {
  qty: number;
  onChange: (qty: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-input px-1">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center text-lg text-text-secondary disabled:text-text-faint"
        onClick={() => onChange(Math.max(1, qty - 1))}
        disabled={qty <= 1}
      >
        −
      </button>
      <span className="w-4 text-center text-[15px]">{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center text-lg text-text-secondary disabled:text-text-faint"
        onClick={() => onChange(max ? Math.min(max, qty + 1) : qty + 1)}
        disabled={max !== undefined && qty >= max}
      >
        +
      </button>
    </div>
  );
}

export function RadioCard({
  selected,
  title,
  subtitle,
  onSelect,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors duration-150",
        selected ? "border-accent bg-surface" : "border-border-card bg-card"
      )}
    >
      <span
        className={cn(
          "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-accent" : "border-border-strong"
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-accent" />}
      </span>
      <span>
        <span className="block text-[15px]">{title}</span>
        <span className="label-mono block text-[11px] text-text-label">{subtitle}</span>
      </span>
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-xl border border-border-input bg-surface p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "label-mono flex-1 rounded-lg py-2.5 text-[11px] transition-colors duration-150",
            value === opt.value ? "bg-accent text-white" : "text-text-secondary"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function DashedPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border-strong bg-surface p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
