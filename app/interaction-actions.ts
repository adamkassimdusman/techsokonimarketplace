"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, rateLimit } from "@/lib/auth";
import { service } from "@/lib/db";
import { verifyPassword } from "@/lib/security";
import type { Result } from "./actions";
import {
  setConversationBlock,
  markConversationRead,
  reportConversation,
  changeAdminRole,
  createSupportTicket,
  replySupport,
  resolveInteraction,
} from "@/lib/interactions";
const val = (f: FormData, k: string) => String(f.get(k) ?? "");
const id = (f: FormData, k: string) => z.uuid().parse(val(f, k));
const failure = (e: unknown): Result => ({
  error:
    e instanceof z.ZodError
      ? "Please check the form fields."
      : e instanceof Error && /^(This|Only|Please|Invalid)/.test(e.message)
        ? e.message
        : "The request could not be completed. Please try again.",
});
export async function blockUser(_: Result, f: FormData): Promise<Result> {
  const u = await requireUser();
  try {
    await rateLimit("block:" + u.id, 20);
    const blocked = z.enum(["yes", "no"]).parse(val(f, "blocked")) === "yes";
    await service((q) =>
      setConversationBlock(q, u.id, id(f, "conversation"), blocked),
    );
    revalidatePath("/messages");
    return {
      success: blocked
        ? "User blocked. New messages and offers are disabled between you."
        : "Your block has been removed.",
    };
  } catch (e) {
    return failure(e);
  }
}
export async function readConversation(
  _: Result,
  f: FormData,
): Promise<Result> {
  const u = await requireUser();
  try {
    await service((q) =>
      markConversationRead(
        q,
        u.id,
        id(f, "conversation"),
        z.coerce.number().int().nonnegative().safe().parse(val(f, "upto")),
      ),
    );
    revalidatePath("/messages");
    revalidatePath("/", "layout");
    return { success: "Displayed messages marked as read." };
  } catch (e) {
    return failure(e);
  }
}
export async function flagConversation(
  _: Result,
  f: FormData,
): Promise<Result> {
  const u = await requireUser();
  try {
    await rateLimit("conversation-report:" + u.id, 5);
    if (val(f, "confirmed") !== "yes")
      throw new Error(
        "Please confirm sharing this conversation with moderators.",
      );
    await service((q) =>
      reportConversation(q, u.id, id(f, "conversation"), val(f, "reason")),
    );
    revalidatePath("/admin/interactions");
    return { success: "Report submitted to the moderation team." };
  } catch (e) {
    return failure(e);
  }
}
export async function manageAdmin(_: Result, f: FormData): Promise<Result> {
  const u = await requireUser();
  if (u.role !== "super_admin")
    return { error: "Only a super administrator can manage admin access." };
  try {
    await rateLimit("role-change:" + u.id, 5);
    const email = z.email().parse(val(f, "email").trim().toLowerCase());
    const role = z.enum(["member", "admin"]).parse(val(f, "role"));
    const password = z.string().min(12).max(128).parse(val(f, "password"));
    await service(async (q) => {
      const row = (
        await q<{ password_hash: string }>(
          "SELECT password_hash FROM users WHERE id=$1",
          [u.id],
        )
      )[0];
      if (!row || !(await verifyPassword(password, row.password_hash)))
        throw new Error("Invalid password confirmation.");
      await changeAdminRole(
        q,
        u.id,
        email,
        role,
        val(f, "confirmed") === "yes",
      );
    });
    revalidatePath("/super-admin");
    return {
      success:
        "Access updated and audited. The affected account must sign in again.",
    };
  } catch (e) {
    return failure(e);
  }
}
export async function openSupport(_: Result, f: FormData): Promise<Result> {
  const u = await requireUser();
  let ticket = "";
  try {
    await rateLimit("support-create:" + u.id, 5);
    ticket = await service((q) =>
      createSupportTicket(q, u.id, val(f, "subject"), val(f, "body")),
    );
  } catch (e) {
    return failure(e);
  }
  redirect("/support?ticket=" + ticket);
}
export async function sendSupportReply(
  _: Result,
  f: FormData,
): Promise<Result> {
  const u = await requireUser();
  try {
    await rateLimit("support-reply:" + u.id, 30);
    await service((q) =>
      replySupport(q, u.id, id(f, "ticket"), val(f, "body")),
    );
    revalidatePath("/support");
    revalidatePath("/admin/interactions");
    return { success: "Reply sent." };
  } catch (e) {
    return failure(e);
  }
}
export async function closeInteraction(
  _: Result,
  f: FormData,
): Promise<Result> {
  const u = await requireUser();
  try {
    if (val(f, "confirmed") !== "yes")
      throw new Error("Please confirm this resolution.");
    await service((q) =>
      resolveInteraction(
        q,
        u.id,
        id(f, "id"),
        z.enum(["ticket", "report"]).parse(val(f, "kind")),
      ),
    );
    revalidatePath("/admin/interactions");
    revalidatePath("/support");
    return { success: "Resolution recorded and audited." };
  } catch (e) {
    return failure(e);
  }
}
