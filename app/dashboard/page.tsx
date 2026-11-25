import { isAdmin } from "@/lib/roles";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { transaction } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { updateProfile, logout, listingStatus } from "@/app/actions";
import type { Listing } from "@/lib/catalog";
import { money } from "@/lib/validation";
export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};
export default async function Dashboard() {
  const u = await requireUser();
  const data = await transaction(u, async (q) => ({
    listings: await q<Listing>(
      "SELECT * FROM listings WHERE seller_id=$1 ORDER BY created_at DESC LIMIT 100",
      [u.id],
    ),
    notifications: await q<{ id: string; body: string }>(
      "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 30",
    ),
    inspections: await q<{
      id: string;
      status: string;
      starts_at: string;
      name: string;
    }>(
      "SELECT i.id,i.status,s.starts_at,l.name FROM inspections i JOIN inspection_slots s ON s.id=i.slot_id JOIN locations l ON l.id=s.location_id ORDER BY s.starts_at DESC LIMIT 30",
    ),
  }));
  return (
    <div className="wrap section">
      <div className="section-heading horizontal">
        <div>
          <div className="eyebrow">YOUR MARKETPLACE</div>
          <h1 className="page-title">Hello, {u.name}.</h1>
        </div>
        <Link className="button" href="/sell">
          Create a listing
        </Link>
      </div>
      <div className="dashboard-nav">
        <Link href="/messages">Messages & offers</Link>
        <Link href="/favourites">Saved laptops</Link>
        <Link href={"/sellers/" + u.id}>Public profile</Link>
        {isAdmin(u.role) && <Link href="/admin">Administration</Link>}
        {u.role === "super_admin" && (
          <Link href="/super-admin">Super admin</Link>
        )}
        <Link href="/support">Support requests</Link>
        <form action={logout}>
          <button className="secondary">Sign out</button>
        </form>
      </div>
      <h2>Your listings</h2>
      {!data.listings.length && (
        <div className="notice">
          You haven’t listed a laptop yet. Start with its model, specifications
          and real photographs.
        </div>
      )}
      {data.listings.map((l) => (
        <article className="dashboard-item" key={l.id}>
          <div>
            <span className="badge">{l.status}</span>
            <h3>
              <Link href={"/laptop/" + l.id}>
                {l.brand} {l.model}
              </Link>
            </h3>
            <p>
              {money(l.price)} · {l.moderation_note || "No moderation note"}
            </p>
            <Link href={"/sell?edit=" + l.id}>Edit listing</Link>
          </div>
          <ActionForm action={listingStatus} label="Update status">
            <input type="hidden" name="listing" value={l.id} />
            <label>
              Status
              <select name="status">
                <option value="sold">Sold</option>
                <option value="archived">Archived</option>
                <option value="pending">Resubmit for review</option>
              </select>
            </label>
          </ActionForm>
        </article>
      ))}
      <div className="dashboard-columns">
        <section>
          <h2 id="notifications">Notifications</h2>
          {data.notifications.length ? (
            data.notifications.map((n) => (
              <p className="notice" key={n.id}>
                {n.body}
              </p>
            ))
          ) : (
            <p>No notifications yet.</p>
          )}
          <h2>Inspection appointments</h2>
          {data.inspections.length ? (
            data.inspections.map((i) => (
              <p key={i.id}>
                {i.name} ·{" "}
                {new Date(i.starts_at).toLocaleString("en-KE", {
                  timeZone: "Africa/Nairobi",
                })}{" "}
                EAT · {i.status}
              </p>
            ))
          ) : (
            <p>No inspection requests yet.</p>
          )}
        </section>
        <section>
          <h2>Your public profile</h2>
          <ActionForm action={updateProfile} label="Save profile">
            <label>
              Public name
              <input
                name="name"
                defaultValue={u.name}
                minLength={2}
                maxLength={80}
                required
              />
            </label>
            <label>
              Seller type
              <select name="seller_type" defaultValue={u.seller_type}>
                <option value="individual">Individual</option>
                <option value="dealer">Dealer</option>
              </select>
            </label>
            <label>
              About you
              <textarea name="bio" defaultValue={u.bio} maxLength={1000} />
            </label>
            <p className="fine">
              Do not include private addresses, phone numbers or identity
              documents. Choosing “dealer” does not verify your business.
            </p>
          </ActionForm>
        </section>
      </div>
    </div>
  );
}
