import { readFile } from "node:fs/promises";
import path from "node:path";

export function databaseConfig(env: Record<string, string | undefined>) {
  if (env.DATABASE_URL?.trim())
    return { kind: "postgres" as const, url: env.DATABASE_URL.trim() };
  if (env.VERCEL)
    throw new Error(
      "DATABASE_URL is missing. Connect PostgreSQL in Vercel Storage and redeploy. Local database files cannot be used on Vercel.",
    );
  if (env.LOCAL_DATABASE === "1")
    return {
      kind: "local" as const,
      directory: env.LOCAL_DATABASE_PATH ?? ".data/postgres",
    };
  throw new Error(
    "Configure DATABASE_URL. Local development requires LOCAL_DATABASE=1.",
  );
}

export const migrationFiles = [
  "001_initial.sql",
  "002_participant_access_notifications.sql",
  "003_booking_availability.sql",
  "004_reservation_status_guard.sql",
  "005_reservation_releases.sql",
  "006_roles_client_interactions.sql",
  "007_public_seller_directory.sql",
  "008_listing_draft_workspace.sql",
  "009_database_role_membership.sql",
] as const;

type MigrationConnection = {
  query: (sql: string) => Promise<{ rows: Record<string, unknown>[] }>;
  exec: (sql: string) => Promise<unknown>;
};

// One checked-out connection and one transaction: compatible with transaction
// poolers, and serializes first requests from separate serverless instances.
export async function initializeSchema(
  connection: MigrationConnection,
  postgres: boolean,
) {
  await connection.exec("BEGIN");
  try {
    if (postgres) {
      await connection.exec("SET LOCAL lock_timeout = '30s'");
      await connection.exec("SELECT pg_advisory_xact_lock(74839201)");
    }
    const check = await connection.query(
      "SELECT to_regclass('public.migrations') AS name",
    );
    const versions = check.rows[0].name
      ? (
          await connection.query("SELECT version FROM public.migrations")
        ).rows.map((row) => Number(row.version))
      : [];
    for (const [index, file] of migrationFiles.entries()) {
      if (!versions.includes(index + 1))
        await connection.exec(await readFile(path.resolve("db", file), "utf8"));
    }
    await connection.exec("COMMIT");
  } catch (error) {
    await connection.exec("ROLLBACK");
    throw error;
  }
}
