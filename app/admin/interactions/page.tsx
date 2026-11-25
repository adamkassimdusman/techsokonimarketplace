import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/roles";
import { service } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { sendSupportReply, closeInteraction } from "@/app/interaction-actions";
export const metadata = {
  title: "Client interactions",
  robots: { index: false, follow: false },
};
export default async function Interactions({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const u = await requireUser();
  if (!isAdmin(u.role)) notFound();
  const p = await searchParams;
  const page = Math.min(10000, Math.max(1, Math.floor(Number(p.page) || 1)));
  const d = await service(async (q) => {
    const tickets = await q<{
      id: string;
      subject: string;
      status: string;
      name: string;
    }>(
      "SELECT t.id,t.subject,t.status,u.name FROM support_tickets t JOIN users u ON u.id=t.owner_id ORDER BY t.updated_at DESC,t.id LIMIT 20 OFFSET $1",
      [(page - 1) * 20],
    );
    const reports = await q<{
      id: string;
      reason: string;
      status: string;
      conversation_id: string;
    }>(
      "SELECT id,reason,status,conversation_id FROM conversation_reports WHERE status='open' ORDER BY created_at LIMIT 20",
    );
    return {
      tickets,
      reports,
      messages: await q<{
        id: string;
        ticket_id: string;
        actor_id: string;
        body: string;
        created_at: string;
      }>(
        "SELECT m.* FROM support_messages m WHERE ticket_id=ANY($1::uuid[]) ORDER BY created_at LIMIT 1000",
        [tickets.map((t) => t.id)],
      ),
      reportedMessages: await q<{
        id: string;
        conversation_id: string;
        body: string;
      }>(
        "SELECT m.id,m.conversation_id,m.body FROM messages m WHERE conversation_id=ANY($1::uuid[]) ORDER BY seq DESC LIMIT 200",
        [reports.map((r) => r.conversation_id)],
      ),
    };
  });
  return (
    <div className="wrap section">
      <div className="eyebrow">ADMINISTRATION</div>
      <h1>Client interactions</h1>
      <p>
        Reply to support requests and review conversations explicitly reported
        to moderation.
      </p>
      <Link href="/admin">Back to marketplace operations</Link>
      <h2>Support requests</h2>
      {!d.tickets.length && <p>No support requests yet.</p>}
      {d.tickets.map((t) => (
        <article className="panel" key={t.id}>
          <h3>{t.subject}</h3>
          <p>
            {t.name} · {t.status}
          </p>
          {d.messages
            .filter((m) => m.ticket_id === t.id)
            .map((m) => (
              <div className="message" key={m.id}>
                <small>
                  {m.actor_id === u.id ? "You" : "Participant"} ·{" "}
                  {new Date(m.created_at).toLocaleString("en-KE", {
                    timeZone: "Africa/Nairobi",
                  })}
                </small>
                <p>{m.body}</p>
              </div>
            ))}
          {t.status === "open" && (
            <>
              <ActionForm action={sendSupportReply} label="Send staff reply">
                <input type="hidden" name="ticket" value={t.id} />
                <label>
                  Staff reply
                  <textarea name="body" maxLength={3000} required />
                </label>
              </ActionForm>
              <ActionForm action={closeInteraction} label="Close request">
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="kind" value="ticket" />
                <label className="check">
                  <input
                    type="checkbox"
                    name="confirmed"
                    value="yes"
                    required
                  />
                  I confirm this request has been handled.
                </label>
              </ActionForm>
            </>
          )}
        </article>
      ))}
      <nav className="pagination">
        {page > 1 && (
          <Link href={"?page=" + (page - 1)}>Previous requests</Link>
        )}
        {d.tickets.length === 20 && (
          <Link href={"?page=" + (page + 1)}>Next requests</Link>
        )}
      </nav>
      <h2>Conversation reports</h2>
      {!d.reports.length && <p>No open conversation reports.</p>}
      {d.reports.map((r) => (
        <article key={r.id} className="panel">
          <h3>Reported conversation</h3>
          <p>{r.reason}</p>
          <details>
            <summary>Review reported messages</summary>
            {d.reportedMessages
              .filter((m) => m.conversation_id === r.conversation_id)
              .map((m) => (
                <p key={m.id}>{m.body}</p>
              ))}
          </details>
          <ActionForm action={closeInteraction} label="Resolve report">
            <input type="hidden" name="id" value={r.id} />
            <input type="hidden" name="kind" value="report" />
            <label className="check">
              <input type="checkbox" name="confirmed" value="yes" required />I
              have reviewed this report.
            </label>
          </ActionForm>
        </article>
      ))}
    </div>
  );
}
