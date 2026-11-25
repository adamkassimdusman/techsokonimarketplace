import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  timeout: 120000,
  expect: { timeout: 15000 },
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  use: {
    actionTimeout: 20000,
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "node scripts/integration-server.mjs",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
