import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
const role = process.argv.includes("--super-admin") ? "super_admin" : "admin";
const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@"))
  throw new Error(
    "Usage: node --env-file=.env.local scripts/admin.mjs registered-email [--super-admin]",
  );
if (!process.env.DATABASE_URL && process.env.LOCAL_DATABASE !== "1")
  throw new Error("Configure DATABASE_URL or LOCAL_DATABASE=1.");
const db = process.env.DATABASE_URL
  ? new pg.Client({ connectionString: process.env.DATABASE_URL })
  : new PGlite(process.env.LOCAL_DATABASE_PATH || ".data/postgres");
if (db.connect) await db.connect();
try {
  await db.query("BEGIN");
  const target = (
    await db.query("SELECT id,role FROM users WHERE email=$1 FOR UPDATE", [
      email,
    ])
  ).rows[0];
  if (!target) throw new Error("Register that account first.");
  if (target.role === "super_admin" && role !== "super_admin")
    throw new Error("This command cannot demote a super administrator.");
  const row = (
    await db.query("UPDATE users SET role=$1 WHERE email=$2 RETURNING id", [
      role,
      email,
    ])
  ).rows[0];
  if (!row) throw new Error("Register that account first.");
  await db.query(
    "INSERT INTO audit_logs(actor_id,action,entity_id) VALUES($1,$2,$1)",
    [row.id, "operator." + role + "_granted"],
  );
  await db.query("DELETE FROM sessions WHERE user_id=$1", [row.id]);
  await db.query("COMMIT");
  console.log(
    role +
      " access granted and audited. Restart the local server, then sign in again.",
  );
} catch (e) {
  await db.query("ROLLBACK");
  throw e;
} finally {
  if (db.end) await db.end();
  else await db.close();
}
