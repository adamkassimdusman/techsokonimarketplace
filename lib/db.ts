import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
export type Actor = { id: string; role: string };
export type Query = <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  sql: string,
  params?: unknown[],
) => Promise<T[]>;
type DB = {
  local?: PGlite;
  pool?: Pool;
  ready?: Promise<void>;
  queue: Promise<unknown>;
};
const globalDB = globalThis as unknown as { marketDB?: DB };
const db = (globalDB.marketDB ??= { queue: Promise.resolve() });
async function init() {
  if (db.ready) return db.ready;
  db.ready = (async () => {
    if (process.env.DATABASE_URL)
      db.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 8,
      });
    else if (process.env.LOCAL_DATABASE === "1") {
      const directory = path.resolve(
        /* turbopackIgnore: true */ process.env.LOCAL_DATABASE_PATH ??
          ".data/postgres",
      );
      await mkdir(path.dirname(directory), { recursive: true });
      db.local = new PGlite(directory);
    } else
      throw new Error(
        "Configure DATABASE_URL. Local development requires LOCAL_DATABASE=1.",
      );
    const check = db.pool
      ? await db.pool.query("SELECT to_regclass('public.migrations') AS name")
      : await db.local!.query<{ name: string }>(
          "SELECT to_regclass('public.migrations') AS name",
        );
    if (!check.rows[0].name) {
      const sql = await readFile(path.resolve("db/001_initial.sql"), "utf8");
      if (db.pool) await db.pool.query("BEGIN;" + sql + "COMMIT;");
      else await db.local!.exec("BEGIN;" + sql + "COMMIT;");
    }
    const versions = db.pool
      ? await db.pool.query("SELECT version FROM migrations")
      : await db.local!.query<{ version: number }>(
          "SELECT version FROM migrations",
        );
    for (const [version, file] of [
      [2, "002_participant_access_notifications.sql"],
      [3, "003_booking_availability.sql"],
      [4, "004_reservation_status_guard.sql"],
      [5, "005_reservation_releases.sql"],
      [6, "006_roles_client_interactions.sql"],
      [7, "007_public_seller_directory.sql"],
      [8, "008_listing_draft_workspace.sql"],
    ] as const) {
      if (!versions.rows.some((row) => row.version === version)) {
        const sql = await readFile(path.resolve("db", file), "utf8");
        if (db.pool) await db.pool.query("BEGIN;" + sql + "COMMIT;");
        else await db.local!.exec("BEGIN;" + sql + "COMMIT;");
      }
    }
  })();
  return db.ready;
}
export async function transaction<T>(
  actor: Actor | null | undefined,
  fn: (q: Query) => Promise<T>,
): Promise<T> {
  await init();
  const run = async () => {
    const client = db.pool ? await db.pool.connect() : null;
    const q: Query = async <R extends Record<string, unknown>>(
      sql: string,
      params: unknown[] = [],
    ) =>
      client
        ? ((await client.query(sql, params)).rows as R[])
        : (await db.local!.query<R>(sql, params)).rows;
    try {
      await q("BEGIN");
      if (actor !== undefined) {
        await q("SET LOCAL ROLE marketplace_app");
        await q(
          "SELECT set_config('app.user_id',$1,true),set_config('app.role',$2,true)",
          [actor?.id ?? "", actor?.role ?? ""],
        );
      }
      const result = await fn(q);
      await q("COMMIT");
      return result;
    } catch (e) {
      await q("ROLLBACK");
      throw e;
    } finally {
      client?.release();
    }
  };
  if (db.pool) return run();
  const result = db.queue.then(run, run);
  db.queue = result.catch(() => {});
  return result;
}
export const service = <T>(fn: (q: Query) => Promise<T>) =>
  transaction(undefined, fn);
