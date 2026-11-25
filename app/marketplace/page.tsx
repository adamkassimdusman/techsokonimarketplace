import Link from "next/link";
import { Grid2X2, List, X } from "lucide-react";
import { catalog } from "@/lib/catalog";
import { ListingCard, EmptyCatalog, Filters } from "@/components/catalog";
import { FilterPanel, SortControl } from "@/components/search-controls";
import { interpretSearch, useCases } from "@/lib/discovery";
export const metadata = {
  title: "Browse laptops",
  alternates: { canonical: "/marketplace" },
};
export default async function Marketplace({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = interpretSearch(await searchParams);
  const { rows, total, page } = await catalog(params);
  const query = (changes: Record<string, string | undefined>) => {
    const p = new URLSearchParams(
      Object.entries({ ...params, ...changes }).filter(
        (e): e is [string, string] => !!e[1],
      ),
    );
    return "/marketplace?" + p;
  };
  const active = Object.entries(params).filter(
    ([k, v]) => v && !["page", "sort", "view"].includes(k),
  );
  const labels: Record<string, string> = {
    q: "Search",
    brand: "Brand",
    min: "Min KSh",
    max: "Max KSh",
    ram: "RAM ≥",
    storage: "Storage ≥",
    county: "County",
    use: "Use",
    battery: "Battery ≥",
    inspected: "Inspected",
    seller_type: "Seller",
    gpu: "Graphics",
    model: "Model",
    screen: "Display",
  };
  return (
    <div className="wrap section">
      <div className="eyebrow">FIND YOUR NEXT UPGRADE</div>
      <h1 className="page-title">Laptops for every next step.</h1>
      <div className="browse-layout">
        <FilterPanel count={active.length}>
          <Filters key={JSON.stringify(params)} params={params} />
        </FilterPanel>
        <section className="results-content">
          <div className="results-toolbar">
            <p>
              <strong>{total}</strong> {total === 1 ? "laptop" : "laptops"}{" "}
              available
            </p>
            <div className="results-tools">
              <SortControl params={params} />
              <div className="view-toggle" aria-label="Results view">
                <Link
                  href={query({ view: undefined })}
                  aria-label="Grid view"
                  aria-current={params.view !== "list"}
                >
                  <Grid2X2 size={18} />
                </Link>
                <Link
                  href={query({ view: "list" })}
                  aria-label="List view"
                  aria-current={params.view === "list"}
                >
                  <List size={18} />
                </Link>
              </div>
            </div>
          </div>
          <div className="active-filters">
            {active.map(([key, value]) => (
              <Link
                className="chip active"
                key={key}
                href={query({ [key]: undefined, page: undefined })}
                aria-label={"Remove " + (labels[key] || key) + " filter"}
              >
                {labels[key] || key}:{" "}
                {key === "use" ? useCases[value!]?.label || value : value}
                <X size={13} />
              </Link>
            ))}
            {active.length > 0 && (
              <Link className="chip" href="/marketplace">
                Clear all filters
              </Link>
            )}
          </div>
          {params.use && useCases[params.use] && (
            <p className="notice">
              {useCases[params.use].note} These are transparent search rules,
              not a performance guarantee.
            </p>
          )}
          {params.inspected === "yes" && (
            <p className="notice">
              Physically verified listings are not available yet. A badge will
              only appear after a genuine completed inspection.{" "}
              <Link href="/trust#inspections">How inspections work</Link>.
            </p>
          )}
          {rows.length ? (
            <div
              className={
                "listing-grid browse-grid " +
                (params.view === "list" ? "list-view" : "")
              }
            >
              {rows.map((item) => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyCatalog />
          )}
          <nav className="pagination" aria-label="Pagination">
            {page > 1 && (
              <Link href={query({ page: String(page - 1) })}>
                Previous page
              </Link>
            )}
            {total > 0 && (
              <span>
                Page {page} of {Math.ceil(total / 12)}
              </span>
            )}
            {page * 12 < total && (
              <Link href={query({ page: String(page + 1) })}>Next page</Link>
            )}
          </nav>
        </section>
      </div>
    </div>
  );
}
