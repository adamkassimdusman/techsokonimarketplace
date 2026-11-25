import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("private support and super-admin access management", async ({
  browser,
}) => {
  const c = JSON.parse(
    await readFile(".data/integration-credentials.json", "utf8"),
  );
  const contexts = await Promise.all(
    ["buyer", "admin", "super", "rival", "guest"].map(() =>
      browser.newContext({ baseURL: "http://127.0.0.1:3100" }),
    ),
  );
  const [buyer, admin, superAdmin, rival, guest] = await Promise.all(
    contexts.map((c) => c.newPage()),
  );
  async function login(page: Page, role: string) {
    await page.goto("/account");
    await page
      .getByLabel("Email", { exact: true })
      .first()
      .fill(c.users[role].email);
    await page.getByLabel("Password", { exact: false }).fill(c.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/);
  }
  expect((await guest.request.get("/api/interactions")).status()).toBe(401);
  await login(buyer, "buyer");
  await login(admin, "admin");
  await login(superAdmin, "super");
  await login(rival, "rival");
  await admin.goto("/super-admin");
  await expect(
    admin.getByRole("heading", { name: "Super-admin access required" }),
  ).toBeVisible();
  await buyer.setViewportSize({ width: 390, height: 844 });
  await buyer.goto("/support");
  await buyer
    .getByLabel("Subject", { exact: true })
    .fill("Integration account assistance");
  await buyer
    .getByLabel("How can we help?", { exact: true })
    .fill("Please explain how to submit my laptop for approval.");
  await buyer.getByRole("button", { name: "Send support request" }).click();
  await expect(buyer).toHaveURL(/support\?ticket=/);
  const ticketUrl = buyer.url();
  await buyer.screenshot({
    path: "test-results/support-mobile.png",
    fullPage: true,
  });
  expect(
    await buyer.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (await (await buyer.request.get("/api/interactions")).json())
      .openSupportRequests,
  ).toBe(1);
  await rival.goto(ticketUrl);
  await expect(
    rival.getByText("Please explain how to submit my laptop for approval.", {
      exact: true,
    }),
  ).toHaveCount(0);
  await admin.goto("/admin/interactions");
  const ticket = admin.locator("article").filter({
    has: admin.getByRole("heading", {
      name: "Integration account assistance",
    }),
  });
  await ticket
    .getByLabel("Staff reply", { exact: true })
    .fill("Complete the selling form and submit your listing for review.");
  await ticket.getByRole("button", { name: "Send staff reply" }).click();
  await expect(ticket.getByText("Reply sent.", { exact: true })).toBeVisible();
  await buyer.reload();
  await expect(
    buyer.getByText(
      "Complete the selling form and submit your listing for review.",
      { exact: true },
    ),
  ).toBeVisible();
  await ticket.getByRole("checkbox").check();
  await ticket.getByRole("button", { name: "Close request" }).click();
  await expect(
    ticket.getByRole("button", { name: "Close request" }),
  ).toHaveCount(0);
  await buyer.reload();
  await expect(
    buyer.getByRole("button", { name: "Reply to support" }),
  ).toHaveCount(0);
  await superAdmin.goto("/super-admin");
  await superAdmin.screenshot({
    path: "test-results/super-admin-desktop.png",
    fullPage: true,
  });
  await superAdmin
    .getByLabel("Registered account email")
    .fill(c.users.rival.email);
  await superAdmin
    .getByLabel("Your current password")
    .fill("incorrect-password-confirmation");
  await superAdmin.getByRole("checkbox").check();
  await superAdmin
    .getByRole("button", { name: "Update administrator access" })
    .click();
  await expect(
    superAdmin.getByText("Invalid password confirmation.", { exact: true }),
  ).toBeVisible();
  await superAdmin
    .getByLabel("Registered account email")
    .fill(c.users.rival.email);
  await superAdmin.getByRole("checkbox").check();
  await superAdmin.getByLabel("Your current password").fill(c.password);
  await superAdmin
    .getByRole("button", { name: "Update administrator access" })
    .click();
  await expect(
    superAdmin.getByText(/Access updated and audited/),
  ).toBeVisible();
  await rival.goto("/admin");
  await expect(rival).toHaveURL(/account/);
  await login(rival, "rival");
  await rival.goto("/admin");
  await expect(
    rival.getByRole("heading", { name: "Marketplace operations" }),
  ).toBeVisible();
  await superAdmin.getByLabel("Access level").selectOption("member");
  await superAdmin
    .getByLabel("Registered account email")
    .fill(c.users.rival.email);
  await superAdmin.getByRole("checkbox").check();
  await superAdmin.getByLabel("Your current password").fill(c.password);
  await superAdmin
    .getByRole("button", { name: "Update administrator access" })
    .click();
  await expect(
    superAdmin.getByText("user.role.member", { exact: false }),
  ).toBeVisible();
  await rival.goto("/admin");
  await expect(rival).toHaveURL(/account/);
  await Promise.all(contexts.map((c) => c.close()));
});
