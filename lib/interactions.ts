import type { Query } from "./db";
import { isAdmin } from "./roles";
async function participant(q: Query, userId: string, conversationId: string) {
  const c = (
    await q<{ id: string; buyer_id: string; seller_id: string }>(
      "SELECT id,buyer_id,seller_id FROM conversations WHERE id=$1 AND $2 IN (buyer_id,seller_id)",
      [conversationId, userId],
    )
  )[0];
  if (!c) throw new Error("This conversation is unavailable.");
  return c;
}
async function staff(q: Query, userId: string) {
  const u = (
    await q<{ role: string }>("SELECT role FROM users WHERE id=$1", [userId])
  )[0];
  return isAdmin(u?.role);
}
export async function setConversationBlock(
  q: Query,
  userId: string,
  conversationId: string,
  blocked: boolean,
) {
  const c = await participant(q, userId, conversationId);
  const other = userId === c.buyer_id ? c.seller_id : c.buyer_id;
  if (blocked)
    await q(
      "INSERT INTO user_blocks(blocker_id,blocked_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
      [userId, other],
    );
  else
    await q("DELETE FROM user_blocks WHERE blocker_id=$1 AND blocked_id=$2", [
      userId,
      other,
    ]);
}
export async function markConversationRead(
  q: Query,
  userId: string,
  conversationId: string,
  upto: number,
) {
  await participant(q, userId, conversationId);
  if (!Number.isSafeInteger(upto) || upto < 0)
    throw new Error("Invalid read position.");
  await q(
    "INSERT INTO conversation_reads(user_id,conversation_id,last_seq) SELECT $1,$2,coalesce(max(seq),0) FROM messages WHERE conversation_id=$2 AND seq<=$3 ON CONFLICT(user_id,conversation_id) DO UPDATE SET last_seq=greatest(conversation_reads.last_seq,excluded.last_seq)",
    [userId, conversationId, upto],
  );
}
export async function reportConversation(
  q: Query,
  userId: string,
  conversationId: string,
  reason: string,
) {
  await participant(q, userId, conversationId);
  reason = reason.trim();
  if (reason.length < 10 || reason.length > 2000)
    throw new Error("Please provide a reason between 10 and 2,000 characters.");
  await q(
    "INSERT INTO conversation_reports(conversation_id,reporter_id,reason) VALUES($1,$2,$3) ON CONFLICT(conversation_id,reporter_id) WHERE status='open' DO NOTHING",
    [conversationId, userId, reason],
  );
}
export async function changeAdminRole(
  q: Query,
  actorId: string,
  email: string,
  role: "member" | "admin",
  confirmed: boolean,
) {
  if (!confirmed) throw new Error("Please confirm the role change.");
  const actor = (
    await q<{ role: string }>("SELECT role FROM users WHERE id=$1 FOR UPDATE", [
      actorId,
    ])
  )[0];
  if (actor?.role !== "super_admin")
    throw new Error("Only a super administrator can manage admin access.");
  if (!["member", "admin"].includes(role)) throw new Error("Invalid role.");
  const target = (
    await q<{ id: string; role: string }>(
      "SELECT id,role FROM users WHERE email=$1 FOR UPDATE",
      [email.trim().toLowerCase()],
    )
  )[0];
  if (!target) throw new Error("This registered account was not found.");
  if (target.id === actorId || target.role === "super_admin")
    throw new Error("This super-admin account cannot be changed here.");
  if (target.role === role) return;
  await q("UPDATE users SET role=$1 WHERE id=$2", [role, target.id]);
  await q("DELETE FROM sessions WHERE user_id=$1", [target.id]);
  await q(
    "INSERT INTO audit_logs(actor_id,action,entity_id) VALUES($1,$2,$3)",
    [actorId, "user.role." + role, target.id],
  );
  await q("INSERT INTO notifications(user_id,body) VALUES($1,$2)", [
    target.id,
    role === "admin"
      ? "Administrator access granted. Sign in again to use Listing approvals and Client interactions."
      : "Administrator access removed. Your buyer/seller account remains available.",
  ]);
}
export async function createSupportTicket(
  q: Query,
  userId: string,
  subject: string,
  body: string,
) {
  subject = subject.trim();
  body = body.trim();
  if (
    subject.length < 5 ||
    subject.length > 150 ||
    body.length < 10 ||
    body.length > 3000
  )
    throw new Error(
      "Please provide a subject (5–150 characters) and message (10–3,000 characters).",
    );
  const t = (
    await q<{ id: string }>(
      "INSERT INTO support_tickets(owner_id,subject) VALUES($1,$2) RETURNING id",
      [userId, subject],
    )
  )[0];
  await q(
    "INSERT INTO support_messages(ticket_id,actor_id,body) VALUES($1,$2,$3)",
    [t.id, userId, body],
  );
  return t.id;
}
export async function replySupport(
  q: Query,
  userId: string,
  ticketId: string,
  body: string,
) {
  const t = (
    await q<{ owner_id: string; status: string }>(
      "SELECT owner_id,status FROM support_tickets WHERE id=$1 FOR UPDATE",
      [ticketId],
    )
  )[0];
  const admin = await staff(q, userId);
  if (!t || (!admin && t.owner_id !== userId))
    throw new Error("This support request is unavailable.");
  if (t.status !== "open") throw new Error("This support request is closed.");
  body = body.trim();
  if (body.length < 1 || body.length > 3000)
    throw new Error("Please write a message of up to 3,000 characters.");
  await q(
    "INSERT INTO support_messages(ticket_id,actor_id,body) VALUES($1,$2,$3)",
    [ticketId, userId, body],
  );
  await q("UPDATE support_tickets SET updated_at=now() WHERE id=$1", [
    ticketId,
  ]);
  if (admin && t.owner_id !== userId) {
    await q("INSERT INTO notifications(user_id,body) VALUES($1,$2)", [
      t.owner_id,
      "Your support request has a new staff reply. Open Support to read it.",
    ]);
    await q(
      "INSERT INTO audit_logs(actor_id,action,entity_id) VALUES($1,$2,$3)",
      [userId, "support.staff_replied", ticketId],
    );
  }
}
export async function resolveInteraction(
  q: Query,
  userId: string,
  id: string,
  kind: "ticket" | "report",
) {
  if (!(await staff(q, userId)))
    throw new Error("Only administrators can resolve client interactions.");
  const rows =
    kind === "ticket"
      ? await q(
          "UPDATE support_tickets SET status='closed',updated_at=now() WHERE id=$1 AND status='open' RETURNING id",
          [id],
        )
      : await q(
          "UPDATE conversation_reports SET status='resolved' WHERE id=$1 AND status='open' RETURNING id",
          [id],
        );
  if (rows.length)
    await q(
      "INSERT INTO audit_logs(actor_id,action,entity_id) VALUES($1,$2,$3)",
      [
        userId,
        kind === "ticket" ? "support.closed" : "conversation_report.resolved",
        id,
      ],
    );
}
