import Link from "next/link";
import { QueryForm } from "@/components/search-controls";
import { notFound } from "next/navigation";
import { z } from "zod";
import { service } from "@/lib/db";
import { catalog } from "@/lib/catalog";
import { ListingCard, EmptyCatalog } from "@/components/catalog";
export default async function Seller({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const u = await service(
    async (q) =>
      (
        await q<{
          name: string;
          bio: string;
          seller_type: string;
          created_at: string;
        }>("SELECT name,bio,seller_type,created_at FROM users WHERE id=$1", [
          id,
        ])
      )[0],
  );
  if (!u) notFound();
  const p = await searchParams;
  const { rows, total, page } = await catalog({ ...p, seller: id });
  return (
    <div className="wrap section">
      <div className="eyebrow">
        {u.seller_type === "dealer" ? "DEALER PROFILE" : "INDIVIDUAL SELLER"}
      </div>
      <div className="seller-heading">
        <div className="seller-avatar">{u.name.slice(0, 1)}</div>
        <div>
          <h1>{u.name}</h1>
          <p>
            {u.seller_type === "dealer"
              ? "Dealer storefront"
              : "Private seller"}{" "}
            · {total} available laptops
          </p>
        </div>
      </div>
      <p>{u.bio || "This seller has not added an introduction yet."}</p>
      <p className="muted">
        Joined{" "}
        {new Date(u.created_at).toLocaleDateString("en-KE", {
          month: "long",
          year: "numeric",
        })}{" "}
        · Identity not verified · No eligible purchase reviews yet
      </p>
      <QueryForm action={"/sellers/" + id} className="insights-filters panel">
        <label>
          Search this seller’s stock
          <input
            name="q"
            defaultValue={p.q}
            placeholder="Brand, model or processor"
          />
        </label>
        <label>
          Maximum price (KSh)
          <input name="max" type="number" min={0} defaultValue={p.max} />
        </label>
        <button>Search stock</button>
      </QueryForm>
      <h2>Available laptops</h2>
      {rows.length ? (
        <div className="listing-grid">
          {rows.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyCatalog />
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
        {page * 12 < total && (
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
