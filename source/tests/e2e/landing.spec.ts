import { expect, test } from '@playwright/test';

const baseUrl = 'http://127.0.0.1:4173/index.html';

test('the root page presents the platform instead of one default questionnaire', async ({
  page,
}) => {
  await page.goto(baseUrl);

  await expect(
    page.getByRole('heading', { name: 'Accessible Questionnaire Platform' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Questionnaire demonstrations' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open weighted NASA-TLX' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open raw NASA-TLX' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open SUS' })).toBeVisible();
  await expect(page.locator('accessible-questionnaire')).toHaveCount(0);
});

test('a demonstration link creates a configured participant route', async ({ page }) => {
  await page.goto(baseUrl);
  await page.getByRole('link', { name: 'Open SUS' }).click();

  await expect(page).toHaveURL(/#study=/);
  await expect(page).not.toHaveURL(/\?demo=/);
  await expect(
    page.getByRole('heading', { name: 'System Usability Scale' }),
  ).toBeVisible();
  await expect(page.locator('#participant-code')).toHaveValue('DEMO');
  await expect(page.getByText('Demonstration mode')).toHaveCount(0);
});
