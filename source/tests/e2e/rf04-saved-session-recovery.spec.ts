import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const participantBaseUrl = 'http://127.0.0.1:4173/index.html';

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

// This rendered regression follows the same saved-answer boundary that drives frozen A14/A15.
test('RF-04 reload opens the saved session as a modal and Resume continues at the first unanswered SUS item', async ({ page }) => {
  const participantCode = 'E2E-RF04-01';
  await page.goto(configuredSusParticipant(participantCode));
  await expect(page.locator('#participant-code')).toHaveValue(participantCode);

  await page.getByRole('button', { name: 'Start the 10 items' }).click();

  await choose(page, 3);
  await page.getByRole('button', { name: 'Next question' }).click();
  await choose(page, 4);
  await page.getByRole('button', { name: 'Next question' }).click();

  // Deliberately save Item 3 without pressing Next. This reproduces the frozen
  // A15 condition in which the stored page index can still point at an already
  // answered item even though three answers are present.
  await choose(page, 2);
  await expect(page.locator('.step-label')).toContainText('Rating 3 of 10');

  await page.reload();

  const dialog = page.getByRole('dialog', { name: 'Saved questionnaire found' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('3 of 10');
  const resume = page.getByRole('button', { name: 'Resume saved questionnaire' });
  await expect(resume).toBeFocused();

  // Native modal behavior supplies a non-destructive Escape route. The saved
  // session remains available and a visible trigger reopens the same choices.
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  const reopen = page.getByRole('button', {
    name: 'Open saved-questionnaire choices',
  });
  await expect(reopen).toBeFocused();
  await reopen.click();
  await expect(dialog).toBeVisible();
  await expect(resume).toBeFocused();

  await resume.click();
  await expect(page.locator('.step-label')).toContainText('Rating 4 of 10');
  await expect(page.locator('#rating-heading')).toHaveText('Item 4');
  await expect(page.locator('#rating-heading')).toBeFocused();
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();

  const saved = await page.evaluate((code) => {
    const key = Object.keys(localStorage).find((candidate) =>
      candidate.startsWith('accessible-questionnaire-v0.8-progress:') &&
      candidate.endsWith(`:${code}`));
    if (!key) return null;
    const session = JSON.parse(localStorage.getItem(key) ?? 'null') as {
      ratings?: Record<string, number>;
    } | null;
    return session?.ratings ?? null;
  }, participantCode);

  expect(saved).toMatchObject({ sus01: 3, sus02: 4, sus03: 2 });
});
