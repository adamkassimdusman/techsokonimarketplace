import { CompareTable } from "@/components/compare-table";
import { z } from "zod";
import { transaction } from "@/lib/db";
import type { Listing } from "@/lib/catalog";
import { money } from "@/lib/validation";
export const metadata = {
  title: "Compare laptops",
  robots: { index: false, follow: true },
};
export default async function Compare({
  searchParams,
}: {
  searchParams: Promise<{
    ids?: string;
    first?: string;
    second?: string;
    third?: string;
    fourth?: string;
  }>;
}) {
  const params = await searchParams;
  const selected = [
    ...new Set(
      (params.ids
        ? params.ids.split(",")
        : [params.first, params.second, params.third, params.fourth]
      ).filter((id): id is string => !!id && z.uuid().safeParse(id).success),
    ),
  ].slice(0, 4);
  const options = await transaction(null, (q) =>
    q<Listing>(
      "SELECT id,brand,model,price FROM listings WHERE status='published' ORDER BY created_at DESC LIMIT 100",
    ),
  );
  const rows = selected.length
    ? await transaction(null, (q) =>
        q<Listing>(
          "SELECT l.*,s.seller_type,(SELECT id FROM images WHERE listing_id=l.id ORDER BY position LIMIT 1) image_id FROM listings l LEFT JOIN public_sellers() s ON s.id=l.seller_id WHERE l.id=ANY($1::uuid[]) AND l.status='published' ORDER BY array_position($1::uuid[],l.id)",
          [selected],
        ),
      )
    : [];
  return (
    <div className="wrap section">
      <h1>Compare what matters.</h1>
      <p>
        Compare up to four laptops. All specifications below are
        seller-declared.
      </p>
      <form className="panel action-form comparison-selectors">
        {["first", "second", "third", "fourth"].map((name, i) => (
          <label key={name}>
            Laptop {i + 1}
            <select name={name} defaultValue={selected[i] ?? ""}>
              <option value="">Choose a laptop</option>
              {options.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.brand} {l.model} · {money(l.price)}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button>Compare laptops</button>
      </form>
      {rows.length ? (
        <CompareTable rows={rows} />
      ) : (
        <p>Select a laptop from the marketplace to start comparing.</p>
      )}
    </div>
  );
}
