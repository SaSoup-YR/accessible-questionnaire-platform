import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e-support',
  outputDir: './test-results/support',
  fullyParallel: true,
  retries: 0,
  reporter: [['line']],
  projects: [
    { name: 'chromium-support', use: { browserName: 'chromium' } },
    { name: 'firefox-support', use: { browserName: 'firefox' } },
    { name: 'webkit-support', use: { browserName: 'webkit' } },
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview:test',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
