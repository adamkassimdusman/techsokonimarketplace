import { it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { databaseConfig, initializeSchema } from "../lib/database-startup";

it("never falls back to filesystem storage on Vercel", () => {
  expect(() => databaseConfig({ VERCEL: "1", LOCAL_DATABASE: "1" })).toThrow(
    "Connect PostgreSQL",
  );
  expect(
    databaseConfig({
      VERCEL: "1",
      DATABASE_URL: "postgresql://example.invalid/db",
    }).kind,
  ).toBe("postgres");
  expect(databaseConfig({ LOCAL_DATABASE: "1" }).kind).toBe("local");
});

it("initializes once, preserves accounts, and grants managed owners role switching", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "CREATE ROLE managed_owner LOGIN CREATEROLE; GRANT ALL ON SCHEMA public TO managed_owner; SET SESSION AUTHORIZATION managed_owner",
    );
    const connection = {
      query: (sql: string) => db.query<Record<string, unknown>>(sql),
      exec: (sql: string) => db.exec(sql),
    };
    await initializeSchema(connection, false);
    await db.exec(
      "INSERT INTO users(email,password_hash,name) VALUES ('preserved@example.invalid','fixture','Preserved account')",
    );
    await initializeSchema(connection, false);
    expect((await db.query("SELECT * FROM migrations")).rows).toHaveLength(9);
    expect((await db.query("SELECT * FROM users")).rows).toHaveLength(1);
    await db.exec("BEGIN; SET LOCAL ROLE marketplace_app");
    await expect(db.query("SELECT password_hash FROM users")).rejects.toThrow(
      /permission denied/,
    );
    await db.exec("ROLLBACK");
  } finally {
    await db.close();
  }
});

it("rolls back a failed migration so a subsequent attempt can recover", async () => {
  const db = new PGlite();
  let fail = true;
  const connection = {
    query: (sql: string) => db.query<Record<string, unknown>>(sql),
    exec: (sql: string) => {
      if (fail && sql.includes("CREATE TABLE listing_drafts")) {
        fail = false;
        throw new Error("temporary migration failure");
      }
      return db.exec(sql);
    },
  };
  try {
    await expect(initializeSchema(connection, false)).rejects.toThrow(
      "temporary migration failure",
    );
    expect(
      (
        await db.query<{ name: string | null }>(
          "SELECT to_regclass('public.users') AS name",
        )
      ).rows[0].name,
    ).toBeNull();
    await initializeSchema(connection, false);
    expect((await db.query("SELECT * FROM migrations")).rows).toHaveLength(9);
  } finally {
    await db.close();
  }
});
