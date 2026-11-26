import {
  setConversationBlock,
  markConversationRead,
  reportConversation,
  changeAdminRole,
  createSupportTicket,
  replySupport,
  resolveInteraction,
} from "../lib/interactions";
import { beforeAll, beforeEach, afterAll, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import type { Query } from "../lib/db";
import {
  negotiate,
  requestInspection,
  releaseReservation,
} from "../lib/workflows";
const db = new PGlite();
const q: Query = async <T extends Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
) => (await db.query<T>(sql, params)).rows;
let seller: string,
  buyer: string,
  rival: string,
  listing: string,
  c1: string,
  c2: string,
  slot: string;
beforeAll(async () => {
  for (const file of [
    "001_initial.sql",
    "002_participant_access_notifications.sql",
    "003_booking_availability.sql",
    "004_reservation_status_guard.sql",
    "005_reservation_releases.sql",
    "006_roles_client_interactions.sql",
    "007_public_seller_directory.sql",
    "008_listing_draft_workspace.sql",
    "009_database_role_membership.sql",
  ])
    await db.exec(await readFile("db/" + file, "utf8"));
});
afterAll(() => db.close());
beforeEach(async () => {
  await db.exec("TRUNCATE users CASCADE");
  [seller, buyer, rival] = (
    await q<{ id: string }>(
      "INSERT INTO users(email,password_hash,name) VALUES('s@test.invalid','unused','Seller'),('b@test.invalid','unused','Buyer'),('r@test.invalid','unused','Rival') RETURNING id",
    )
  ).map((r) => r.id);
  listing = (
    await q<{ id: string }>(
      "INSERT INTO listings(seller_id,brand,model,cpu,ram,storage,storage_type,screen,condition,faults,description,price,county,town,ownership_declared,status) VALUES($1,'HP','Test fixture','Core i5',16,256,'SSD','FHD','Locally used','None known','Test fixture only',3000000,'Nairobi','Test',true,'published') RETURNING id",
      [seller],
    )
  )[0].id;
  [c1, c2] = (
    await q<{ id: string }>(
      "INSERT INTO conversations(listing_id,buyer_id,seller_id) VALUES($1,$2,$4),($1,$3,$4) RETURNING id",
      [listing, buyer, rival, seller],
    )
  ).map((r) => r.id);
  const location = (
    await q<{ id: string }>(
      "INSERT INTO locations(name,address,active) VALUES('Test','Fixture only',true) RETURNING id",
    )
  )[0].id;
  slot = (
    await q<{ id: string }>(
      "INSERT INTO inspection_slots(location_id,starts_at) VALUES($1,now()+interval '1 day') RETURNING id",
      [location],
    )
  )[0].id;
});
async function tx<T>(fn: () => Promise<T>) {
  await q("BEGIN");
  try {
    const result = await fn();
    await q("COMMIT");
    return result;
  } catch (e) {
    await q("ROLLBACK");
    throw e;
  }
}
async function send(conversationId = c1, actor = buyer, amount = 2800000) {
  await tx(() =>
    negotiate(q, actor, { conversationId, decision: "send", amount }),
  );
  return (
    await q<{ id: string }>(
      "SELECT id FROM offers WHERE conversation_id=$1 AND status='pending'",
      [conversationId],
    )
  )[0].id;
}
it("deduplicates a retried offer and sends only one notification", async () => {
  await send();
  await send();
  expect(await q("SELECT id FROM offers")).toHaveLength(1);
  expect(await q("SELECT id FROM notifications")).toHaveLength(1);
});
it("accepts one offer, expires competitors and safely replays acceptance", async () => {
  const first = await send();
  await send(c2, rival, 2900000);
  await tx(() =>
    negotiate(q, seller, {
      conversationId: c1,
      decision: "accept",
      offerId: first,
    }),
  );
  await tx(() =>
    negotiate(q, seller, {
      conversationId: c1,
      decision: "accept",
      offerId: first,
    }),
  );
  expect(
    (await q<{ status: string }>("SELECT status FROM listings"))[0].status,
  ).toBe("reserved");
  expect(await q("SELECT id FROM offers WHERE status='accepted'")).toHaveLength(
    1,
  );
  expect(await q("SELECT id FROM offers WHERE status='expired'")).toHaveLength(
    1,
  );
  expect(await q("SELECT id FROM notifications")).toHaveLength(3);
});
it("rejects self acceptance, outsiders and expired offers", async () => {
  const id = await send();
  await expect(
    tx(() =>
      negotiate(q, buyer, {
        conversationId: c1,
        decision: "accept",
        offerId: id,
      }),
    ),
  ).rejects.toThrow("no longer actionable");
  await expect(
    tx(() =>
      negotiate(q, rival, {
        conversationId: c1,
        decision: "accept",
        offerId: id,
      }),
    ),
  ).rejects.toThrow("unavailable");
  await q("UPDATE offers SET expires_at=now()-interval '1 minute'");
  await expect(
    tx(() =>
      negotiate(q, seller, {
        conversationId: c1,
        decision: "accept",
        offerId: id,
      }),
    ),
  ).rejects.toThrow("no longer actionable");
  expect(
    (await q<{ status: string }>("SELECT status FROM listings"))[0].status,
  ).toBe("published");
});
it("allows counteroffers but only the recipient can accept them", async () => {
  await send();
  const id = await send(c1, seller, 2850000);
  await tx(() =>
    negotiate(q, buyer, {
      conversationId: c1,
      decision: "accept",
      offerId: id,
    }),
  );
  expect(await q("SELECT id FROM offers WHERE status='accepted'")).toHaveLength(
    1,
  );
});
it("retries the same booking but prevents another account taking the slot", async () => {
  const first = await tx(() => requestInspection(q, buyer, listing, slot));
  expect(await tx(() => requestInspection(q, buyer, listing, slot))).toBe(
    first,
  );
  await expect(
    tx(() => requestInspection(q, rival, listing, slot)),
  ).rejects.toThrow("just been booked");
  expect(await q("SELECT id FROM inspections")).toHaveLength(1);
});
it("allows the accepted buyer to inspect a reserved device and rejects others", async () => {
  const id = await send();
  await tx(() =>
    negotiate(q, seller, {
      conversationId: c1,
      decision: "accept",
      offerId: id,
    }),
  );
  await expect(
    tx(() => requestInspection(q, rival, listing, slot)),
  ).rejects.toThrow("unavailable");
  await tx(() => requestInspection(q, buyer, listing, slot));
  expect(await q("SELECT id FROM inspections")).toHaveLength(1);
});
it("hides occupied slots without revealing private appointment records", async () => {
  await tx(() => requestInspection(q, buyer, listing, slot));
  await tx(async () => {
    await q("SET LOCAL ROLE marketplace_app");
    await q("SELECT set_config('app.user_id',$1,true)", [rival]);
    expect(await q("SELECT * FROM inspections")).toHaveLength(0);
    expect(
      await q("SELECT * FROM available_inspection_slots() WHERE id=$1", [slot]),
    ).toHaveLength(0);
  });
});

