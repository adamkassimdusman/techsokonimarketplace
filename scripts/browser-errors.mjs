import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
p.on("console", (m) => {
  if (m.type() === "error") console.log("CONSOLE", m.text());
});
await p.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await b.close();
