import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { service } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { manageAdmin } from "@/app/interaction-actions";
export const metadata = {
  title: "Super admin",
  robots: { index: false, follow: false },
};
export default async function SuperAdmin() {
  const u = await requireUser();
  if (u.role !== "super_admin")
    return (
      <div className="narrow section">
        <div className="eyebrow">ACCOUNT ACCESS</div>
        <h1>Super-admin access required</h1>
        <p>
          You are signed in as {u.email}. This account does not have permission
          to manage administrators. Ask the site owner to enable access for this
          email.
        </p>
        <Link href="/dashboard" className="button">
          Back to your account
        </Link>
      </div>
    );
  const { staff, audit } = await service(async (q) => ({
    staff: await q<{ id: string; name: string; email: string; role: string }>(
      "SELECT id,name,email,role FROM users WHERE role IN ('admin','super_admin') ORDER BY name LIMIT 100",
    ),
    audit: await q<{ id: string; action: string; created_at: string }>(
      "SELECT id,action,created_at FROM audit_logs WHERE action LIKE 'user.role.%' OR action LIKE 'operator.%' ORDER BY created_at DESC LIMIT 50",
    ),
  }));
  return (
    <div className="wrap section">
      <div className="eyebrow">SUPER ADMINISTRATOR</div>
      <h1>Manage administrator access</h1>
      <div className="button-row">
        <Link className="button" href="/admin#listing-moderation">
          Listing approvals
        </Link>
        <Link className="button secondary" href="/admin/interactions">
          Client interactions
        </Link>
      </div>
      <div className="dashboard-columns">
        <section>
          <h2>Grant or remove admin access</h2>
          <p>
            The person must already have a registered account. Super-admin roles
            can only be bootstrapped by a local operator.
          </p>
          <ActionForm action={manageAdmin} label="Update administrator access">
            <label>
              Registered account email
              <input type="email" name="email" required />
            </label>
            <label>
              Access level
              <select name="role">
                <option value="admin">Administrator</option>
                <option value="member">Member (remove admin access)</option>
              </select>
            </label>
            <label>
              Your current password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                minLength={12}
                maxLength={128}
              />
            </label>
            <label className="check">
              <input type="checkbox" name="confirmed" value="yes" required />I
              confirm this account’s access should change. Their existing
              sessions will be signed out.
            </label>
          </ActionForm>
        </section>
        <section>
          <h2>Current administrators</h2>
          {staff.map((s) => (
            <article key={s.id} className="panel">
              <strong>{s.name}</strong>
              <p>
                {s.email} · {s.role.replace("_", " ")}
              </p>
            </article>
          ))}
          <h2>Access audit trail</h2>
          {audit.map((a) => (
            <p className="fine" key={a.id}>
              {a.action} ·{" "}
              {new Date(a.created_at).toLocaleString("en-KE", {
                timeZone: "Africa/Nairobi",
              })}{" "}
              EAT
            </p>
          ))}
        </section>
      </div>
    </div>
  );
}
