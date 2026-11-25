import type { Query } from "./db";
export type OfferInput = {
  conversationId: string;
  decision: "send" | "accept" | "reject";
  offerId?: string;
  amount?: number;
};
/** Caller must wrap this service operation in a transaction. Listing lock serialises all offers. */
export async function negotiate(q: Query, userId: string, input: OfferInput) {
  const c = (
    await q<{
      id: string;
      buyer_id: string;
      seller_id: string;
      listing_id: string;
    }>(
      "SELECT * FROM conversations WHERE id=$1 AND $2 IN (buyer_id,seller_id)",
      [input.conversationId, userId],
    )
  )[0];
  if (!c) throw new Error("This conversation is unavailable.");
  if (
    input.decision !== "reject" &&
    (
      await q<{ blocked: boolean }>(
        "SELECT pair_is_blocked($1,$2) AS blocked",
        [c.buyer_id, c.seller_id],
      )
    )[0].blocked
  )
    throw new Error("This conversation is blocked. Offers are unavailable.");
  const l = (
    await q<{ status: string; negotiable: boolean }>(
      "SELECT status,negotiable FROM listings WHERE id=$1 FOR UPDATE",
      [c.listing_id],
    )
  )[0];
  if (input.decision !== "send") {
    const o = (
      await q<{
        id: string;
        proposer_id: string;
        status: string;
        live: boolean;
      }>(
        "SELECT id,proposer_id,status,expires_at>now() AS live FROM offers WHERE id=$1 AND conversation_id=$2 FOR UPDATE",
        [input.offerId, c.id],
      )
    )[0];
    if (!o || o.proposer_id === userId)
      throw new Error("This offer is no longer actionable.");
    if (
      (input.decision === "accept" &&
        o.status === "accepted" &&
        l.status === "reserved") ||
      (input.decision === "reject" && o.status === "rejected")
    )
      return;
    if (
      l.status !== "published" ||
      !l.negotiable ||
      o.status !== "pending" ||
      !o.live
    )
      throw new Error("This offer is no longer actionable.");
    await q("UPDATE offers SET status=$1 WHERE id=$2", [
      input.decision === "accept" ? "accepted" : "rejected",
      o.id,
    ]);
    if (input.decision === "accept") {
      await q(
        "UPDATE listings SET status='reserved',updated_at=now() WHERE id=$1",
        [c.listing_id],
      );
      await q(
        "UPDATE offers SET status='expired' WHERE id<>$1 AND status='pending' AND conversation_id IN (SELECT id FROM conversations WHERE listing_id=$2)",
        [o.id, c.listing_id],
      );
    }
  } else {
    if (l.status !== "published" || !l.negotiable)
      throw new Error("This listing is not open to offers.");
    if (
      !Number.isSafeInteger(input.amount) ||
      input.amount! < 10000 ||
      input.amount! > 500000000
    )
      throw new Error("Invalid offer amount.");
    const existing = (
      await q<{ id: string }>(
        "SELECT id FROM offers WHERE conversation_id=$1 AND proposer_id=$2 AND amount=$3 AND status='pending' AND expires_at>now()",
        [c.id, userId, input.amount],
      )
    )[0];
    if (existing) return;
    await q(
      "UPDATE offers SET status='expired' WHERE conversation_id=$1 AND status='pending'",
      [c.id],
    );
    await q(
      "INSERT INTO offers(conversation_id,proposer_id,amount) VALUES($1,$2,$3)",
      [c.id, userId, input.amount],
    );
  }
  await q("INSERT INTO notifications(user_id,body) VALUES($1,$2)", [
    userId === c.buyer_id ? c.seller_id : c.buyer_id,
    "An offer was updated. Open your messages to review it.",
  ]);
}
/** Slot lock, validation and same-request retry are atomic; no booking details leak. */
export async function requestInspection(
  q: Query,
  userId: string,
  listingId: string,
  slotId: string,
) {
  const l = (
    await q<{ id: string }>(
      `SELECT l.id FROM listings l WHERE l.id=$1 AND (l.status='published' OR (l.status='reserved' AND (l.seller_id=$2 OR EXISTS(SELECT 1 FROM conversations c JOIN offers o ON o.conversation_id=c.id WHERE c.listing_id=l.id AND c.buyer_id=$2 AND o.status='accepted')))) FOR UPDATE`,
      [listingId, userId],
    )
  )[0];
  if (!l) throw new Error("This laptop is unavailable for inspection.");
  const s = (
    await q<{ id: string }>(
      "SELECT s.id FROM inspection_slots s JOIN locations l ON l.id=s.location_id WHERE s.id=$1 AND s.starts_at>now() AND l.active FOR UPDATE OF s",
      [slotId],
    )
  )[0];
  if (!s) throw new Error("This appointment is no longer available.");
  const existing = (
    await q<{ id: string; requester_id: string; listing_id: string }>(
      "SELECT id,requester_id,listing_id FROM inspections WHERE slot_id=$1",
      [slotId],
    )
  )[0];
  if (existing) {
    if (existing.requester_id === userId && existing.listing_id === listingId)
      return existing.id;
    throw new Error(
      "This appointment has just been booked. Choose another time.",
    );
  }
  return (
    await q<{ id: string }>(
      "INSERT INTO inspections(listing_id,requester_id,slot_id) VALUES($1,$2,$3) RETURNING id",
      [listingId, userId, slotId],
    )
  )[0].id;
}

/** Actor identity is taken from the session; call inside a service transaction. */
export async function releaseReservation(
  q: Query,
  userId: string,
  offerId: string,
  reason: string,
  confirmed: boolean,
) {
  if (!confirmed)
    throw new Error(
      "Please confirm that you want to release this reservation.",
    );
  reason = reason.trim();
  if (reason.length < 10 || reason.length > 1000)
    throw new Error("Please provide a reason between 10 and 1,000 characters.");
  const c = (
    await q<{
      id: string;
      listing_id: string;
      buyer_id: string;
      seller_id: string;
    }>(
      "SELECT c.* FROM conversations c JOIN offers o ON o.conversation_id=c.id WHERE o.id=$1 AND $2 IN (c.buyer_id,c.seller_id)",
      [offerId, userId],
    )
  )[0];
  if (!c) throw new Error("This reservation is unavailable.");
  const l = (
    await q<{ status: string }>(
      "SELECT status FROM listings WHERE id=$1 FOR UPDATE",
      [c.listing_id],
    )
  )[0];
  const o = (
    await q<{ status: string }>(
      "SELECT status FROM offers WHERE id=$1 FOR UPDATE",
      [offerId],
    )
  )[0];
  // Replaying an old release must never affect a later reservation on this device.
  if (o.status === "released") return;
  if (o.status !== "accepted" || l.status !== "reserved")
    throw new Error("This reservation can no longer be released.");
  await q(
    "INSERT INTO reservation_releases(offer_id,actor_id,reason) VALUES($1,$2,$3)",
    [offerId, userId, reason],
  );
  await q("UPDATE offers SET status='released' WHERE id=$1", [offerId]);
  await q("UPDATE listings SET status='pending',updated_at=now() WHERE id=$1", [
    c.listing_id,
  ]);
  await q(
    "INSERT INTO audit_logs(actor_id,action,entity_id) VALUES($1,$2,$3)",
    [userId, "reservation.released", offerId],
  );
  const notice =
    "Reservation released. The laptop is awaiting moderation before it can be listed again. Existing inspection appointments are unchanged. Open Messages to review the reason.";
  await q("INSERT INTO notifications(user_id,body) VALUES($1,$3),($2,$3)", [
    c.buyer_id,
    c.seller_id,
    notice,
  ]);
}
