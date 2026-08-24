/**
 * Playwright E2E Configuration
 * Run: npx playwright test
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './hrm/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'hrm/e2e/test-results' }],
  ],

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  globalSetup: './hrm/e2e/global-setup.ts',
  globalTeardown: './hrm/e2e/global-teardown.ts',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for additional browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  webServer: process.env.CI ? undefined : {
    command: 'pnpm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
