import { test, expect, type Page } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";
test("seller submission, admin approval, competing offers and reserved-device inspection", async ({
  browser,
}) => {
  const shots = "../redesign/" + (process.env.SCREENSHOT_PHASE || "after");
  await mkdir(shots, { recursive: true });
  const capture = async (page: Page, name: string) => {
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: shots + "/" + name + ".png",
      fullPage: true,
    });
  };
  const credentials = JSON.parse(
    await readFile(".data/integration-credentials.json", "utf8"),
  ) as {
    password: string;
    users: Record<string, { id: string; email: string }>;
  };
  const contexts = await Promise.all(
    ["seller", "admin", "buyer", "rival"].map(() =>
      browser.newContext({ baseURL: "http://127.0.0.1:3100" }),
    ),
  );
  const [seller, admin, buyer, rival] = await Promise.all(
    contexts.map((c) => c.newPage()),
  );
  async function signIn(page: Page, role: string) {
    await page.goto("/account");
    await page
      .getByLabel("Email", { exact: true })
      .first()
      .fill(credentials.users[role].email);
    await page
      .getByLabel("Password", { exact: false })
      .fill(credentials.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/);
  }
  await signIn(seller, "seller");
  await signIn(admin, "admin");
  await signIn(buyer, "buyer");
  await signIn(rival, "rival");
  await seller.goto("/sell");
  await capture(seller, "listing-wizard-desktop");
  await seller
    .getByLabel("Family and exact model")
    .fill("INTEGRATION FIXTURE - NOT FOR SALE");
  await seller.getByLabel("Serial number").fill("PRIVATE-INTEGRATION-SERIAL");
  await seller.getByRole("button", { name: "Continue", exact: true }).click();
  await seller.getByLabel("Exact processor model").fill("Intel Core i5-8250U");
  await seller
    .getByLabel("Screen size, resolution and touch support")
    .fill("14 inch FHD");
  await seller.getByRole("button", { name: "Continue", exact: true }).click();
  await seller
    .getByLabel("Condition and included accessories")
    .fill("Disposable integration test fixture, not marketplace inventory.");
  await seller
    .getByLabel("Known faults and repairs")
    .fill("Synthetic test data only.");
  await seller.getByRole("button", { name: "Continue", exact: true }).click();
  const buffer = await sharp({
    create: { width: 240, height: 160, channels: 3, background: "#087b69" },
  })
    .png()
    .toBuffer();
  await seller.getByLabel(/Add 5–10 photographs/).setInputFiles(
    Array.from({ length: 5 }, (_, i) => ({
      name: `test-${i}.png`,
      mimeType: "image/png",
      buffer,
    })),
  );
  await seller.getByRole("button", { name: "Continue", exact: true }).click();
  await seller.getByLabel("Selling price (KSh)").fill("30000");
  await seller
    .getByLabel("Town or general pickup area")
    .fill("Integration fixture location");
  await seller.getByRole("button", { name: "Continue", exact: true }).click();
  await seller.getByRole("checkbox").last().check();
  await seller.getByRole("button", { name: "Continue", exact: true }).click();
  await seller
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await expect(seller.getByRole("status")).toContainText(
    "submitted for moderation",
  );
  await seller.goto("/dashboard");
  const href = await seller
    .getByRole("link", {
      name: "HP INTEGRATION FIXTURE - NOT FOR SALE",
      exact: true,
    })
    .getAttribute("href");
  expect(href).toBeTruthy();
  await buyer.goto(href!);
  await expect(
    buyer.getByRole("heading", { name: "This page isn’t available." }),
  ).toBeVisible();
  await admin.goto("/admin");
  const card = admin.locator("article").filter({
    has: admin.getByRole("heading", {
      name: "HP INTEGRATION FIXTURE - NOT FOR SALE",
    }),
  });
  await card
    .getByLabel("Reason")
    .fill("Reviewed synthetic integration fixture only.");
  await card.getByRole("checkbox").check();
  await card.getByRole("button", { name: "Record decision" }).click();
  await expect(card.getByRole("status")).toContainText(
    "Moderation decision recorded",
  );
  await admin
    .getByLabel("Approved location name")
    .fill("INTEGRATION TEST LOCATION");
  await admin
    .getByLabel("Public business address")
    .fill("Synthetic location, never a real office");
  await admin
    .getByLabel("Time including timezone")
    .fill(new Date(Date.now() + 86400000).toISOString());
  await admin.getByRole("button", { name: "Add appointment slot" }).click();
  await expect(
    admin.getByText("Inspection slot created.", { exact: true }),
  ).toBeVisible();
  await buyer.goto(href!);
  await expect(
    buyer.getByRole("heading", {
      name: "HP INTEGRATION FIXTURE - NOT FOR SALE",
    }),
  ).toBeVisible();
  await expect(buyer.locator("body")).not.toContainText(
    "PRIVATE-INTEGRATION-SERIAL",
  );
  await buyer.getByRole("button", { name: "Next photo", exact: true }).click();
  await expect(buyer.getByText("2 / 5", { exact: true })).toBeVisible();
  await buyer.getByRole("button", { name: "Open full-screen photo" }).click();
  await expect(buyer.getByRole("dialog")).toBeVisible();
  await buyer.keyboard.press("ArrowRight");
  await buyer.getByRole("button", { name: "Zoom in", exact: true }).click();
  await buyer.keyboard.press("Escape");
  await expect(buyer.getByRole("dialog")).not.toBeVisible();
  await buyer.getByRole("button", { name: "Compare", exact: true }).click();
  await expect(
    buyer.getByRole("complementary", {
      name: "Selected laptops for comparison",
    }),
  ).toBeVisible();
  await buyer.getByRole("button", { name: "Clear comparison" }).click();
  await buyer
    .getByRole("button", { name: "Contact seller / make an offer" })
    .click();
  await expect(buyer).toHaveURL(/messages\?conversation=/);
  const buyerConversation = buyer.url();
  await buyer
    .getByLabel("Your message")
    .fill("Can I inspect this laptop before completing a purchase?");
  await buyer
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await expect(
    buyer.getByText("Can I inspect this laptop before completing a purchase?", {
      exact: true,
    }),
  ).toBeVisible();
  await buyer.getByLabel("Your offer (KSh)").fill("28000");
  await buyer
    .getByRole("button", { name: "Send offer / counteroffer" })
    .click();
  await expect(buyer.locator(".offer")).toContainText("28,000");
  await buyer.goto(href!);
  await capture(buyer, "product-detail-desktop");
  await buyer.goto("/sellers/" + credentials.users.seller.id);
  await capture(buyer, "seller-profile-desktop");
  await buyer.goto(buyerConversation);
  await rival.goto(href!);
  await rival
    .getByRole("button", { name: "Contact seller / make an offer" })
    .click();
  await expect(rival).toHaveURL(/messages\?conversation=/);
  const rivalConversation = rival.url();
  await rival.getByLabel("Your offer (KSh)").fill("29000");
  await rival
    .getByRole("button", { name: "Send offer / counteroffer" })
    .click();
  await expect(rival.locator(".offer")).toContainText("29,000");
  await seller.goto(buyerConversation);
  await expect(
    seller.getByText(
      "Can I inspect this laptop before completing a purchase?",
      { exact: true },
    ),
  ).toBeVisible();
  await capture(seller, "messaging-desktop");
  await seller.getByRole("button", { name: "Accept & reserve" }).click();
  await expect(seller.locator(".offer")).toContainText("accepted");
  await rival.goto(rivalConversation);
  await expect(rival.locator(".offer")).toContainText("expired");
  await rival.goto(href!);
  await expect(
    rival.getByRole("heading", { name: "This page isn’t available." }),
  ).toBeVisible();
  await buyer.goto(href!);
  await expect(buyer.getByText("Private preview · reserved")).toBeVisible();
  await buyer.getByRole("button", { name: "Request this appointment" }).click();
  await expect(buyer.getByRole("status")).toContainText("Inspection requested");
  await seller.goto(href!);
  await expect(
    seller.getByText("No inspection appointments are available yet."),
  ).toBeVisible();
  await admin.goto("/admin");
  await admin
    .getByRole("button", { name: "Confirm appointment", exact: true })
    .click();
  await expect(
    admin.getByText(/INTEGRATION TEST LOCATION.*confirmed/),
  ).toBeVisible();
  await seller.goto("/dashboard");
  await capture(seller, "seller-dashboard-desktop");
  await buyer.goto("/dashboard");
  await capture(buyer, "buyer-dashboard-desktop");
  await expect(
    buyer.getByText(/INTEGRATION TEST LOCATION.*confirmed/),
  ).toBeVisible();
  await capture(buyer, "inspection-booking-desktop");
  await buyer.goto(buyerConversation);
  await capture(buyer, "buyer-conversation-desktop");
  await buyer.setViewportSize({ width: 390, height: 844 });
  await capture(buyer, "messaging-mobile");
  expect(
    await buyer.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await buyer.getByText("Cancel this reservation", { exact: true }).click();
  await buyer
    .getByLabel("Reason for releasing")
    .fill("I have changed my plans after discussing this device.");
  await buyer
    .getByRole("checkbox", { name: /I confirm that I want to release/ })
    .check();
  await buyer
    .getByRole("button", { name: "Release reservation", exact: true })
    .click();
  await expect(buyer.getByRole("status")).toContainText("Reservation released");
  await expect(buyer.locator(".offer")).toContainText(
    "I have changed my plans",
  );
  await seller.goto(buyerConversation);
  await expect(seller.getByRole("status")).toContainText(
    "Reservation released",
  );
  await seller.goto(href!);
  await expect(seller.getByText("Private preview · pending")).toBeVisible();
  await buyer.goto(href!);
  await expect(
    buyer.getByRole("heading", { name: "This page isn’t available." }),
  ).toBeVisible();
  await buyer.goto("/dashboard");
  await expect(
    buyer.getByText(/INTEGRATION TEST LOCATION.*confirmed/),
  ).toBeVisible();
  await admin.goto("/admin");
  await expect(
    admin.locator("article").filter({
      has: admin.getByRole("heading", {
        name: "HP INTEGRATION FIXTURE - NOT FOR SALE",
      }),
    }),
  ).toContainText("pending");
  await seller.goto(buyerConversation);
  await seller
    .getByRole("button", { name: "Mark displayed messages read" })
    .click();
  await expect(
    seller.getByRole("button", { name: "Mark displayed messages read" }),
  ).toHaveCount(0);
  expect(
    (await (await seller.request.get("/api/interactions")).json())
      .unreadMessages,
  ).toBe(0);
  await buyer.goto(buyerConversation);
  await buyer.getByRole("button", { name: "Block user", exact: true }).click();
  await expect(
    buyer.getByRole("button", { name: "Send message", exact: true }),
  ).toHaveCount(0);
  await seller.reload();
  await expect(
    seller.getByRole("button", { name: "Send message", exact: true }),
  ).toHaveCount(0);
  await buyer.getByText("Report this conversation", { exact: true }).click();
  await buyer
    .getByLabel("Report reason")
    .fill("Please review this conversation for inappropriate behaviour.");
  await buyer.getByRole("checkbox", { name: /I agree to share/ }).check();
  await buyer
    .getByRole("button", { name: "Submit conversation report" })
    .click();
  await expect(
    buyer.getByText("Report submitted to the moderation team.", {
      exact: true,
    }),
  ).toBeVisible();
  await admin.goto("/admin/interactions");
  const report = admin.locator("article").filter({
    has: admin.getByRole("heading", { name: "Reported conversation" }),
  });
  await report.getByText("Review reported messages").click();
  await expect(report).toContainText("Can I inspect this laptop");
  await report.getByRole("checkbox").check();
  await report.getByRole("button", { name: "Resolve report" }).click();
  await expect(admin.getByText("No open conversation reports.")).toBeVisible();
  await buyer
    .getByRole("button", { name: "Unblock user", exact: true })
    .click();
  await expect(
    buyer.getByRole("button", { name: "Send message", exact: true }),
  ).toBeVisible();
  await Promise.all(contexts.map((c) => c.close()));
});
