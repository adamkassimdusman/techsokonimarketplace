import { currentUser } from "@/lib/auth";
import { transaction } from "@/lib/db";
export async function GET() {
  const u = await currentUser();
  if (!u)
    return Response.json(
      { error: "Authentication required" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  const summary = await transaction(
    u,
    async (q) =>
      (
        await q<{ unread_messages: string; open_support_requests: string }>(
          `SELECT (SELECT count(*) FROM messages m JOIN conversations c ON c.id=m.conversation_id LEFT JOIN conversation_reads r ON r.conversation_id=c.id AND r.user_id=$1 WHERE m.sender_id<>$1 AND m.seq>coalesce(r.last_seq,0)) unread_messages,(SELECT count(*) FROM support_tickets WHERE owner_id=$1 AND status='open') open_support_requests`,
          [u.id],
        )
      )[0],
  );
  return Response.json(
    {
      unreadMessages: Number(summary.unread_messages),
      openSupportRequests: Number(summary.open_support_requests),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
