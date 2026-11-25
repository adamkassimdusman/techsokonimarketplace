"use client";
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Dialog } from "./ui";
export function QueryForm({
  children,
  className = "",
  action = "/marketplace",
  onApplied,
}: {
  children: ReactNode;
  className?: string;
  action?: string;
  onApplied?: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      action={action}
      className={className}
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        const p = new URLSearchParams();
        new FormData(e.currentTarget).forEach((v, k) => {
          if (typeof v === "string" && v.trim()) p.set(k, v);
        });
        start(() => router.push(action + "?" + p));
        onApplied?.();
      }}
    >
      {children}
      {pending && (
        <span className="fine" role="status">
          Updating results…
        </span>
      )}
    </form>
  );
}
export function FilterPanel({
  children,
  count,
}: {
  children: ReactNode;
  count: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="desktop-filters">{children}</aside>
      <button
        className="secondary mobile-filter-trigger"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal size={16} />
        Filters{count > 0 ? " (" + count + ")" : ""}
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Filter laptops"
        className="filter-sheet"
      >
        <div onSubmit={() => setOpen(false)}>{children}</div>
      </Dialog>
    </>
  );
}
export function SortControl({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  const router = useRouter();
  return (
    <label className="sort-control">
      <span>Sort by</span>
      <select
        aria-label="Sort results"
        value={params.sort || "recent"}
        onChange={(e) => {
          const p = new URLSearchParams(
            Object.entries(params).filter((e): e is [string, string] => !!e[1]),
          );
          p.set("sort", e.target.value);
          p.delete("page");
          router.push("/marketplace?" + p);
        }}
      >
        <option value="recent">Newest listings</option>
        <option value="low">Price: low to high</option>
        <option value="high">Price: high to low</option>
        <option value="relevance">Relevance</option>
      </select>
    </label>
  );
}

export function PriceFields({
  min = "",
  max = "",
}: {
  min?: string;
  max?: string;
}) {
  const [lower, setLower] = useState(min);
  const [upper, setUpper] = useState(max);
  return (
    <div>
      <div className="two-fields">
        <label>
          Min KSh
          <input
            name="min"
            type="number"
            min={0}
            max={5000000}
            value={lower}
            onChange={(e) => setLower(e.target.value)}
            placeholder="0"
          />
        </label>
        <label>
          Max KSh
          <input
            name="max"
            type="number"
            min={0}
            max={5000000}
            value={upper}
            onChange={(e) => setUpper(e.target.value)}
            placeholder="Any"
          />
        </label>
      </div>
      <label className="price-slider-label">
        Adjust maximum budget
        <input
          type="range"
          aria-label="Maximum price slider"
          min={5000}
          max={200000}
          step={5000}
          value={
            upper ? Math.min(200000, Math.max(5000, Number(upper))) : 200000
          }
          onChange={(e) => setUpper(e.target.value)}
        />
      </label>
      <small>Use the fields for amounts above KSh 200,000.</small>
    </div>
  );
}
