import Link from "next/link";
import { Store, MapPin } from "lucide-react";
import { service } from "@/lib/db";
import { QueryForm } from "@/components/search-controls";
export const metadata = { title: "Sellers & dealers" };
export default async function Dealers({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const page = Math.max(1, Math.min(10000, Math.floor(Number(p.page) || 1)));
  const rows = await service((q) =>
    q<{
      id: string;
      name: string;
      bio: string;
      count: string;
      locations: string;
    }>(
      "SELECT u.id,u.name,u.bio,count(*) count,string_agg(DISTINCT l.county,', ') locations FROM users u JOIN listings l ON l.seller_id=u.id AND l.status='published' WHERE u.seller_type='dealer' AND ($1='' OR u.name ILIKE $2) AND ($3='' OR l.county ILIKE $4) AND ($5='' OR l.brand=$5) GROUP BY u.id ORDER BY u.name,u.id LIMIT 24 OFFSET $6",
      [
        p.q || "",
        "%" + (p.q || "").slice(0, 80) + "%",
        p.county || "",
        "%" + (p.county || "").slice(0, 60) + "%",
        p.brand || "",
        (page - 1) * 24,
      ],
    ),
  );
  return (
    <div className="wrap section">
      <div className="eyebrow">MEET YOUR NEXT LAPTOP DEALER</div>
      <h1>Sellers & dealers</h1>
      <p>
        Explore businesses with available laptops. Dealer status is
        self-declared; it does not imply business verification.
      </p>
      <QueryForm action="/dealers" className="insights-filters panel">
        <label>
          Business name
          <input name="q" defaultValue={p.q} placeholder="Search dealers" />
        </label>
        <label>
          County
          <input
            name="county"
            defaultValue={p.county}
            placeholder="All Kenya"
          />
        </label>
        <button>Find dealers</button>
        {p.brand && <input type="hidden" name="brand" value={p.brand} />}
      </QueryForm>
      {rows.length ? (
        <div className="dealer-grid">
          {rows.map((u) => (
            <article className="dealer-card" key={u.id}>
              <div className="seller-avatar">
                <Store size={28} />
              </div>
              <h2 style={{ marginTop: 16 }}>{u.name}</h2>
              <p>
                {u.bio || "Browse this dealer’s current marketplace stock."}
              </p>
              <p className="muted">
                <MapPin size={14} /> {u.locations}
              </p>
              <p>
                {u.count} matching {u.count === "1" ? "laptop" : "laptops"}
              </p>
              <Link className="button secondary" href={"/sellers/" + u.id}>
                View store
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <Store size={32} />
          <h2>No matching dealers yet.</h2>
          <p>
            Dealers with approved inventory appear here. Try another location or
            set up your seller profile.
          </p>
          <Link className="button" href="/dashboard">
            Set up your seller profile
          </Link>
        </div>
      )}
      <nav className="pagination">
        {page > 1 && (
          <Link
            href={
              "?" +
              new URLSearchParams({
                ...(p as Record<string, string>),
                page: String(page - 1),
              })
            }
          >
            Previous
          </Link>
        )}
        {rows.length === 24 && (
          <Link
            href={
              "?" +
              new URLSearchParams({
                ...(p as Record<string, string>),
                page: String(page + 1),
              })
            }
          >
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}
