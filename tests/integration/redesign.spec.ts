import { test, expect } from "@playwright/test";
test("mobile filters, finder, navigation and private draft recovery", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByLabel("Find a laptop", { exact: true })
    .fill("HP EliteBook under 30K");
  await page
    .getByRole("button", { name: "Find a laptop", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Remove Max KSh filter" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Filters/ }).click();
  const dialog = page.getByRole("dialog", { name: "Filter laptops" });
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole("combobox", { name: "Minimum RAM" })
    .selectOption("16");
  await dialog.getByRole("button", { name: "Apply filters" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/ram=16/);
  await page.getByRole("link", { name: "Remove RAM ≥ filter" }).click();
  await expect(page).not.toHaveURL(/ram=16/);
  await page.goto("/finder");
  await page.getByLabel("Maximum budget (KSh)").fill("30000");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Programming", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("link", { name: "Show matching laptops" }).click();
  await expect(page).toHaveURL(/use=programming/);
  await page.goto("/account?mode=register");
  await page.getByLabel("Your public name").fill("Draft recovery fixture");
  await page
    .getByLabel("Email", { exact: true })
    .first()
    .fill("draft-" + Date.now() + "@test.invalid");
  await page
    .getByLabel("Password", { exact: false })
    .fill("Isolated draft password 123!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/sell");
  await page
    .getByLabel("Family and exact model")
    .fill("Private incomplete model");
  await expect(page.getByText(/Text draft saved privately/)).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Family and exact model")).toHaveValue(
    "Private incomplete model",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
