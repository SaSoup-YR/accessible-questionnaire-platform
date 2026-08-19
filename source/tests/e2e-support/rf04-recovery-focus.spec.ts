import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
  return `/index.html#${hash.toString()}`;
}

async function choose(page: Page, value: number) {
  await page.locator(`.rating-option:has(input[value="${value}"])`).click();
}

test('RF-04 keeps settled recovery focus and direct resume intact across browser engines', async ({ page }) => {
  const participantCode = `RF04-${test.info().project.name.toUpperCase()}`.slice(0, 64);
  await page.goto(configuredSusParticipant(participantCode));
  await expect(page.locator('#participant-code')).toHaveValue(participantCode);

  await page.getByRole('button', { name: 'Start the 10 items' }).click();
  await choose(page, 5);
  await page.getByRole('button', { name: 'Next question' }).click();
  await choose(page, 1);
  await page.getByRole('button', { name: 'Next question' }).click();
  await choose(page, 4);
  await expect(page.locator('.step-label')).toContainText('Rating 3 of 10');

  await page.reload();
  await expect(page.locator('.saved-session')).toContainText('3 of 10');

  // Wait beyond the delayed saved-progress status and Safari-only refocus window.
  // This asserts the final settled state rather than only the first DOM focus call.
  await page.waitForTimeout(900);
  const resume = page.getByRole('button', { name: 'Resume saved questionnaire' });
  await expect(resume).toBeFocused();

  await resume.click();
  await expect(page.locator('.step-label')).toContainText('Rating 4 of 10');
  await expect(page.locator('#rating-heading')).toHaveText('Item 4');
  await expect(page.locator('#rating-heading')).toBeFocused();
  await expect(page.locator('.rating-option input:checked')).toHaveCount(0);

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

  expect(saved).toMatchObject({ sus01: 5, sus02: 1, sus03: 4 });
});
