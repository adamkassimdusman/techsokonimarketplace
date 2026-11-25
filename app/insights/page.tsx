import Link from "next/link";
import { transaction } from "@/lib/db";
import { money } from "@/lib/validation";
import { QueryForm } from "@/components/search-controls";
export const metadata = { title: "Laptop market insights" };
export default async function Insights({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const rows = await transaction(null, (q) =>
    q<{
      brand: string;
      model: string;
      cpu: string;
      ram: number;
      storage: number;
      storage_type: string;
      condition: string;
      n: string;
      median: number;
      low: number;
      high: number;
      earliest: string;
      latest: string;
    }>(
      "SELECT brand,model,cpu,ram,storage,storage_type,condition,count(*) n,percentile_cont(0.5) WITHIN GROUP(ORDER BY price) median,min(price) low,max(price) high,min(created_at) earliest,max(created_at) latest FROM listings WHERE status='published' AND ($1='' OR brand=$1) AND ($2='' OR model ILIKE $3) GROUP BY brand,model,cpu,ram,storage,storage_type,condition HAVING count(*)>=5 ORDER BY count(*) DESC LIMIT 30",
      [p.brand || "", p.model || "", "%" + (p.model || "").slice(0, 100) + "%"],
    ),
  );
  return (
    <div className="wrap section">
      <div className="eyebrow">KNOW THE MARKET</div>
      <h1>A clearer view of laptop asking prices.</h1>
      <p>
        Compare similar configurations and conditions using active marketplace
        listings.
      </p>
      <QueryForm action="/insights" className="insights-filters panel">
        <label>
          Brand
          <select name="brand" defaultValue={p.brand}>
            <option value="">All brands</option>
            {["HP", "Lenovo", "Dell", "Apple", "ASUS", "Acer"].map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
        <label>
          Model
          <input
            name="model"
            defaultValue={p.model}
            placeholder="e.g. EliteBook 840 G8"
          />
        </label>
        <button>Update insights</button>
      </QueryForm>
      <p className="notice">
        Asking prices, not completed sale prices. Each group needs at least five
        active listings with the same brand, model, exact CPU text, RAM, storage
        and condition. Seller descriptions may differ; inspect the underlying
        listings before drawing conclusions.
      </p>
      {rows.length ? (
        <div className="dealer-grid">
          {rows.map((r, i) => (
            <article className="dealer-card" key={i}>
              <h2>
                {r.brand} {r.model}
              </h2>
              <p>
                {r.cpu} · {r.ram} GB · {r.storage} GB {r.storage_type}
                <br />
                {r.condition}
              </p>
              <p className="fine">
                {r.n} active observations · Listed{" "}
                {new Date(r.earliest).toLocaleDateString("en-KE")}–
                {new Date(r.latest).toLocaleDateString("en-KE")}
              </p>
              <strong className="price">{money(Number(r.median))}</strong>
              <p>Median asking price</p>
              <p className="fine">
                Range {money(r.low)}–{money(r.high)}
              </p>
              <Link
                className="text-link"
                href={
                  "/marketplace?" +
                  new URLSearchParams({
                    brand: r.brand,
                    model: r.model,
                    cpu: r.cpu,
                    ram: String(r.ram),
                    storage: String(r.storage),
                    condition: r.condition,
                  })
                }
              >
                Explore related listings
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>More comparable listings are needed.</h2>
          <p>
            There isn’t enough genuine inventory to publish reliable price
            ranges for this selection yet. We’ll show summaries when a
            comparable group reaches five active listings.
          </p>
          <Link className="button secondary" href="/marketplace">
            Browse current listings
          </Link>
        </div>
      )}
      <section className="section">
        <h2>What these figures can—and can’t—tell you</h2>
        <p>
          A median describes the middle asking price in a group. Battery
          condition, warranty, faults and accessories can still explain
          differences. There is not yet enough recorded history for price trends
          or reliable transaction data for sold-price statistics.
        </p>
      </section>
    </div>
  );
}
