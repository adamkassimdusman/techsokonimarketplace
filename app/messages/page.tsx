import Link from "next/link";
import { MessageComposer, MessageRefresh } from "@/components/message-composer";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { transaction } from "@/lib/db";
import { ActionForm } from "@/components/action-form";
import { offer, cancelReservation } from "@/app/actions";
import {
  blockUser,
  readConversation,
  flagConversation,
} from "@/app/interaction-actions";
import { money } from "@/lib/validation";
export const metadata = {
  title: "Messages & offers",
  robots: { index: false, follow: false },
};
export default async function Messages({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const u = await requireUser();
  const p = await searchParams;
  const id = z.uuid().safeParse(p.conversation).success ? p.conversation : null;
  const data = await transaction(u, async (q) => ({
    conversations: await q<{
      id: string;
      listing_id: string;
      title: string;
      blocked: boolean;
      blocked_by_me: boolean;
      unread_count: string;
    }>(
      "SELECT c.*,(SELECT brand||' '||model FROM listings WHERE id=c.listing_id) title,pair_is_blocked(c.buyer_id,c.seller_id) blocked,EXISTS(SELECT 1 FROM user_blocks b WHERE b.blocker_id=$1 AND b.blocked_id=CASE WHEN c.buyer_id=$1 THEN c.seller_id ELSE c.buyer_id END) blocked_by_me,(SELECT count(*) FROM messages m LEFT JOIN conversation_reads r ON r.conversation_id=m.conversation_id AND r.user_id=$1 WHERE m.conversation_id=c.id AND m.sender_id<>$1 AND m.seq>coalesce(r.last_seq,0)) unread_count FROM conversations c ORDER BY c.id DESC LIMIT 100",
      [u.id],
    ),
    messages: id
      ? await q<{
          id: string;
          sender_id: string;
          seq: string;
          body: string;
          created_at: string;
        }>(
          "SELECT * FROM (SELECT * FROM messages WHERE conversation_id=$1 ORDER BY seq DESC LIMIT 200) recent ORDER BY seq",
          [id],
        )
      : [],
    listing: id
      ? await q<{ status: string }>(
          "SELECT l.status FROM listings l JOIN conversations c ON c.listing_id=l.id WHERE c.id=$1",
          [id],
        )
      : [],
    releases: id
      ? await q<{
          offer_id: string;
          actor_id: string;
          reason: string;
          created_at: string;
        }>(
          "SELECT r.offer_id,r.actor_id,r.reason,r.created_at FROM reservation_releases r JOIN offers o ON o.id=r.offer_id WHERE o.conversation_id=$1 ORDER BY r.created_at DESC",
          [id],
        )
      : [],
    offers: id
      ? await q<{
          id: string;
          proposer_id: string;
          amount: number;
          status: string;
          expires_at: string;
        }>(
          "SELECT * FROM offers WHERE conversation_id=$1 ORDER BY created_at DESC LIMIT 30",
          [id],
        )
      : [],
  }));
  const selected = data.conversations.find((c) => c.id === id);
  return (
    <div className="wrap section messaging-page">
      <h1>Keep the conversation here.</h1>
      <p className="notice">
        Never share an OTP, send an advance payment to an unknown seller or
        accept a screenshot as payment confirmation.
      </p>
      <div
        className={"messages-layout " + (selected ? "has-conversation" : "")}
      >
        <aside className="panel">
          <h2>Conversations</h2>
          {data.conversations.length ? (
            data.conversations.map((c) => (
              <Link
                className={"conversation " + (c.id === id ? "selected" : "")}
                key={c.id}
                href={"/messages?conversation=" + c.id}
              >
                {c.title || "Laptop enquiry"}
                {Number(c.unread_count) > 0 && (
                  <strong> · {c.unread_count} unread</strong>
                )}
                <small>Reference {c.id.slice(0, 8)}</small>
              </Link>
            ))
          ) : (
            <p>
              Contact a seller from a laptop listing to start a conversation.
            </p>
          )}
        </aside>
        <section className="panel">
          {selected ? (
            <>
              <div className="conversation-tools">
                <Link href="/messages" className="mobile-back">
                  All conversations
                </Link>
                <MessageRefresh />
              </div>
              <Link href={"/laptop/" + selected.listing_id}>
                View related listing
              </Link>
              <div className="button-row">
                <ActionForm
                  action={blockUser}
                  label={selected.blocked_by_me ? "Unblock user" : "Block user"}
                >
                  <input type="hidden" name="conversation" value={id!} />
                  <input
                    type="hidden"
                    name="blocked"
                    value={selected.blocked_by_me ? "no" : "yes"}
                  />
                </ActionForm>
                {Number(selected.unread_count) > 0 && (
                  <ActionForm
                    action={readConversation}
                    label="Mark displayed messages read"
                  >
                    <input type="hidden" name="conversation" value={id!} />
                    <input
                      type="hidden"
                      name="upto"
                      value={data.messages.at(-1)?.seq ?? 0}
                    />
                  </ActionForm>
                )}
              </div>
              {selected.blocked && (
                <p className="notice">
                  This conversation is blocked. New messages and offers are
                  disabled. Existing reservations can still be released.
                </p>
              )}
              <details>
                <summary>Report this conversation</summary>
                <ActionForm
                  action={flagConversation}
                  label="Submit conversation report"
                >
                  <input type="hidden" name="conversation" value={id!} />
                  <label>
                    Report reason
                    <textarea
                      name="reason"
                      minLength={10}
                      maxLength={2000}
                      required
                    />
                  </label>
                  <label className="check">
                    <input
                      type="checkbox"
                      name="confirmed"
                      value="yes"
                      required
                    />
                    I agree to share this conversation with the moderation team
                    for review.
                  </label>
                </ActionForm>
              </details>
              <div className="message-list">
                {data.messages.map((m) => (
                  <div
                    className={
                      "message " + (m.sender_id === u.id ? "mine" : "")
                    }
                    key={m.id}
                  >
                    <small>
                      {m.sender_id === u.id ? "You" : "Other participant"} ·{" "}
                      {new Date(m.created_at).toLocaleString("en-KE", {
                        timeZone: "Africa/Nairobi",
                      })}{" "}
                      EAT
                    </small>
                    <p>{m.body}</p>
                  </div>
                ))}
              </div>
              {!selected.blocked && <MessageComposer conversation={id!} />}
              <h2>Offers</h2>
              {data.offers.map((o) => (
                <div className="offer" key={o.id}>
                  <strong>{money(o.amount)}</strong> ·{" "}
                  {o.status === "pending" && new Date(o.expires_at) < new Date()
                    ? "expired"
                    : o.status}
                  <p className="fine">
                    Expires{" "}
                    {new Date(o.expires_at).toLocaleString("en-KE", {
                      timeZone: "Africa/Nairobi",
                    })}{" "}
                    EAT
                  </p>
                  {o.status === "released" &&
                    data.releases
                      .filter((r) => r.offer_id === o.id)
                      .map((r) => (
                        <section
                          key={r.offer_id}
                          className="notice"
                          role="status"
                        >
                          <strong>Reservation released</strong>
                          <p>{r.reason}</p>
                          <small>
                            Released by{" "}
                            {r.actor_id === u.id
                              ? "you"
                              : "the other participant"}{" "}
                            on{" "}
                            {new Date(r.created_at).toLocaleString("en-KE", {
                              timeZone: "Africa/Nairobi",
                            })}{" "}
                            EAT. Existing inspection appointments are unchanged.
                          </small>
                        </section>
                      ))}
                  {o.status === "accepted" &&
                    data.listing[0]?.status === "reserved" && (
                      <details>
                        <summary>Cancel this reservation</summary>
                        <p>
                          Releasing this reservation removes the buyer’s hold
                          and sends the listing back for moderation. This does
                          not record a payment or cancel existing inspection
                          appointments.
                        </p>
                        <ActionForm
                          action={cancelReservation}
                          label="Release reservation"
                        >
                          <input type="hidden" name="offer" value={o.id} />
                          <label>
                            Reason for releasing
                            <textarea
                              name="reason"
                              required
                              minLength={10}
                              maxLength={1000}
                            />
                          </label>
                          <label className="check">
                            <input
                              type="checkbox"
                              name="confirmed"
                              value="yes"
                              required
                            />
                            I confirm that I want to release this reservation.
                            The reason will be shared with the other
                            participant.
                          </label>
                        </ActionForm>
                      </details>
                    )}
                  {o.status === "pending" &&
                    o.proposer_id !== u.id &&
                    new Date(o.expires_at) > new Date() && (
                      <div className="button-row">
                        {(selected.blocked
                          ? ["reject"]
                          : ["accept", "reject"]
                        ).map((d) => (
                          <ActionForm
                            key={d}
                            action={offer}
                            label={
                              d === "accept" ? "Accept & reserve" : "Reject"
                            }
                          >
                            <input
                              type="hidden"
                              name="conversation"
                              value={id!}
                            />
                            <input type="hidden" name="offer" value={o.id} />
                            <input type="hidden" name="decision" value={d} />
                          </ActionForm>
                        ))}
                      </div>
                    )}
                </div>
              ))}
              {!selected.blocked && (
                <ActionForm action={offer} label="Send offer / counteroffer">
                  <input type="hidden" name="conversation" value={id!} />
                  <label>
                    Your offer (KSh)
                    <input
                      name="amount"
                      type="number"
                      min={100}
                      max={5000000}
                      required
                    />
                  </label>
                </ActionForm>
              )}
              <p className="fine">
                A new offer replaces the previous pending offer. Acceptance
                reserves the laptop and is not proof of payment.
              </p>
            </>
          ) : (
            <p>Select a conversation to see messages and offers.</p>
          )}
        </section>
      </div>
    </div>
  );
}
