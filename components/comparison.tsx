"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Scale, X } from "lucide-react";
type Item = { id: string; name: string };
let cache: Item[] = [];
let raw: string | null = null;
const listeners = new Set<() => void>();
function snapshot() {
  if (typeof window === "undefined") return cache;
  let value: string | null = null;
  try {
    value = localStorage.getItem("ts-compare");
  } catch {}
  if (value !== raw) {
    raw = value;
    try {
      const parsed = JSON.parse(value || "[]");
      cache = Array.isArray(parsed)
        ? parsed
            .filter(
              (v) => typeof v.id === "string" && typeof v.name === "string",
            )
            .slice(0, 4)
        : [];
    } catch {
      cache = [];
    }
  }
  return cache;
}
const empty: Item[] = [];
function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}
function update(items: Item[]) {
  cache = items;
  raw = JSON.stringify(items);
  try {
    localStorage.setItem("ts-compare", raw);
  } catch {}
  listeners.forEach((fn) => fn());
}
export function CompareButton({ id, name }: { id: string; name: string }) {
  const items = useSyncExternalStore(subscribe, snapshot, () => empty);
  const selected = items.some((x) => x.id === id);
  return (
    <button
      type="button"
      className={"compare-button " + (selected ? "selected" : "")}
      aria-pressed={selected}
      disabled={!selected && items.length >= 4}
      title={
        !selected && items.length >= 4
          ? "Remove a laptop from comparison first"
          : undefined
      }
      onClick={() =>
        update(
          selected
            ? items.filter((x) => x.id !== id)
            : [...items, { id, name }],
        )
      }
    >
      <Scale size={16} />
      {selected ? "Added" : "Compare"}
    </button>
  );
}
export function ComparisonTray() {
  const items = useSyncExternalStore(subscribe, snapshot, () => empty);
  if (!items.length) return null;
  return (
    <aside
      className="comparison-tray"
      aria-label="Selected laptops for comparison"
    >
      <div>
        <strong>{items.length} of 4 selected</strong>
        <span className="tray-names">
          {items.map((i) => (
            <button
              key={i.id}
              onClick={() => update(items.filter((x) => x.id !== i.id))}
              aria-label={"Remove " + i.name + " from comparison"}
            >
              {i.name}
              <X size={13} />
            </button>
          ))}
        </span>
      </div>
      <Link
        className="button"
        href={"/compare?ids=" + items.map((x) => x.id).join(",")}
      >
        Compare ({items.length})
      </Link>
      <button
        className="icon-button"
        onClick={() => update([])}
        aria-label="Clear comparison"
      >
        <X size={18} />
      </button>
    </aside>
  );
}
