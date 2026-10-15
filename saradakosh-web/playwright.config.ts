import { defineConfig, devices } from '@playwright/test';

const port = 3100;
const localBaseURL = `http://127.0.0.1:${port}`;
const externalBaseURL = process.env.PLAYWRIGHT_TEST_BASE_URL?.trim();

if (externalBaseURL) {
  const target = new URL(externalBaseURL);
  if (!['http:', 'https:'].includes(target.protocol) ||
      target.username || target.password || target.pathname !== '/' ||
      target.search || target.hash) {
    throw new Error('PLAYWRIGHT_TEST_BASE_URL must be an HTTP(S) origin without credentials, path, query or fragment');
  }
}

const baseURL = externalBaseURL || localBaseURL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
  ],
  webServer: externalBaseURL ? undefined : {
    command: `npm run build && npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: localBaseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { NEXT_TELEMETRY_DISABLED: '1' },
  },
});