it("prevents the seller from bypassing a reservation through resubmission", async () => {
  const id = await send();
  await tx(() =>
    negotiate(q, seller, {
      conversationId: c1,
      decision: "accept",
      offerId: id,
    }),
  );
  await expect(
    tx(async () => {
      await q("SET LOCAL ROLE marketplace_app");
      await q(
        "SELECT set_config('app.user_id',$1,true),set_config('app.role','member',true)",
        [seller],
      );
      await q("UPDATE listings SET status='pending' WHERE id=$1", [listing]);
    }),
  ).rejects.toThrow("Reservation must not be bypassed");
  expect(
    (await q<{ status: string }>("SELECT status FROM listings"))[0].status,
  ).toBe("reserved");
});

it.each(["seller", "buyer"])(
  "allows %s to release with history, audit and notifications",
  async (actor) => {
    const id = await send();
    await tx(() =>
      negotiate(q, seller, {
        conversationId: c1,
        decision: "accept",
        offerId: id,
      }),
    );
    await tx(() => requestInspection(q, buyer, listing, slot));
    await tx(() =>
      releaseReservation(
        q,
        actor === "seller" ? seller : buyer,
        id,
        "Changed plans after discussing the device.",
        true,
      ),
    );
    expect(
      (await q<{ status: string }>("SELECT status FROM listings"))[0].status,
    ).toBe("pending");
    expect(
      (
        await q<{ status: string }>("SELECT status FROM offers WHERE id=$1", [
          id,
        ])
      )[0].status,
    ).toBe("released");
    expect(
      await q("SELECT * FROM reservation_releases WHERE offer_id=$1", [id]),
    ).toHaveLength(1);
    expect(
      await q("SELECT * FROM audit_logs WHERE action='reservation.released'"),
    ).toHaveLength(1);
    expect(
      await q(
        "SELECT * FROM notifications WHERE body LIKE 'Reservation released.%'",
      ),
    ).toHaveLength(2);
    expect(
      (await q<{ status: string }>("SELECT status FROM inspections"))[0].status,
    ).toBe("requested");
  },
);
it("denies release by an unrelated buyer and requires explicit confirmation", async () => {
  const id = await send();
  await tx(() =>
    negotiate(q, seller, {
      conversationId: c1,
      decision: "accept",
      offerId: id,
    }),
  );
  await expect(
    tx(() =>
      releaseReservation(q, rival, id, "Attempt from unrelated user.", true),
    ),
  ).rejects.toThrow("unavailable");
  await expect(
    tx(() =>
      releaseReservation(
        q,
        buyer,
        id,
        "Valid reason but no confirmation.",
        false,
      ),
    ),
  ).rejects.toThrow("confirm");
  await expect(
    tx(() => releaseReservation(q, buyer, id, "short", true)),
  ).rejects.toThrow("reason");
  expect(await q("SELECT * FROM reservation_releases")).toHaveLength(0);
  expect(
    (await q<{ status: string }>("SELECT status FROM listings"))[0].status,
  ).toBe("reserved");
});
it("cannot release a pending offer, sold device or suspended listing", async () => {
  const id = await send();
  await expect(
    tx(() =>
      releaseReservation(q, buyer, id, "No reservation exists yet.", true),
    ),
  ).rejects.toThrow("no longer");
  await tx(() =>
    negotiate(q, seller, {
      conversationId: c1,
      decision: "accept",
      offerId: id,
    }),
  );
  for (const status of ["sold", "suspended"]) {
    await q("UPDATE listings SET status=$1", [status]);
    await expect(
      tx(() =>
        releaseReservation(
          q,
          buyer,
          id,
          "Must not reopen a completed or suspended listing.",
          true,
        ),
      ),
    ).rejects.toThrow("no longer");
  }
  expect(await q("SELECT * FROM reservation_releases")).toHaveLength(0);
});
it("replaying a release does not cancel a later reservation or duplicate its audit", async () => {
  const id = await send();
  await tx(() =>
    negotiate(q, seller, {
      conversationId: c1,
      decision: "accept",
      offerId: id,
    }),
  );
  await tx(() =>
    releaseReservation(q, buyer, id, "Buyer changed their plans.", true),
  );
  await q("UPDATE listings SET status='published'");
  const later = await send(c2, rival);
  await tx(() =>
    negotiate(q, seller, {
      conversationId: c2,
      decision: "accept",
      offerId: later,
    }),
  );
  await tx(() =>
    releaseReservation(
      q,
      seller,
      id,
      "Replayed request from earlier reservation.",
      true,
    ),
  );
  expect(
    (await q<{ status: string }>("SELECT status FROM listings"))[0].status,
  ).toBe("reserved");
  expect(
    (
      await q<{ status: string }>("SELECT status FROM offers WHERE id=$1", [
        later,
      ])
    )[0].status,
  ).toBe("accepted");
  expect(await q("SELECT * FROM reservation_releases")).toHaveLength(1);
  expect(
    await q("SELECT * FROM audit_logs WHERE action='reservation.released'"),
  ).toHaveLength(1);
});
it("restricts release reasons to conversation participants and disallows direct writes", async () => {
  const id = await send();
  await tx(() =>
    negotiate(q, seller, {
      conversationId: c1,
      decision: "accept",
      offerId: id,
    }),
  );
  await tx(() =>
    releaseReservation(
      q,
      buyer,
      id,
      "Private reason shared only with seller.",
      true,
    ),
  );
  await tx(async () => {
    await q("SET LOCAL ROLE marketplace_app");
    await q("SELECT set_config('app.user_id',$1,true)", [rival]);
    expect(await q("SELECT * FROM reservation_releases")).toHaveLength(0);
  });
  await tx(async () => {
    await q("SET LOCAL ROLE marketplace_app");
    await q("SELECT set_config('app.user_id',$1,true)", [buyer]);
    expect(await q("SELECT * FROM reservation_releases")).toHaveLength(1);
  });
  await expect(
    tx(async () => {
      await q("SET LOCAL ROLE marketplace_app");
      await q("SELECT set_config('app.user_id',$1,true)", [buyer]);
      await q("DELETE FROM reservation_releases");
    }),
  ).rejects.toThrow();
});

