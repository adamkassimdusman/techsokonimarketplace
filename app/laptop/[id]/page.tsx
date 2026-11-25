import Link from "next/link";
import { Gallery, ShareListing } from "@/components/gallery";
import { CompareButton } from "@/components/comparison";
import { notFound } from "next/navigation";
import { z } from "zod";
import { listing } from "@/lib/catalog";
import { transaction } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { money } from "@/lib/validation";
import { ActionForm } from "@/components/action-form";
import {
  favourite,
  contact,
  reportListing,
  bookInspection,
} from "@/app/actions";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return {};
  const l = await listing(id);
  return l
    ? {
        title: `${l.brand} ${l.model}`,
        description: l.description.slice(0, 160),
        alternates: { canonical: "/laptop/" + id },
        robots: { index: l.status === "published", follow: true },
      }
    : {};
}
export default async function Detail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const item = await listing(id);
  if (!item) notFound();
  const user = await currentUser();
  const { images, slots, booking } = await transaction(user, async (q) => ({
    images: await q<{ id: string }>(
      "SELECT id FROM images WHERE listing_id=$1 ORDER BY position",
      [id],
    ),
    booking: user
      ? await q<{ status: string }>(
          "SELECT status FROM inspections WHERE listing_id=$1 AND requester_id=$2 AND status IN ('requested','confirmed') ORDER BY created_at DESC LIMIT 1",
          [id, user.id],
        )
      : [],
    slots: await q<{
      id: string;
      name: string;
      address: string;
      starts_at: string;
    }>("SELECT * FROM available_inspection_slots()"),
  }));
  return (
    <div className="wrap section">
      <p className="breadcrumbs">
        <Link href="/marketplace">Marketplace</Link> / {item.brand} /{" "}
        {item.model}
      </p>
      {item.status !== "published" && (
        <p className="notice">Private preview · {item.status}</p>
      )}
      <div className="detail-layout">
        <div>
          <Gallery images={images} name={item.brand + " " + item.model} />
          <div className="product-mobile-action">
            <strong>{money(item.price)}</strong>
            <a className="button" href="#seller-actions">
              Chat & make an offer
            </a>
          </div>
          <div className="detail-sections">
            <h2>The full picture</h2>
            <p>{item.description}</p>
            <h3>Disclosed faults & repairs</h3>
            <p className="notice">{item.faults}</p>
            <h2>
              Specifications <span className="badge">Seller-declared</span>
            </h2>
            <dl>
              {Object.entries({
                Processor: item.cpu,
                RAM: item.ram + " GB",
                Storage: item.storage + " GB " + item.storage_type,
                Graphics: item.gpu,
                Screen: item.screen,
                Condition: item.condition,
                "Battery health":
                  item.battery === null
                    ? "Not provided"
                    : item.battery + "% (not independently measured)",
                Warranty: item.warranty || "No warranty",
                Delivery: item.delivery
                  ? "Available; agree charges with seller"
                  : "Collection only",
              }).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <aside className="detail-summary" id="seller-actions">
          <span className="badge">{item.condition}</span>
          <h1>
            {item.brand} {item.model}
          </h1>
          <strong className="price large">{money(item.price)}</strong>
          <p>
            {item.negotiable ? "Open to offers" : "Fixed price"} · {item.town},{" "}
            {item.county}
          </p>
          <div className="detail-quick-specs">
            <span>{item.cpu}</span>
            <span>{item.ram} GB RAM</span>
            <span>
              {item.storage} GB {item.storage_type}
            </span>
            <span>{item.screen}</span>
          </div>
          <p className="fine">
            Listed {new Date(item.created_at).toLocaleDateString("en-KE")} · Ref{" "}
            {item.id.slice(0, 8)}
          </p>
          <div className="notice">
            Not physically inspected. Specifications and condition are declared
            by the seller.
          </div>
          <h3>
            <Link href={"/sellers/" + item.seller_id}>{item.seller_name}</Link>
          </h3>
          <p className="muted">
            {item.seller_type === "dealer" ? "Dealer" : "Individual seller"} ·
            Identity not verified
          </p>
          <ActionForm action={contact} label="Contact seller / make an offer">
            <input type="hidden" name="listing" value={id} />
          </ActionForm>
          <ActionForm
            action={favourite}
            label="Save laptop"
            className="secondary-action"
          >
            <input type="hidden" name="listing" value={id} />
          </ActionForm>

          <div className="button-row">
            <CompareButton id={id} name={item.brand + " " + item.model} />
            <ShareListing />
          </div>
          <hr />
          <h3>Book an inspection</h3>
          {booking.length ? (
            <p className="success" role="status">
              Inspection {booking[0].status}.{" "}
              <Link href="/dashboard">View your appointment</Link>.{" "}
              {booking[0].status === "requested"
                ? "Wait for administrator confirmation before travelling."
                : ""}
            </p>
          ) : slots.length ? (
            <ActionForm
              action={bookInspection}
              label="Request this appointment"
            >
              <input type="hidden" name="listing" value={id} />
              <label>
                Available appointment
                <select name="slot">
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.address} —{" "}
                      {new Date(s.starts_at).toLocaleString("en-KE", {
                        timeZone: "Africa/Nairobi",
                      })}{" "}
                      EAT
                    </option>
                  ))}
                </select>
              </label>
            </ActionForm>
          ) : (
            <p>No inspection appointments are available yet.</p>
          )}
          <p className="fine">
            Protected checkout is not available. Never share OTPs or send
            advance payments to unknown sellers.
          </p>
          <details>
            <summary>Report this listing</summary>
            <ActionForm action={reportListing} label="Submit report">
              <input type="hidden" name="listing" value={id} />
              <label>
                What concerns you?
                <textarea
                  name="reason"
                  minLength={10}
                  maxLength={2000}
                  required
                />
              </label>
            </ActionForm>
          </details>
        </aside>
      </div>
    </div>
  );
}
