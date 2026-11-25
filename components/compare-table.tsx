"use client";
import { useState } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/catalog";
import { money } from "@/lib/validation";
const fields: [string, (l: Listing) => string][] = [
  ["Price", (l) => money(l.price)],
  ["Processor", (l) => l.cpu],
  ["RAM", (l) => l.ram + " GB"],
  ["Storage", (l) => l.storage + " GB " + l.storage_type],
  ["Graphics", (l) => l.gpu || "Not provided"],
  ["Display", (l) => l.screen],
  [
    "Battery health",
    (l) =>
      l.battery === null ? "Not provided" : l.battery + "% · seller-declared",
  ],
  ["Condition", (l) => l.condition],
  ["Known defects", (l) => l.faults],
  ["Warranty", (l) => l.warranty || "Not provided"],
  [
    "Seller type",
    (l) => (l.seller_type === "dealer" ? "Dealer" : "Private seller"),
  ],
  ["Inspection", () => "Not independently inspected"],
  ["Location", (l) => l.town + ", " + l.county],
];
export function CompareTable({ rows }: { rows: Listing[] }) {
  const [differences, setDifferences] = useState(false);
  return (
    <>
      <label className="check">
        <input
          type="checkbox"
          checked={differences}
          onChange={(e) => setDifferences(e.target.checked)}
        />
        Show differences only
      </label>
      <p className="fine">
        Specifications are seller-declared. Exact CPU model, generation, power
        limits and cooling matter; a Core i7 label alone does not mean faster
        performance.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Compare laptops</th>
              {rows.map((l) => (
                <th key={l.id}>
                  {l.image_id && (
                    <img
                      src={"/media/" + l.image_id}
                      alt={l.brand + " " + l.model}
                      width={130}
                      height={100}
                    />
                  )}
                  <Link href={"/laptop/" + l.id}>
                    {l.brand} {l.model}
                  </Link>
                  <p>
                    <Link
                      className="fine"
                      href={
                        "/compare?ids=" +
                        rows
                          .filter((x) => x.id !== l.id)
                          .map((x) => x.id)
                          .join(",")
                      }
                    >
                      Remove
                    </Link>
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields
              .filter(
                ([, get]) => !differences || new Set(rows.map(get)).size > 1,
              )
              .map(([name, get]) => (
                <tr key={name}>
                  <th scope="row">{name}</th>
                  {rows.map((l) => (
                    <td key={l.id}>{get(l)}</td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
