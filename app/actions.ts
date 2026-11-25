"use server";
import { isAdmin } from "@/lib/roles";
import { z } from "zod";
import {
  negotiate,
  requestInspection,
  releaseReservation,
} from "@/lib/workflows";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sanitisePhoto } from "@/lib/images";
import { service, transaction } from "@/lib/db";
import { requireUser, createSession, rateLimit } from "@/lib/auth";
import { hashPassword, verifyPassword, digest, token } from "@/lib/security";
import { listingSchema } from "@/lib/validation";
export type Result = { error?: string; success?: string; id?: string };
const str = (f: FormData, k: string) => String(f.get(k) ?? "");
const uuid = (f: FormData, k: string) => z.uuid().parse(str(f, k));
const error = (e: unknown): Result => ({
  error:
    e instanceof z.ZodError
      ? e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
      : e instanceof Error &&
          [
            "Too many attempts",
            "Please",
            "Only",
            "This",
            "Choose",
            "Upload",
            "Invalid",
            "An offer",
            "No ",
            "Email",
          ].some((p) => e.message.startsWith(p))
        ? e.message
        : "The request could not be completed. Check your details and try again.",
});
export async function authenticate(_: Result, f: FormData): Promise<Result> {
  let ok = false;
  try {
    const email = z
      .email()
      .max(254)
      .parse(str(f, "email").toLowerCase().trim());
    const password = z.string().min(12).max(128).parse(str(f, "password"));
    await rateLimit("auth:" + email, 10);
    await rateLimit("auth-ip:" + (await headers()).get("x-forwarded-for"), 50);
    if (str(f, "mode") === "register") {
      const name = z.string().trim().min(2).max(80).parse(str(f, "name"));
      const hash = await hashPassword(password);
      const rows = await service((q) =>
        q<{ id: string }>(
          "INSERT INTO users(email,password_hash,name) VALUES($1,$2,$3) RETURNING id",
          [email, hash, name],
        ),
      );
      await createSession(rows[0].id);
    } else {
      const rows = await service((q) =>
        q<{ id: string; password_hash: string }>(
          "SELECT id,password_hash FROM users WHERE email=$1",
          [email],
        ),
      );
      const fallback = "00000000000000000000000000000000:" + "0".repeat(128);
      const valid = await verifyPassword(
        password,
        rows[0]?.password_hash ?? fallback,
      );
      if (!rows[0] || !valid) return { error: "Invalid email or password." };
      await createSession(rows[0].id);
    }
    ok = true;
  } catch (e) {
    return error(e);
  }
  if (ok) redirect("/dashboard");
  return {};
}
export async function logout() {
  const jar = await cookies();
  const value = jar.get("ts_session")?.value;
  if (value)
    await service((q) =>
      q("DELETE FROM sessions WHERE token_hash=$1", [digest(value)]),
    );
  jar.delete("ts_session");
  redirect("/");
}
export async function resetPassword(_: Result, f: FormData): Promise<Result> {
  try {
    const reset = str(f, "token");
    if (reset) {
      const password = z.string().min(12).max(128).parse(str(f, "password"));
      const hash = await hashPassword(password);
      await service(async (q) => {
        const row = (
          await q<{ user_id: string }>(
            "DELETE FROM reset_tokens WHERE token_hash=$1 AND expires_at>now() RETURNING user_id",
            [digest(reset)],
          )
        )[0];
        if (!row) throw new Error("Invalid or expired reset link.");
        await q("UPDATE users SET password_hash=$1 WHERE id=$2", [
          hash,
          row.user_id,
        ]);
        await q("DELETE FROM sessions WHERE user_id=$1", [row.user_id]);
      });
      return { success: "Password updated. You can sign in now." };
    }
    if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM)
      return {
        error:
          "Email recovery is unavailable until the email provider is configured.",
      };
    const email = z.email().parse(str(f, "email").toLowerCase());
    await rateLimit("reset:" + email, 3);
    const row = await service(
      async (q) =>
        (
          await q<{ id: string }>("SELECT id FROM users WHERE email=$1", [
            email,
          ])
        )[0],
    );
    if (row) {
      const value = token();
      await service((q) =>
        q(
          "INSERT INTO reset_tokens VALUES($1,$2,now()+interval '30 minutes')",
          [digest(value), row.id],
        ),
      );
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.MAIL_FROM,
          to: email,
          subject: "Reset your Tech Sokoni password",
          text: `Reset your password: ${process.env.APP_URL}/account?reset=${value}`,
        }),
      });
      if (!response.ok)
        throw new Error("Email delivery is temporarily unavailable.");
    }
    return { success: "If that account exists, a reset link has been sent." };
  } catch (e) {
    return error(e);
  }
}
export async function saveListing(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  try {
    await rateLimit("listing:" + user.id, 15);
    const values = Object.fromEntries(f);
    const data = listingSchema.parse({
      ...values,
      negotiable: f.has("negotiable"),
      delivery: f.has("delivery"),
      ownership_declared: f.has("ownership_declared"),
    });
    const id = str(f, "id");
    if (id) z.uuid().parse(id);
    const files = f
      .getAll("photos")
      .filter((v): v is File => v instanceof File && v.size > 0);
    const existing = id
      ? await transaction(user, (q) =>
          q<{ id: string }>(
            "SELECT id FROM images WHERE listing_id=$1 ORDER BY position",
            [id],
          ),
        )
      : [];
    const keep = f.has("kept_photos")
      ? str(f, "kept_photos").split(",").filter(Boolean)
      : existing.map((x) => x.id);
    if (
      new Set(keep).size !== keep.length ||
      keep.some(
        (id) =>
          !z.uuid().safeParse(id).success || !existing.some((x) => x.id === id),
      )
    )
      throw new Error("Invalid photo selection.");
    if (files.length + keep.length > 10)
      throw new Error("Upload no more than 10 photographs.");
    const status = str(f, "intent") === "draft" ? "draft" : "pending";
    if (status === "pending" && files.length + keep.length < 5)
      throw new Error(
        "Upload at least five real device photographs before submitting.",
      );
    const photos: Buffer[] = [];
    for (const file of files) photos.push(await sanitisePhoto(file));
    const result = await transaction(user, async (q) => {
      const keys = Object.keys(data);
      const vals = Object.values(data);
      let listingId = id;
      if (id) {
        const rows = await q(
          `UPDATE listings SET ${keys.map((k, i) => `${k}=$${i + 1}`).join(",")},status=$${vals.length + 1},updated_at=now() WHERE id=$${vals.length + 2} AND seller_id=$${vals.length + 3} AND status NOT IN ('reserved','sold','suspended') RETURNING id`,
          [...vals, status, id, user.id],
        );
        if (!rows.length) throw new Error("This listing cannot be edited.");
      } else {
        listingId = (
          await q<{ id: string }>(
            `INSERT INTO listings(${keys.join(",")},status,seller_id) VALUES(${vals.map((_, i) => `$${i + 1}`).join(",")},$${vals.length + 1},$${vals.length + 2}) RETURNING id`,
            [...vals, status, user.id],
          )
        )[0].id;
      }
      await q(
        "INSERT INTO listing_private(listing_id,serial_number) VALUES($1,$2) ON CONFLICT(listing_id) DO UPDATE SET serial_number=excluded.serial_number",
        [listingId, z.string().max(100).parse(str(f, "serial"))],
      );
      if (id && f.has("kept_photos")) {
        const current = await q<{ id: string }>(
          "SELECT id FROM images WHERE listing_id=$1",
          [listingId],
        );
        if (
          current.length !== existing.length ||
          current.some((x) => !existing.some((y) => y.id === x.id))
        )
          throw new Error(
            "This listing's photos changed in another session. Reload before saving.",
          );

        const retained = await q<{ id: string; data: Buffer }>(
          "SELECT id,data FROM images WHERE listing_id=$1 AND id=ANY($2::uuid[]) ORDER BY array_position($2::uuid[],id)",
          [listingId, keep],
        );
        await q("DELETE FROM images WHERE listing_id=$1", [listingId]);
        for (let i = 0; i < retained.length; i++)
          await q(
            "INSERT INTO images(id,listing_id,data,position) VALUES($1,$2,$3,$4)",
            [retained[i].id, listingId, retained[i].data, i],
          );
      }
      for (let i = 0; i < photos.length; i++)
        await q(
          "INSERT INTO images(listing_id,data,position) VALUES($1,$2,$3)",
          [listingId, photos[i], keep.length + i],
        );
      await q("DELETE FROM listing_drafts WHERE user_id=$1", [user.id]);
      return listingId;
    });
    revalidatePath("/dashboard");
    return {
      success:
        status === "draft"
          ? "Draft saved."
          : "Listing submitted for moderation.",
      id: result,
    };
  } catch (e) {
    return error(e);
  }
}
export async function favourite(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  try {
    const id = uuid(f, "listing");
    await transaction(user, async (q) => {
      if (str(f, "remove") === "yes")
        await q("DELETE FROM favourites WHERE user_id=$1 AND listing_id=$2", [
          user.id,
          id,
        ]);
      else
        await q("INSERT INTO favourites VALUES($1,$2) ON CONFLICT DO NOTHING", [
          user.id,
          id,
        ]);
    });
    revalidatePath("/favourites");
    return {
      success:
        str(f, "remove") === "yes"
          ? "Removed from favourites."
          : "Saved to favourites.",
    };
  } catch (e) {
    return error(e);
  }
}
export async function contact(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  let id = "";
  try {
    await rateLimit("contact:" + user.id, 20);
    id = await transaction(user, async (q) => {
      const l = (
        await q<{ seller_id: string }>(
          "SELECT seller_id FROM listings WHERE id=$1 AND status='published'",
          [uuid(f, "listing")],
        )
      )[0];
      if (
        l &&
        (
          await q<{ blocked: boolean }>(
            "SELECT pair_is_blocked($1,$2) AS blocked",
            [user.id, l.seller_id],
          )
        )[0].blocked
      )
        throw new Error("This conversation is blocked.");
      if (!l || l.seller_id === user.id)
        throw new Error("This listing cannot be contacted.");
      const old = (
        await q<{ id: string }>(
          "SELECT id FROM conversations WHERE listing_id=$1 AND buyer_id=$2",
          [uuid(f, "listing"), user.id],
        )
      )[0];
      if (old) return old.id;
      const created = (
        await q<{ id: string }>(
          "INSERT INTO conversations(listing_id,buyer_id,seller_id) VALUES($1,$2,$3) ON CONFLICT(listing_id,buyer_id) DO NOTHING RETURNING id",
          [uuid(f, "listing"), user.id, l.seller_id],
        )
      )[0];
      if (created) return created.id;
      return (
        await q<{ id: string }>(
          "SELECT id FROM conversations WHERE listing_id=$1 AND buyer_id=$2",
          [uuid(f, "listing"), user.id],
        )
      )[0].id;
    });
  } catch (e) {
    return error(e);
  }
  redirect("/messages?conversation=" + id);
}
export async function sendMessage(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  try {
    await rateLimit("message:" + user.id, 50);
    await transaction(user, (q) =>
      q(
        "INSERT INTO messages(conversation_id,sender_id,body) VALUES($1,$2,$3)",
        [
          uuid(f, "conversation"),
          user.id,
          z.string().trim().min(1).max(3000).parse(str(f, "body")),
        ],
      ),
    );
    revalidatePath("/messages");
    return { success: "Message sent." };
  } catch (e) {
    return error(e);
  }
}
export async function offer(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  try {
    await rateLimit("offer:" + user.id, 20);
    const decision = z
      .enum(["send", "accept", "reject"])
      .parse(str(f, "decision") || "send");
    await service((q) =>
      negotiate(q, user.id, {
        conversationId: uuid(f, "conversation"),
        decision,
        offerId: decision === "send" ? undefined : uuid(f, "offer"),
        amount:
          decision === "send"
            ? z.coerce
                .number()
                .int()
                .min(100)
                .max(5000000)
                .parse(str(f, "amount")) * 100
            : undefined,
      }),
    );
    revalidatePath("/messages");
    revalidatePath("/marketplace");
    return {
      success:
        "Offer updated. An accepted offer reserves the laptop; it does not record payment.",
    };
  } catch (e) {
    return error(e);
  }
}
export async function bookInspection(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  try {
    await rateLimit("booking:" + user.id, 10);
    await service((q) =>
      requestInspection(q, user.id, uuid(f, "listing"), uuid(f, "slot")),
    );
    revalidatePath("/dashboard");
    return {
      success:
        "Inspection requested. Wait for administrator confirmation before travelling.",
    };
  } catch (e) {
    return error(e);
  }
}
export async function reportListing(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  try {
    await rateLimit("report:" + user.id, 5);
    await transaction(user, (q) =>
      q("INSERT INTO reports(listing_id,reporter_id,reason) VALUES($1,$2,$3)", [
        uuid(f, "listing"),
        user.id,
        z.string().trim().min(10).max(2000).parse(str(f, "reason")),
      ]),
    );
    return { success: "Report received for administrator review." };
  } catch (e) {
    return error(e);
  }
}
export async function updateProfile(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  try {
    await service((q) =>
      q("UPDATE users SET name=$1,bio=$2,seller_type=$3 WHERE id=$4", [
        z.string().trim().min(2).max(80).parse(str(f, "name")),
        z.string().max(1000).parse(str(f, "bio")),
        z.enum(["individual", "dealer"]).parse(str(f, "seller_type")),
        user.id,
      ]),
    );
    revalidatePath("/dashboard");
    return {
      success: "Profile updated. This does not confer seller verification.",
    };
  } catch (e) {
    return error(e);
  }
}
export async function moderate(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  if (!isAdmin(user.role))
    return { error: "Only administrators can moderate listings." };
  try {
    const status = z
      .enum(["published", "rejected", "suspended"])
      .parse(str(f, "status"));
    const id = uuid(f, "listing");
    const note = z.string().trim().min(5).max(1000).parse(str(f, "note"));
    await service(async (q) => {
      const row = (
        await q<{ seller_id: string; status: string }>(
          "SELECT seller_id,status FROM listings WHERE id=$1 FOR UPDATE",
          [id],
        )
      )[0];
      if (!row || row.seller_id === user.id)
        throw new Error("This listing cannot be self-approved.");
      if (status === "published") {
        if (!["pending", "rejected", "suspended"].includes(row.status))
          throw new Error("This listing is not ready for approval.");
        const n = await q<{ count: string }>(
          "SELECT count(*) FROM images WHERE listing_id=$1",
          [id],
        );
        if (Number(n[0].count) < 5)
          throw new Error("Upload at least five photographs before approval.");
      }
      await q(
        "UPDATE listings SET status=$1,moderation_note=$2,updated_at=now() WHERE id=$3",
        [status, note, id],
      );
      await q(
        "INSERT INTO audit_logs(actor_id,action,entity_id) VALUES($1,$2,$3)",
        [user.id, "listing." + status, id],
      );
      await q("INSERT INTO notifications(user_id,body) VALUES($1,$2)", [
        row.seller_id,
        `Listing ${status}: ${note}`,
      ]);
    });
    revalidatePath("/admin");
    revalidatePath("/marketplace");
    return { success: "Moderation decision recorded." };
  } catch (e) {
    return error(e);
  }
}
export async function listingStatus(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  try {
    const state = z
      .enum(["sold", "archived", "pending"])
      .parse(str(f, "status"));
    const rows = await transaction(user, (q) =>
      q(
        "UPDATE listings SET status=$1,updated_at=now() WHERE id=$2 AND seller_id=$3 AND status NOT IN ('sold','archived','suspended') AND (status<>'reserved' OR $1='sold') RETURNING id",
        [state, uuid(f, "listing"), user.id],
      ),
    );
    if (!rows.length) throw new Error("This listing is unavailable.");
    revalidatePath("/dashboard");
    return { success: "Listing status updated." };
  } catch (e) {
    return error(e);
  }
}
export async function configureSlot(_: Result, f: FormData): Promise<Result> {
  const user = await requireUser();
  if (!isAdmin(user.role))
    return { error: "Only administrators can configure appointments." };
  try {
    const name = z.string().min(3).max(100).parse(str(f, "name"));
    const address = z.string().min(5).max(300).parse(str(f, "address"));
    const starts = z.iso.datetime({ offset: true }).parse(str(f, "starts"));
    if (new Date(starts) <= new Date())
      throw new Error("Choose a future date.");
    await service(async (q) => {
      const l = await q<{ id: string }>(
        "INSERT INTO locations(name,address,active) VALUES($1,$2,true) RETURNING id",
        [name, address],
      );
      await q(
        "INSERT INTO inspection_slots(location_id,starts_at) VALUES($1,$2)",
        [l[0].id, starts],
      );
      await q(
        "INSERT INTO audit_logs(actor_id,action,entity_id) VALUES($1,$2,$3)",
        [user.id, "inspection.slot_created", l[0].id],
      );
    });
    return { success: "Inspection slot created." };
  } catch (e) {
    return error(e);
  }
}
export async function confirmInspection(
  _: Result,
  f: FormData,
): Promise<Result> {
  const user = await requireUser();
  if (!isAdmin(user.role))
    return { error: "Only administrators can confirm appointments." };
  try {
    await service(async (q) => {
      await q(
        "UPDATE inspections SET status='confirmed' WHERE id=$1 AND status='requested'",
        [uuid(f, "inspection")],
      );
      await q(
        "INSERT INTO audit_logs(actor_id,action,entity_id) VALUES($1,$2,$3)",
        [user.id, "inspection.confirmed", uuid(f, "inspection")],
      );
    });
    revalidatePath("/admin");
    return { success: "Appointment confirmed." };
  } catch (e) {
    return error(e);
  }
}

export async function cancelReservation(
  _: Result,
  f: FormData,
): Promise<Result> {
  const user = await requireUser();
  try {
    await rateLimit("release:" + user.id, 10);
    await service((q) =>
      releaseReservation(
        q,
        user.id,
        uuid(f, "offer"),
        str(f, "reason"),
        str(f, "confirmed") === "yes",
      ),
    );
    revalidatePath("/messages");
    revalidatePath("/dashboard");
    revalidatePath("/marketplace");
    revalidatePath("/admin");
    return {
      success:
        "Reservation release recorded. Existing inspection appointments are unchanged. Check the listing for its current status.",
    };
  } catch (e) {
    return error(e);
  }
}
