import Link from "next/link";
import { Laptop, MapPin } from "lucide-react";
import type { Listing } from "@/lib/catalog";
import { money } from "@/lib/validation";
import { SaveButton } from "./save-button";
import { CompareButton } from "./comparison";
import { QueryForm, PriceFields } from "./search-controls";
export function ListingCard({ item }: { item: Listing }) {
  return (
    <article className="listing-card">
      <Link href={"/laptop/" + item.id} className="product-image">
        {item.image_id ? (
          <img
            src={"/media/" + item.image_id}
            alt={item.brand + " " + item.model + " — actual seller photograph"}
            loading="lazy"
            width={400}
            height={300}
          />
        ) : (
          <Laptop size={48} />
        )}
      </Link>
      <div className="card-body">
        <span className="badge">{item.condition}</span>
        <span
          className="inspection-note"
          title="No independent physical inspection has been recorded. Condition and specifications are supplied by the seller."
        >
          Not inspected
        </span>
        <Link href={"/laptop/" + item.id}>
          <h3>
            {item.brand} {item.model}
          </h3>
        </Link>
        <strong className="price">{money(item.price)}</strong>
        <p className="spec-summary">
          {item.cpu}
          <br />
          {item.ram} GB RAM · {item.storage} GB {item.storage_type}
        </p>
        {item.battery !== null && (
          <p className="fine">Battery {item.battery}% · seller-declared</p>
        )}
        <p className="muted">
          <MapPin size={13} />
          {item.town}, {item.county}
        </p>
        <Link className="fine" href={"/sellers/" + item.seller_id}>
          {item.seller_name || "View seller"}
          {item.seller_type === "dealer" ? " · Dealer" : ""}
        </Link>
        <div className="card-controls">
          <SaveButton id={item.id} saved={item.saved} />
          <CompareButton id={item.id} name={item.brand + " " + item.model} />
        </div>
      </div>
    </article>
  );
}
export function EmptyCatalog() {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Laptop size={36} />
      </span>
      <h3>Your next laptop belongs here.</h3>
      <p>
        No published laptops match these filters yet.
        <br />
        Try a wider search, or be one of our first sellers.
      </p>
      <div className="button-row">
        <Link className="button" href="/sell">
          List your laptop
        </Link>
        <Link className="button secondary" href="/marketplace">
          Clear filters
        </Link>
      </div>
    </div>
  );
}
export function Filters({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  return (
    <QueryForm action="/marketplace" className="filters">
      <h3>Refine your search</h3>
      {params.use && <input type="hidden" name="use" value={params.use} />}
      {params.inspected && (
        <input type="hidden" name="inspected" value={params.inspected} />
      )}
      {params.view && <input type="hidden" name="view" value={params.view} />}
      <label>
        Search
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Brand, model, processor"
        />
      </label>
      <label>
        Brand
        <select name="brand" defaultValue={params.brand}>
          <option value="">All brands</option>
          {[
            "HP",
            "Lenovo",
            "Dell",
            "Apple",
            "ASUS",
            "Acer",
            "Microsoft",
            "Other",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <PriceFields min={params.min} max={params.max} />
      <label>
        Minimum RAM
        <select name="ram" defaultValue={params.ram}>
          <option value="">Any RAM</option>
          {[4, 8, 16, 32, 64].map((x) => (
            <option key={x} value={x}>
              {x} GB
            </option>
          ))}
        </select>
      </label>
      <label>
        Minimum storage
        <select name="storage" defaultValue={params.storage}>
          <option value="">Any capacity</option>
          {[128, 256, 512, 1024].map((x) => (
            <option key={x} value={x}>
              {x} GB
            </option>
          ))}
        </select>
      </label>
      <label>
        Storage type
        <select name="storage_type" defaultValue={params.storage_type}>
          <option value="">All types</option>
          <option>SSD</option>
          <option>HDD</option>
        </select>
      </label>
      <label>
        Condition
        <select name="condition" defaultValue={params.condition}>
          <option value="">All conditions</option>
          {[
            "Brand new",
            "Refurbished",
            "Imported used",
            "Locally used",
            "For parts or repair",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <label>
        County
        <input
          name="county"
          defaultValue={params.county}
          placeholder="e.g. Nairobi"
        />
      </label>
      <details>
        <summary>More specifications</summary>
        <div className="filter-more">
          <label>
            Model or series
            <input
              name="model"
              defaultValue={params.model}
              placeholder="e.g. EliteBook 840"
            />
          </label>
          <label>
            Processor model
            <input
              name="cpu"
              defaultValue={params.cpu}
              placeholder="e.g. i5-8250U"
            />
          </label>
          <label>
            Display description
            <input
              name="screen"
              defaultValue={params.screen}
              placeholder="e.g. 14 inch"
            />
          </label>
          <label>
            Graphics
            <select name="gpu" defaultValue={params.gpu}>
              <option value="">Any graphics</option>
              <option value="dedicated">Declared discrete GPU</option>
            </select>
          </label>
          <label>
            Minimum battery health (%)
            <input
              name="battery"
              type="number"
              min={0}
              max={100}
              defaultValue={params.battery}
            />
          </label>
          <label>
            Seller type
            <select name="seller_type" defaultValue={params.seller_type}>
              <option value="">All sellers</option>
              <option value="individual">Private seller</option>
              <option value="dealer">Dealer</option>
            </select>
          </label>
          {[
            ["negotiable", "Open to offers"],
            ["delivery", "Delivery offered"],
            ["warranty", "Seller offers warranty"],
          ].map(([key, label]) => (
            <label className="check" key={key}>
              <input
                type="checkbox"
                name={key}
                value="yes"
                defaultChecked={params[key] === "yes"}
              />
              {label}
            </label>
          ))}
          <p className="fine">
            Specifications and warranty terms are seller-declared. Confirm exact
            details before buying.
          </p>
        </div>
      </details>
      <label>
        Sort by
        <select name="sort" defaultValue={params.sort}>
          <option value="recent">Recently listed</option>
          <option value="low">Lowest price</option>
          <option value="high">Highest price</option>
          <option value="relevance">Relevance</option>
        </select>
      </label>
      <button>Apply filters</button>
      <Link href="/marketplace" className="muted">
        Reset all filters
      </Link>
    </QueryForm>
  );
}
