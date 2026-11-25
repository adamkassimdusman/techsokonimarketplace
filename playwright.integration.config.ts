import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/integration",
  workers: 1,
  timeout: 180000,
  expect: { timeout: 20000 },
  use: {
    actionTimeout: 20000,
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [{ name: "workflow", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node scripts/integration-server.mjs",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
