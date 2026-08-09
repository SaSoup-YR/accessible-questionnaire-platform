import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results/rendered',
  // One state is evaluated across five viewport/zoom profiles. The SUS path
  // intentionally scans nine states (45 axe runs), so the generic 30-second
  // interaction-test default is not an appropriate evidence-run limit.
  timeout: 300_000,
  fullyParallel: false,
  workers: 1,
  // Evidence runs must pass cleanly. A retry would split the per-state report
  // across worker processes and could hide an intermittent accessibility fault.
  retries: 0,
  reporter: process.env.CI
    ? [
        ['line'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
      ]
    : [['line']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    viewport: { width: 320, height: 900 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview:test',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
