import { PGlite } from "@electric-sql/pglite";
import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { spawn } from "node:child_process";
const directory = await mkdtemp(
  path.join(tmpdir(), "tech-sokoni-integration-"),
);
const db = new PGlite(path.join(directory, "postgres"));
for (const file of [
  "001_initial.sql",
  "002_participant_access_notifications.sql",
  "003_booking_availability.sql",
  "004_reservation_status_guard.sql",
  "005_reservation_releases.sql",
  "006_roles_client_interactions.sql",
  "007_public_seller_directory.sql",
  "008_listing_draft_workspace.sql",
  "009_database_role_membership.sql",
])
  await db.exec(await readFile(path.join("db", file), "utf8"));
const password = randomBytes(24).toString("hex");
const salt = randomBytes(16).toString("hex");
const hash = salt + ":" + scryptSync(password, salt, 64).toString("hex");
const users = {};
for (const role of ["seller", "admin", "buyer", "rival", "super"]) {
  const email = role + "@integration.invalid";
  const row = (
    await db.query(
      "INSERT INTO users(email,password_hash,name,role) VALUES($1,$2,$3,$4) RETURNING id",
      [
        email,
        hash,
        "Integration " + role,
        role === "super"
          ? "super_admin"
          : role === "admin"
            ? "admin"
            : "member",
      ],
    )
  ).rows[0];
  users[role] = { id: row.id, email };
}
await db.close();
await mkdir(".data", { recursive: true });
await writeFile(
  ".data/integration-credentials.json",
  JSON.stringify({ password, users }),
  { mode: 0o600 },
);
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3100",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: "",
      LOCAL_DATABASE: "1",
      LOCAL_DATABASE_PATH: path.join(directory, "postgres"),
      APP_URL: "http://127.0.0.1:3100",
    },
  },
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 0));
