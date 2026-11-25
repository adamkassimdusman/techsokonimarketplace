import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
const db = new PGlite();
let seller: string,
  buyer: string,
  outsider: string,
  listing: string,
  conversation: string;
async function asUser<T>(id: string, run: () => Promise<T>) {
  await db.exec("BEGIN; SET LOCAL ROLE marketplace_app;");
  await db.query(
    "SELECT set_config('app.user_id',$1,true),set_config('app.role','member',true)",
    [id],
  );
  try {
    const v = await run();
    await db.exec("COMMIT");
    return v;
  } catch (e) {
    await db.exec("ROLLBACK");
    throw e;
  }
}
beforeAll(async () => {
  await db.exec(await readFile("db/001_initial.sql", "utf8"));
  await db.exec(
    await readFile("db/002_participant_access_notifications.sql", "utf8"),
  );
  const users = await db.query<{ id: string }>(
    "INSERT INTO users(email,password_hash,name) VALUES('seller@test.invalid','unused','Test seller'),('buyer@test.invalid','unused','Test buyer'),('outsider@test.invalid','unused','Test outsider') RETURNING id",
  );
  [seller, buyer, outsider] = users.rows.map((u) => u.id);
  listing = (
    await db.query<{ id: string }>(
      "INSERT INTO listings(seller_id,brand,model,cpu,ram,storage,storage_type,screen,condition,faults,description,price,county,town,ownership_declared,status) VALUES($1,'HP','Test fixture','Core i5',16,256,'SSD','14 inch','Locally used','None known','Automated test fixture only',3000000,'Nairobi','CBD',true,'published') RETURNING id",
      [seller],
    )
  ).rows[0].id;
  await db.query("INSERT INTO listing_private VALUES($1,'PRIVATE-SERIAL')", [
    listing,
  ]);
  conversation = (
    await db.query<{ id: string }>(
      "INSERT INTO conversations(listing_id,buyer_id,seller_id) VALUES($1,$2,$3) RETURNING id",
      [listing, buyer, seller],
    )
  ).rows[0].id;
  await db.query(
    "INSERT INTO messages(conversation_id,sender_id,body) VALUES($1,$2,'Private message')",
    [conversation, buyer],
  );
});
afterAll(() => db.close());
describe("Database isolation and integrity", () => {
  it("lets guests read published inventory but not private serials", async () => {
    await asUser("", async () => {
      expect((await db.query("SELECT id FROM listings")).rows).toHaveLength(1);
      expect(
        (await db.query("SELECT * FROM listing_private")).rows,
      ).toHaveLength(0);
    });
  });
  it("hides another account conversations and messages", async () => {
    await asUser(outsider, async () => {
      expect((await db.query("SELECT * FROM conversations")).rows).toHaveLength(
        0,
      );
      expect((await db.query("SELECT * FROM messages")).rows).toHaveLength(0);
    });
  });
  it("rejects message injection by a nonparticipant", async () => {
    await expect(
      asUser(outsider, () =>
        db.query(
          "INSERT INTO messages(conversation_id,sender_id,body) VALUES($1,$2,'injected')",
          [conversation, outsider],
        ),
      ),
    ).rejects.toThrow();
  });
  it("rejects spoofed sender identifiers", async () => {
    await expect(
      asUser(buyer, () =>
        db.query(
          "INSERT INTO messages(conversation_id,sender_id,body) VALUES($1,$2,'spoof')",
          [conversation, seller],
        ),
      ),
    ).rejects.toThrow();
  });
  it("allows participants to read and send messages", async () => {
    await asUser(seller, async () => {
      expect((await db.query("SELECT * FROM messages")).rows).toHaveLength(1);
      await db.query(
        "INSERT INTO messages(conversation_id,sender_id,body) VALUES($1,$2,'reply')",
        [conversation, seller],
      );
    });
  });
  it("prevents a seller from directly publishing changed specifications", async () => {
    await expect(
      asUser(seller, () =>
        db.query("UPDATE listings SET ram=32 WHERE id=$1", [listing]),
      ),
    ).rejects.toThrow("Moderation required");
  });
  it("prevents cross-account edits", async () => {
    await asUser(outsider, async () => {
      expect(
        (
          await db.query(
            "UPDATE listings SET status='sold' WHERE id=$1 RETURNING id",
            [listing],
          )
        ).rows,
      ).toHaveLength(0);
    });
  });
  it("prevents role escalation and reading password hashes", async () => {
    await expect(
      asUser(buyer, () =>
        db.query("UPDATE users SET role='admin' WHERE id=$1", [buyer]),
      ),
    ).rejects.toThrow();
    await expect(
      asUser(buyer, () => db.query("SELECT password_hash FROM users")),
    ).rejects.toThrow();
  });
  it("isolates favourites and enforces duplicate uniqueness", async () => {
    await asUser(buyer, () =>
      db.query("INSERT INTO favourites VALUES($1,$2)", [buyer, listing]),
    );
    await expect(
      asUser(buyer, () =>
        db.query("INSERT INTO favourites VALUES($1,$2)", [buyer, listing]),
      ),
    ).rejects.toThrow();
    await asUser(outsider, async () =>
      expect((await db.query("SELECT * FROM favourites")).rows).toHaveLength(0),
    );
  });
  it("prevents direct offer acceptance outside the authorised transaction", async () => {
    await expect(
      asUser(buyer, () =>
        db.query(
          "INSERT INTO offers(conversation_id,proposer_id,amount,status) VALUES($1,$2,10000,'accepted')",
          [conversation, buyer],
        ),
      ),
    ).rejects.toThrow();
  });
  it("enforces one booking per slot", async () => {
    const location = (
      await db.query<{ id: string }>(
        "INSERT INTO locations(name,address,active) VALUES('Test fixture','Not a real office',true) RETURNING id",
      )
    ).rows[0].id;
    const slot = (
      await db.query<{ id: string }>(
        "INSERT INTO inspection_slots(location_id,starts_at) VALUES($1,now()+interval '1 day') RETURNING id",
        [location],
      )
    ).rows[0].id;
    await asUser(buyer, () =>
      db.query(
        "INSERT INTO inspections(listing_id,requester_id,slot_id) VALUES($1,$2,$3)",
        [listing, buyer, slot],
      ),
    );
    await expect(
      asUser(outsider, () =>
        db.query(
          "INSERT INTO inspections(listing_id,requester_id,slot_id) VALUES($1,$2,$3)",
          [listing, outsider, slot],
        ),
      ),
    ).rejects.toThrow();
  });
  it("creates private notifications for the message recipient", async () => {
    await asUser(buyer, async () =>
      expect(
        (
          await db.query("SELECT * FROM notifications WHERE user_id=$1", [
            buyer,
          ])
        ).rows.length,
      ).toBeGreaterThan(0),
    );
    await asUser(outsider, async () =>
      expect((await db.query("SELECT * FROM notifications")).rows).toHaveLength(
        0,
      ),
    );
  });
  it("keeps a reserved listing visible to its accepted buyer only", async () => {
    await db.query(
      "INSERT INTO offers(conversation_id,proposer_id,amount,status) VALUES($1,$2,3000000,'accepted')",
      [conversation, buyer],
    );
    await db.query("UPDATE listings SET status='reserved' WHERE id=$1", [
      listing,
    ]);
    await asUser(buyer, async () =>
      expect(
        (await db.query("SELECT id FROM listings WHERE id=$1", [listing])).rows,
      ).toHaveLength(1),
    );
    await asUser(outsider, async () =>
      expect(
        (await db.query("SELECT id FROM listings WHERE id=$1", [listing])).rows,
      ).toHaveLength(0),
    );
  });
});
