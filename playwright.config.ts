import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  /* Global timeout per test – the flow spans login, OTP and transfer */
  timeout: 90_000,
  /* Default timeout for web-first assertions (explicit waits) */
  expect: { timeout: 15_000 },
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['allure-playwright', {
      detail: true,
      environmentInfo: {
        BaseUrl: process.env.BASE_URL,
        Platform: os.platform(),
        'Platform version': os.release(),
        'OS Version': os.version(),
        'Executed on': os.hostname(),
      },
    }],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'UI Tests',
      testDir: 'tests/Tests/UI',
      workers: 1,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
