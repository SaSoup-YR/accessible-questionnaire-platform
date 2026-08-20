import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const participantBaseUrl = 'http://127.0.0.1:4173/index.html';
const susVector = [5, 1, 4, 2, 3, 5, 1, 4, 2, 3] as const;

function configuredSusParticipant(participantCode: string) {
  const fixture = JSON.parse(readFileSync(
    resolve(process.cwd(), 'test-results/browser-study-configs.json'),
    'utf8',
  )) as {
    configurations: Record<string, { encodedStudy: string }>;
  };
  const config = fixture.configurations['system-usability-scale'];
  if (!config) throw new Error('No production-generated SUS browser configuration exists.');
  const hash = new URLSearchParams({
    study: config.encodedStudy,
    participant: participantCode,
  });
  return `${participantBaseUrl}#${hash.toString()}`;
}

async function choose(page: Page, value: number) {
  await page.locator(`.rating-option:has(input[value="${value}"])`).click();
}

async function reachSusReview(page: Page, participantCode: string) {
  await page.goto(configuredSusParticipant(participantCode));
  await expect(page.locator('#participant-code')).toHaveValue(participantCode);
  await page.getByRole('button', { name: 'Start the 10 items' }).click();

  for (let index = 0; index < susVector.length; index += 1) {
    await choose(page, susVector[index]);
    await page.getByRole('button', {
      name: index === susVector.length - 1 ? 'Review responses' : 'Next question',
    }).click();
  }

  await expect(page.locator('#review-heading')).toHaveText('Review your responses');
}

async function expectStableRecovery(page: Page, retryName: string) {
  await expect(page.locator('#review-heading')).toBeVisible();
  await expect(page.locator('#complete-heading')).toHaveCount(0);
  await expect(page.locator('#error-summary')).toBeFocused();
  await expect(page.locator('.submission-recovery')).toBeVisible();
  await expect(page.getByRole('button', { name: retryName })).toBeVisible();
  await expect(page.getByRole('button', { name: /Change item 1 answer/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download JSON backup' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download CSV backup' })).toBeVisible();
  await expect(page.locator('.saved-session')).toHaveCount(0);
}

test('RF-03 browser-storage failure stays on review, keeps recovery actions and retries cleanly', async ({ page }) => {
  const participantCode = 'E2E-RF03-STORAGE';
  await reachSusReview(page, participantCode);

  const progressKey = await page.evaluate((code) => Object.keys(localStorage).find((key) =>
    key.startsWith('accessible-questionnaire-v0.8-progress:') && key.endsWith(`:${code}`)) ?? null,
  participantCode);
  expect(progressKey).not.toBeNull();

  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    (window as unknown as { __rf03OriginalSetItem?: typeof Storage.prototype.setItem }).__rf03OriginalSetItem = original;
    Storage.prototype.setItem = function rf03BlockedSetItem(key: string, value: string) {
      if (this === window.localStorage) {
        throw new DOMException('Injected completed-record storage failure.', 'QuotaExceededError');
      }
      return original.call(this, key, value);
    };
  });

  await page.getByRole('button', { name: 'Calculate and submit responses' }).click();

  await expect(page.locator('#error-summary')).toContainText('The browser could not save the completed record');
  await expect(page.locator('#error-summary')).toContainText('study platform has not been contacted');
  await expectStableRecovery(page, 'Retry saving and submitting responses');

  await expect.poll(async () => page.evaluate((key) => key ? localStorage.getItem(key) : null, progressKey))
    .not.toBeNull();

  await page.evaluate(() => {
    const holder = window as unknown as { __rf03OriginalSetItem?: typeof Storage.prototype.setItem };
    if (holder.__rf03OriginalSetItem) {
      Storage.prototype.setItem = holder.__rf03OriginalSetItem;
      delete holder.__rf03OriginalSetItem;
    }
  });

  await page.getByRole('button', { name: 'Retry saving and submitting responses' }).click();
  await expect(page.locator('#complete-heading')).toBeVisible();
});

test('RF-03 sink refusal stays on review with Retry, Change and both backups', async ({ page }) => {
  const participantCode = 'E2E-RF03-SINK';
  await reachSusReview(page, participantCode);

  await page.evaluate(() => {
    (window as unknown as {
      accessibleQuestionnaireResultSink?: { name: string; submit(record: { submissionId: string }): Promise<unknown> };
    }).accessibleQuestionnaireResultSink = {
      name: 'Injected refusing sink',
      async submit() {
        throw new Error('Injected sink refusal.');
      },
    };
  });

  await page.getByRole('button', { name: 'Calculate and submit responses' }).click();

  await expect(page.locator('#error-summary')).toContainText('Injected sink refusal');
  await expect(page.locator('#error-summary')).toContainText('answers remain on this page');
  await expectStableRecovery(page, 'Retry submission');

  await page.evaluate(() => {
    (window as unknown as {
      accessibleQuestionnaireResultSink?: { name: string; submit(record: { submissionId: string }): Promise<unknown> };
    }).accessibleQuestionnaireResultSink = {
      name: 'Injected accepting sink',
      async submit(record) {
        return {
          accepted: true,
          submissionId: record.submissionId,
          receiptId: 'rf03-retry-receipt',
        };
      },
    };
  });

  await page.getByRole('button', { name: 'Retry submission' }).click();
  await expect(page.locator('#complete-heading')).toBeVisible();
});
