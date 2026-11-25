"use server";
import { z } from "zod";
import { requireUser, rateLimit } from "@/lib/auth";
import { transaction } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Result } from "./actions";
const allowed = [
  "brand",
  "model",
  "cpu",
  "ram",
  "storage",
  "storage_type",
  "gpu",
  "screen",
  "condition",
  "faults",
  "description",
  "price",
  "county",
  "town",
  "battery",
  "warranty",
  "negotiable",
  "delivery",
];
export async function autosaveDraft(f: FormData): Promise<Result> {
  const user = await requireUser();
  try {
    await rateLimit("draft:" + user.id, 120);
    const revision = z.coerce
      .number()
      .int()
      .positive()
      .safe()
      .parse(f.get("revision"));
    const fields: Record<string, string> = {};
    for (const key of allowed) {
      const v = f.get(key);
      if (typeof v === "string") fields[key] = z.string().max(5000).parse(v);
    }
    await transaction(user, (q) =>
      q(
        "INSERT INTO listing_drafts(user_id,fields,revision) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET fields=excluded.fields,revision=excluded.revision,updated_at=now() WHERE listing_drafts.revision<excluded.revision",
        [user.id, JSON.stringify(fields), revision],
      ),
    );
    return {
      success:
        "Text draft saved privately. Photos and serial number save when you submit or save the listing.",
    };
  } catch {
    return {
      error: "Draft could not be saved. Keep this page open and try again.",
    };
  }
}
export async function clearDraft(): Promise<void> {
  const user = await requireUser();
  await transaction(user, (q) =>
    q("DELETE FROM listing_drafts WHERE user_id=$1", [user.id]),
  );
  revalidatePath("/sell");
}
