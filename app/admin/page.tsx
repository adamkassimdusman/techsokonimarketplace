import { isAdmin } from "@/lib/roles";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { service } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { moderate, configureSlot, confirmInspection } from "@/app/actions";
import type { Listing } from "@/lib/catalog";
export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const u = await requireUser();
  if (!isAdmin(u.role)) notFound();
  const d = await service(async (q) => ({
    metrics: (
      await q<{
        users: string;
        published: string;
        pending: string;
        inspections: string;
      }>(
        "SELECT (SELECT count(*) FROM users) users,(SELECT count(*) FROM listings WHERE status='published') published,(SELECT count(*) FROM listings WHERE status='pending') pending,(SELECT count(*) FROM inspections WHERE status='requested') inspections",
      )
    )[0],
    listings: await q<Listing>(
      "SELECT * FROM listings WHERE status IN ('pending','published','suspended','rejected') ORDER BY updated_at DESC LIMIT 50",
    ),
    reports: await q<{ id: string; listing_id: string; reason: string }>(
      "SELECT id,listing_id,reason FROM reports ORDER BY created_at DESC LIMIT 50",
    ),
    inspections: await q<{
      id: string;
      status: string;
      starts_at: string;
      name: string;
    }>(
      "SELECT i.id,i.status,s.starts_at,l.name FROM inspections i JOIN inspection_slots s ON s.id=i.slot_id JOIN locations l ON l.id=s.location_id ORDER BY s.starts_at DESC LIMIT 50",
    ),
    audit: await q<{ id: string; action: string; created_at: string }>(
      "SELECT id,action,created_at FROM audit_logs ORDER BY created_at DESC LIMIT 30",
    ),
  }));
  return (
    <div className="wrap section">
      <div className="eyebrow">ADMINISTRATION</div>
      <h1>Marketplace operations</h1>
      <div className="metrics">
        {Object.entries(d.metrics).map(([k, v]) => (
          <div key={k}>
            <strong>{v}</strong>
            <span>{k}</span>
          </div>
        ))}
      </div>
      <h2 id="listing-moderation">Listing moderation</h2>
      {d.listings.length ? (
        d.listings.map((l) => (
          <article className="dashboard-item" key={l.id}>
            <div>
              <span className="badge">{l.status}</span>
              <h3>
                <Link href={"/laptop/" + l.id}>
                  {l.brand} {l.model}
                </Link>
              </h3>
              <p>{l.faults}</p>
            </div>
            <ActionForm action={moderate} label="Record decision">
              <input type="hidden" name="listing" value={l.id} />
              <label>
                Decision
                <select name="status">
                  <option value="published">Approve publication</option>
                  <option value="rejected">Reject</option>
                  <option value="suspended">Suspend</option>
                </select>
              </label>
              <label>
                Reason
                <textarea name="note" minLength={5} maxLength={1000} required />
              </label>
              <label className="check">
                <input type="checkbox" required />I have reviewed the photos,
                specifications and faults.
              </label>
            </ActionForm>
          </article>
        ))
      ) : (
        <p>No listings awaiting review.</p>
      )}
      <div className="dashboard-columns">
        <section>
          <h2>Inspection appointments</h2>
          {d.inspections.map((i) => (
            <article key={i.id} className="panel">
              <p>
                {i.name} ·{" "}
                {new Date(i.starts_at).toLocaleString("en-KE", {
                  timeZone: "Africa/Nairobi",
                })}{" "}
                EAT · {i.status}
              </p>
              {i.status === "requested" && (
                <ActionForm
                  action={confirmInspection}
                  label="Confirm appointment"
                >
                  <input type="hidden" name="inspection" value={i.id} />
                </ActionForm>
              )}
            </article>
          ))}
          <h3>Add a real available slot</h3>
          <ActionForm action={configureSlot} label="Add appointment slot">
            <label>
              Approved location name
              <input name="name" required />
            </label>
            <label>
              Public business address
              <input name="address" required />
            </label>
            <label>
              Time including timezone
              <input
                name="starts"
                placeholder="2026-12-01T10:00:00+03:00"
                required
              />
            </label>
          </ActionForm>
        </section>
        <section>
          <h2>Reports</h2>
          {d.reports.length ? (
            d.reports.map((r) => (
              <p key={r.id} className="notice">
                <Link href={"/laptop/" + r.listing_id}>Review listing</Link>:{" "}
                {r.reason}
              </p>
            ))
          ) : (
            <p>No reports.</p>
          )}
          <h2>Audit trail</h2>
          {d.audit.map((a) => (
            <p className="fine" key={a.id}>
              {a.action} · {new Date(a.created_at).toISOString()}
            </p>
          ))}
        </section>
      </div>
    </div>
  );
}
