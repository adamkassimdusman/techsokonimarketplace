import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { service } from "./db";
import { digest, token } from "./security";
export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  seller_type: string;
  bio: string;
};
export async function currentUser(): Promise<User | null> {
  const value = (await cookies()).get("ts_session")?.value;
  if (!value) return null;
  return service(
    async (q) =>
      (
        await q<User>(
          "SELECT u.id,u.name,u.email,u.role,u.seller_type,u.bio FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()",
          [digest(value)],
        )
      )[0] ?? null,
  );
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/account");
  return user;
}
export async function createSession(id: string) {
  const value = token();
  await service((q) =>
    q(
      "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')",
      [digest(value), id],
    ),
  );
  (await cookies()).set("ts_session", value, {
    httpOnly: true,
    secure: process.env.APP_URL?.startsWith("https:"),
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
  });
}
export async function rateLimit(key: string, limit = 30) {
  const rows = await service((q) =>
    q<{ hits: number }>(
      "INSERT INTO rate_limits(key,hits,expires_at) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_limits.expires_at<now() THEN 1 ELSE rate_limits.hits+1 END,expires_at=CASE WHEN rate_limits.expires_at<now() THEN now()+interval '15 minutes' ELSE rate_limits.expires_at END RETURNING hits",
      [digest(key)],
    ),
  );
  if (rows[0].hits > limit)
    throw new Error("Too many attempts. Please try again in 15 minutes.");
}