async function scoped<T>(id: string, run: () => Promise<T>, role = "member") {
  return tx(async () => {
    await q("SET LOCAL ROLE marketplace_app");
    await q(
      "SELECT set_config('app.user_id',$1,true),set_config('app.role',$2,true)",
      [id, role],
    );
    return run();
  });
}
it("blocks messages in both directions and prevents new offers, but permits release", async () => {
  const offerId = await send();
  await tx(() =>
    negotiate(q, seller, { conversationId: c1, decision: "accept", offerId }),
  );
  await setConversationBlock(q, buyer, c1, true);
  for (const actor of [buyer, seller])
    await expect(
      scoped(actor, () =>
        q(
          "INSERT INTO messages(conversation_id,sender_id,body) VALUES($1,$2,'Blocked test')",
          [c1, actor],
        ),
      ),
    ).rejects.toThrow(/blocked/);
  await expect(
    tx(() =>
      negotiate(q, seller, {
        conversationId: c1,
        decision: "send",
        amount: 2900000,
      }),
    ),
  ).rejects.toThrow(/blocked/);
  await tx(() =>
    releaseReservation(
      q,
      buyer,
      offerId,
      "Buyer no longer needs this device",
      true,
    ),
  );
  await setConversationBlock(q, seller, c1, false);
  expect(
    (
      await q<{ blocked: boolean }>("SELECT pair_is_blocked($1,$2) blocked", [
        buyer,
        seller,
      ])
    )[0].blocked,
  ).toBe(true);
  await setConversationBlock(q, buyer, c1, false);
  await scoped(buyer, () =>
    q(
      "INSERT INTO messages(conversation_id,sender_id,body) VALUES($1,$2,'Allowed now')",
      [c1, buyer],
    ),
  );
});
it("rejects outsider block/read/report operations and deduplicates open reports", async () => {
  await expect(setConversationBlock(q, rival, c1, true)).rejects.toThrow(
    /unavailable/,
  );
  await expect(markConversationRead(q, rival, c1, 100)).rejects.toThrow(
    /unavailable/,
  );
  await expect(
    reportConversation(q, rival, c1, "Unrelated person reporting"),
  ).rejects.toThrow(/unavailable/);
  await reportConversation(q, buyer, c1, "Please investigate this message");
  await reportConversation(q, buyer, c1, "Duplicate report should not appear");
  expect(await q("SELECT * FROM conversation_reports")).toHaveLength(1);
  expect(
    await scoped(rival, () => q("SELECT * FROM conversation_reports")),
  ).toHaveLength(0);
});
it("caps read positions at stored messages and keeps later messages unread", async () => {
  const first = (
    await q<{ seq: string }>(
      "INSERT INTO messages(conversation_id,sender_id,body) VALUES($1,$2,'First message') RETURNING seq",
      [c1, seller],
    )
  )[0];
  await markConversationRead(q, buyer, c1, Number.MAX_SAFE_INTEGER);
  const second = (
    await q<{ seq: string }>(
      "INSERT INTO messages(conversation_id,sender_id,body) VALUES($1,$2,'Later message') RETURNING seq",
      [c1, seller],
    )
  )[0];
  await markConversationRead(q, buyer, c1, 0);
  expect(
    Number(
      (
        await q<{ last_seq: string }>(
          "SELECT last_seq FROM conversation_reads WHERE user_id=$1",
          [buyer],
        )
      )[0].last_seq,
    ),
  ).toBe(Number(first.seq));
  expect(Number(second.seq)).toBeGreaterThan(Number(first.seq));
  expect(
    await scoped(rival, () => q("SELECT * FROM conversation_reads")),
  ).toHaveLength(0);
});
it("allows only super admins to grant access, revokes sessions and protects super admins", async () => {
  await q("UPDATE users SET role='super_admin' WHERE id=$1", [seller]);
  await q("UPDATE users SET role='admin' WHERE id=$1", [rival]);
  await q(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES('test-token',$1,now()+interval '1 day')",
    [buyer],
  );
  await expect(
    tx(() => changeAdminRole(q, rival, "b@test.invalid", "admin", true)),
  ).rejects.toThrow(/Only/);
  await expect(
    tx(() => changeAdminRole(q, seller, "b@test.invalid", "admin", false)),
  ).rejects.toThrow(/confirm/);
  await tx(() => changeAdminRole(q, seller, "b@test.invalid", "admin", true));
  expect(
    (
      await q<{ role: string }>("SELECT role FROM users WHERE id=$1", [buyer])
    )[0].role,
  ).toBe("admin");
  expect(
    await q("SELECT * FROM sessions WHERE user_id=$1", [buyer]),
  ).toHaveLength(0);
  expect(
    await q("SELECT * FROM audit_logs WHERE action='user.role.admin'"),
  ).toHaveLength(1);
  await expect(
    tx(() => changeAdminRole(q, seller, "s@test.invalid", "member", true)),
  ).rejects.toThrow(/cannot/);
  await tx(() => changeAdminRole(q, seller, "b@test.invalid", "member", true));
  await expect(
    scoped(buyer, () =>
      q("UPDATE users SET role='super_admin' WHERE id=$1", [buyer]),
    ),
  ).rejects.toThrow(/permission/);
  expect(
    (
      await scoped(
        seller,
        () => q<{ yes: boolean }>("SELECT app_admin() yes"),
        "super_admin",
      )
    )[0].yes,
  ).toBe(true);
});
it("keeps support private, supports staff replies and disallows replies after closing", async () => {
  const ticket = await tx(() =>
    createSupportTicket(
      q,
      buyer,
      "Help with my account",
      "Please help me understand listing approvals.",
    ),
  );
  await expect(
    tx(() => replySupport(q, rival, ticket, "Attempted access")),
  ).rejects.toThrow(/unavailable/);
  expect(
    await scoped(rival, () => q("SELECT * FROM support_tickets")),
  ).toHaveLength(0);
  expect(
    await scoped(rival, () => q("SELECT * FROM support_messages")),
  ).toHaveLength(0);
  expect(
    await scoped(buyer, () => q("SELECT * FROM support_messages")),
  ).toHaveLength(1);
  await expect(
    tx(() => resolveInteraction(q, rival, ticket, "ticket")),
  ).rejects.toThrow(/Only/);
  await q("UPDATE users SET role='admin' WHERE id=$1", [seller]);
  await tx(() =>
    replySupport(q, seller, ticket, "We can help with approvals."),
  );
  expect(
    await q("SELECT * FROM audit_logs WHERE action='support.staff_replied'"),
  ).toHaveLength(1);
  await tx(() => resolveInteraction(q, seller, ticket, "ticket"));
  await expect(
    tx(() => replySupport(q, buyer, ticket, "Another reply")),
  ).rejects.toThrow(/closed/);
});
it("keeps autosaved partial drafts private and rejects stale updates", async () => {
  await scoped(buyer, () =>
    q("INSERT INTO listing_drafts(user_id,fields,revision) VALUES($1,$2,2)", [
      buyer,
      JSON.stringify({ model: "Incomplete draft" }),
    ]),
  );
  expect(
    await scoped(rival, () => q("SELECT * FROM listing_drafts")),
  ).toHaveLength(0);
  await expect(
    scoped(rival, () =>
      q(
        "INSERT INTO listing_drafts(user_id,fields,revision) VALUES($1,'{}',3)",
        [buyer],
      ),
    ),
  ).rejects.toThrow();
  await scoped(buyer, () =>
    q(
      "INSERT INTO listing_drafts(user_id,fields,revision) VALUES($1,'{}',1) ON CONFLICT(user_id) DO UPDATE SET fields=excluded.fields,revision=excluded.revision WHERE listing_drafts.revision<excluded.revision",
      [buyer],
    ),
  );
  expect(
    (
      await scoped(buyer, () =>
        q<{ fields: { model: string } }>("SELECT fields FROM listing_drafts"),
      )
    )[0].fields.model,
  ).toBe("Incomplete draft");
});
it("exposes only public seller fields and denies non-owner photo deletion", async () => {
  expect(
    Object.keys(
      (await scoped(buyer, () => q("SELECT * FROM public_sellers()")))[0],
    ).sort(),
  ).toEqual(["created_at", "id", "name", "seller_type"]);
  await q("INSERT INTO images(listing_id,data,position) VALUES($1,$2,0)", [
    listing,
    new Uint8Array([1, 2]),
  ]);
  expect(
    await scoped(buyer, () =>
      q("DELETE FROM images WHERE listing_id=$1 RETURNING id", [listing]),
    ),
  ).toHaveLength(0);
  await q("UPDATE listings SET status='draft' WHERE id=$1", [listing]);
  expect(
    await scoped(seller, () =>
      q("DELETE FROM images WHERE listing_id=$1 RETURNING id", [listing]),
    ),
  ).toHaveLength(1);
});
