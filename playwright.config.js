const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry"
  },
  webServer: {
    command: "python3 -m http.server 4173",
    cwd: ".",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 30000
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--no-sandbox"],
          ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
            ? {
                executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
              }
            : {})
        }
      }
    },
    {
      name: "iPhone 12",
      use: {
        ...devices["iPhone 12"]
      }
    },
    {
      name: "Pixel 7",
      use: {
        ...devices["Pixel 7"],
        launchOptions: {
          args: ["--no-sandbox"],
          ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
            ? {
                executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
              }
            : {})
        }
      }
    }
  ]
});
