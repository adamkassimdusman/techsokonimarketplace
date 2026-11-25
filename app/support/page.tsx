import Link from "next/link";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { transaction } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { openSupport, sendSupportReply } from "@/app/interaction-actions";
export const metadata = {
  title: "Client support",
  robots: { index: false, follow: false },
};
export default async function Support({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const u = await requireUser();
  const p = await searchParams;
  const ticket = z.uuid().safeParse(p.ticket).success ? p.ticket : null;
  const d = await transaction(u, async (q) => ({
    tickets: await q<{ id: string; subject: string; status: string }>(
      "SELECT id,subject,status FROM support_tickets WHERE owner_id=$1 ORDER BY updated_at DESC LIMIT 50",
      [u.id],
    ),
    messages: ticket
      ? await q<{
          id: string;
          actor_id: string;
          body: string;
          created_at: string;
        }>(
          "SELECT m.* FROM support_messages m JOIN support_tickets t ON t.id=m.ticket_id WHERE t.id=$1 AND t.owner_id=$2 ORDER BY m.created_at,m.id LIMIT 200",
          [ticket, u.id],
        )
      : [],
  }));
  const selected = d.tickets.find((t) => t.id === ticket);
  return (
    <div className="wrap section">
      <h1>How can we help?</h1>
      <p>
        Contact Tech Sokoni about your account, a listing or a marketplace
        interaction. Do not include passwords, OTPs or identity documents.
      </p>
      <div className="messages-layout">
        <aside className="panel">
          <h2>Your requests</h2>
          {d.tickets.map((t) => (
            <Link
              key={t.id}
              href={"/support?ticket=" + t.id}
              className="conversation"
            >
              {t.subject}
              <small>{t.status}</small>
            </Link>
          ))}
          {!d.tickets.length && <p>No support requests yet.</p>}
          <Link href="/support">New support request</Link>
        </aside>
        <section className="panel">
          {selected ? (
            <>
              <h2>{selected.subject}</h2>
              <p className="badge">{selected.status}</p>
              {d.messages.map((m) => (
                <div className="message" key={m.id}>
                  <small>
                    {m.actor_id === u.id ? "You" : "Tech Sokoni support"} ·{" "}
                    {new Date(m.created_at).toLocaleString("en-KE", {
                      timeZone: "Africa/Nairobi",
                    })}{" "}
                    EAT
                  </small>
                  <p>{m.body}</p>
                </div>
              ))}
              {selected.status === "open" ? (
                <ActionForm action={sendSupportReply} label="Reply to support">
                  <input type="hidden" name="ticket" value={selected.id} />
                  <label>
                    Your reply
                    <textarea name="body" maxLength={3000} required />
                  </label>
                </ActionForm>
              ) : (
                <p>
                  This request is closed. You can open a new request if you need
                  further help.
                </p>
              )}
            </>
          ) : (
            <>
              <h2>Start a support request</h2>
              <ActionForm action={openSupport} label="Send support request">
                <label>
                  Subject
                  <input
                    name="subject"
                    minLength={5}
                    maxLength={150}
                    required
                  />
                </label>
                <label>
                  How can we help?
                  <textarea
                    name="body"
                    minLength={10}
                    maxLength={3000}
                    required
                  />
                </label>
              </ActionForm>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
