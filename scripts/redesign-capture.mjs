import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const phase = process.argv[2] || "before";
const dir = "../redesign/" + phase;
await mkdir(dir, { recursive: true });
const b = await chromium.launch();
const records = [];
for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  for (const [name, path] of [
    ["home", "/"],
    ["marketplace", "/marketplace"],
    ["dealers", "/dealers"],
    ["account", "/account"],
    ["trust", "/trust"],
  ]) {
    await p.goto("http://127.0.0.1:3000" + path, { waitUntil: "networkidle" });
    records.push({
      name,
      width,
      overflow: await p.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      title: await p.title(),
    });
    if ([390, 768, 1440].includes(width))
      await p.screenshot({
        path: dir + "/" + name + "-" + width + ".png",
        fullPage: true,
      });
  }
  await p.close();
}
await writeFile(dir + "/responsive.json", JSON.stringify(records, null, 2));
await b.close();
console.log("Captured public pages at seven widths.");
