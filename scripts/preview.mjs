import { chromium } from "@playwright/test";
const browser = await chromium.launch({ headless: true });
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.screenshot({
    path: `../marketplace-${name}.png`,
    fullPage: true,
    caret: "initial",
  });
  await page.close();
}
await browser.close();
