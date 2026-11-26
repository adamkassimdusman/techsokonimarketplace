import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { databaseConfig, initializeSchema } from "./database-startup";
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
    const config = databaseConfig(process.env);
    if (config.kind === "postgres") {
      db.pool ??= new Pool({
        connectionString: config.url,
        max: 3,
        connectionTimeoutMillis: 15000,
        idleTimeoutMillis: 10000,
      });
      const client = await db.pool.connect();
      try {
        await initializeSchema(
          {
            query: (sql) => client.query(sql),
            exec: (sql) => client.query(sql),
          },
          true,
        );
      } finally {
        client.release();
      }
    } else {
      const directory = path.resolve(
        /* turbopackIgnore: true */ config.directory,
      );
      await mkdir(path.dirname(directory), { recursive: true });
      db.local ??= new PGlite(directory);
      await initializeSchema(
        {
          query: (sql) => db.local!.query(sql),
          exec: (sql) => db.local!.exec(sql),
        },
        false,
      );
    }
  })().catch((error) => {
    // A transient connection or migration failure must not poison this instance.
    db.ready = undefined;
    throw error;
  });
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
