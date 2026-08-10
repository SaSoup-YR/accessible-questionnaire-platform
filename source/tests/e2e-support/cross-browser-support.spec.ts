import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

test('records native browser support without injecting feature mocks', async ({
  page,
  browser,
  browserName,
}) => {
  await page.goto('/index.html');
  await expect(page.locator('h1')).toContainText('NASA Task Load Index');

  const nativeFeatures = await page.evaluate(() => ({
    speechRecognition: 'SpeechRecognition' in window,
    webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
    speechSynthesis: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    localStorage: (() => {
      try {
        localStorage.setItem('__aqp_browser_probe__', '1');
        localStorage.removeItem('__aqp_browser_probe__');
        return true;
      } catch {
        return false;
      }
    })(),
    sessionStorage: (() => {
      try {
        sessionStorage.setItem('__aqp_browser_probe__', '1');
        sessionStorage.removeItem('__aqp_browser_probe__');
        return true;
      } catch {
        return false;
      }
    })(),
    urlFragments: typeof URLSearchParams === 'function' && location.hash === '',
    userAgent: navigator.userAgent,
    platform: navigator.platform,
  }));

  const builtInVoiceRecognition =
    nativeFeatures.speechRecognition || nativeFeatures.webkitSpeechRecognition;
  const voiceStatus = page.getByText(/Built-in voice recognition is unavailable in this browser/).first();
  await page.getByRole('button', { name: /Start the six ratings/ }).click();
  await expect(page.locator('.rating-option input')).toHaveCount(21);
  await page.getByText('Answer this question by voice').click();

  if (builtInVoiceRecognition) {
    await expect(page.getByRole('button', { name: 'Start voice input' })).toBeEnabled();
  } else {
    await expect(page.getByRole('button', { name: 'Start voice input' })).toBeDisabled();
    await expect(voiceStatus).toBeVisible();
  }
  if (browserName === 'firefox') {
    expect(
      builtInVoiceRecognition,
      'Firefox must be reported honestly if this runner exposes no Web Speech recognition API',
    ).toBe(false);
  }

  const output = resolve(
    process.cwd(),
    `test-results/support/cross-browser-${browserName}.json`,
  );
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify({
    schemaVersion: 1,
    revision: process.env.GITHUB_SHA ?? 'local-uncommitted',
    testedRevision: process.env.GITHUB_SHA ?? 'local-uncommitted',
    sourceHeadRevision: process.env.AQP_SOURCE_HEAD_SHA ?? 'local-uncommitted',
    baseRevision: process.env.AQP_BASE_SHA || null,
    workflowEvent: process.env.AQP_WORKFLOW_EVENT ?? 'local',
    generatedAt: new Date().toISOString(),
    engine: browserName,
    browserVersion: browser.version(),
    userAgent: nativeFeatures.userAgent,
    platform: nativeFeatures.platform,
    context: browserName === 'webkit'
      ? 'Playwright WebKit on Linux CI; this is not Safari or VoiceOver evidence.'
      : `${browserName} on Linux CI`,
    features: {
      ...nativeFeatures,
      builtInVoiceRecognition,
      operatingSystemVoiceControl: 'not-assessed-by-browser-automation',
    },
    runnerSmoke: {
      introductionRendered: true,
      ratingScreenRendered: true,
      storedRatingTargets: 21,
      unavailableVoiceMessageMatchedFeatureDetection: true,
    },
  }, null, 2)}\n`, 'utf8');
});
