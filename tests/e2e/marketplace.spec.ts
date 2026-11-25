import { test, expect } from "@playwright/test";
import sharp from "sharp";
test("homepage, combined filters and mobile layout", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Find your next laptop/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/marketplace");
  if (await page.getByRole("button", { name: /^Filters/ }).isVisible())
    await page.getByRole("button", { name: /^Filters/ }).click();
  await page
    .getByRole("combobox", { name: "Brand", exact: true })
    .filter({ visible: true })
    .selectOption("HP");
  await page.getByLabel("Max KSh").filter({ visible: true }).fill("30000");
  await page
    .getByRole("combobox", { name: "Minimum RAM" })
    .filter({ visible: true })
    .selectOption("16");
  await page
    .getByRole("button", { name: "Apply filters" })
    .filter({ visible: true })
    .click();
  await expect(page).toHaveURL(/brand=HP/);
  await expect(page).toHaveURL(/max=30000/);
  await expect(page).toHaveURL(/ram=16/);
});
test("registration, private dashboard and listing draft persist", async ({
  page,
}) => {
  await page.goto("/sell");
  await expect(page).toHaveURL(/account/);
  await page.goto("/account?mode=register");
  await page.getByLabel("Your public name").fill("E2E test seller");
  await page
    .getByLabel("Email", { exact: true })
    .first()
    .fill(
      `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.invalid`,
    );
  await page
    .getByLabel("Password", { exact: false })
    .fill("Long testing password 123!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "This page isn’t available." }),
  ).toBeVisible();
  await page.goto("/sell");
  await page.getByLabel("Family and exact model").fill("Automated test draft");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Exact processor model").fill("Intel Core i5-8250U");
  await page
    .getByLabel("Screen size, resolution and touch support")
    .fill("14 inch FHD");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Condition and included accessories")
    .fill("Automated test only. Includes charger. Not inventory.");
  await page
    .getByLabel("Known faults and repairs")
    .fill("Test fixture; not for sale");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Selling price (KSh)").fill("30000");
  await page.getByLabel("Town or general pickup area").fill("Test location");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox").last().check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draft saved");
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "HP Automated test draft" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Edit listing", exact: true }).click();
  await page
    .getByRole("button", { name: "5. Price & location", exact: true })
    .click();
  await expect(page.getByLabel("Selling price (KSh)")).toHaveValue("30000");
  await page
    .getByRole("button", { name: "4. Photographs", exact: true })
    .click();
  const buffer = await sharp({
    create: { width: 240, height: 160, channels: 3, background: "#087b69" },
  })
    .png()
    .toBuffer();
  await page.getByLabel(/Add 5–10 photographs/).setInputFiles(
    Array.from({ length: 5 }, (_, i) => ({
      name: `automated-test-only-${i}.png`,
      mimeType: "image/png",
      buffer,
    })),
  );
  await page.getByRole("button", { name: "6. Ownership", exact: true }).click();
  await page.getByRole("checkbox").last().check();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draft saved");
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Edit listing", exact: true }).click();
  await page
    .getByRole("button", { name: "4. Photographs", exact: true })
    .click();
  await expect(page.locator(".photo-preview-grid img")).toHaveCount(5);
  const nextCover = await page
    .locator(".photo-preview-grid img")
    .nth(1)
    .getAttribute("src");
  await page
    .getByRole("button", { name: "Move photo 2 earlier", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Remove photo 5", exact: true })
    .click();
  await page.getByRole("button", { name: "6. Ownership", exact: true }).click();
  await page.getByRole("checkbox").last().check();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Draft saved");
  await page.goto("/dashboard");
  await page
    .getByRole("link", { name: "HP Automated test draft", exact: true })
    .click();
  const photo = page.getByRole("img", { name: /seller photograph/ }).first();
  await expect(page).toHaveURL(/laptop\//, { timeout: 45000 });
  await expect(photo).toBeVisible({ timeout: 45000 });
  const privateMedia = await photo.getAttribute("src");
  expect(privateMedia).toBe(nextCover);
  await expect(page.getByText("1 / 4", { exact: true })).toBeVisible();
  expect((await page.request.get(privateMedia!)).status()).toBe(200);
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  expect((await page.request.get(privateMedia!)).status()).toBe(404);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/account/);
});
