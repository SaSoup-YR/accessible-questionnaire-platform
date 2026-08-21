import { expect, test, type Locator, type Page } from '@playwright/test';

async function activateLabelWithoutMovingExistingFocus(input: Locator) {
  await input.focus();
  const label = input.locator('xpath=ancestor::label[1]');
  await label.click();
  await expect(input).toBeFocused();
}

async function expectSupportAnnouncement(page: Page, message: string) {
  const regions = page.locator('[data-rf09-support-announcement]');
  await expect(regions).toHaveCount(2);
  await expect.poll(async () =>
    (await regions.allTextContents()).map((text) => text.trim()).filter(Boolean),
  ).toEqual([message]);

  // The older component-wide live region is cleared for these setting messages,
  // so the alternating role=status pair is the only screen-reader channel.
  await expect(page.locator('main > p.sr-only[aria-live="polite"]')).toBeEmpty();
  await expect(page.locator('[data-aqp-announcement-priority="assertive"]')).toBeEmpty();
}

async function expectNoSupportAnnouncement(page: Page) {
  const regions = page.locator('[data-rf09-support-announcement]');
  await expect(regions).toHaveCount(2);
  await expect.poll(async () =>
    (await regions.allTextContents()).map((text) => text.trim()).filter(Boolean),
  ).toEqual([]);
}

test('RF-09 support settings expose unique text labels and one non-focus-moving status path', async ({ page, browserName }) => {
  await page.goto('/index.html');
  await page.getByRole('button', { name: 'Start the six ratings' }).click();

  const answer = page.locator('.rating-option input[value="50"]');
  await answer.evaluate((element: HTMLInputElement) => element.click());
  await expect(answer).toBeChecked();

  const toolbar = page.locator('.support-toolbar');
  await toolbar.locator('summary').click();
  await expect(toolbar).toHaveAttribute('open', '');

  const feedback = toolbar.locator('[data-rf09-support-feedback]');
  await expect(feedback).toBeHidden();

  const standard = toolbar.getByRole('radio', { name: 'Standard text', exact: true });
  const large = toolbar.getByRole('radio', { name: 'Large text', exact: true });
  await expect(standard, `${browserName}: Standard text must be a unique visible voice target`).toBeVisible();
  await expect(large, `${browserName}: Large text must be a unique visible voice target`).toBeVisible();
  await expect(standard.locator('xpath=ancestor::label[1]')).toContainText('Standard text');
  await expect(large.locator('xpath=ancestor::label[1]')).toContainText('Large text');

  await activateLabelWithoutMovingExistingFocus(large);
  await expect(large).toBeChecked();
  await expect(feedback).toBeVisible();
  await expect(feedback).toHaveText('Large text selected.');
  await expect(answer).toBeChecked();
  await expectSupportAnnouncement(page, 'Large text selected.');

  await activateLabelWithoutMovingExistingFocus(standard);
  await expect(standard).toBeChecked();
  await expect(feedback).toHaveText('Standard text selected.');
  await expect(answer).toBeChecked();
  await expectSupportAnnouncement(page, 'Standard text selected.');

  const recovery = toolbar.locator('input[id$="-recovery"]');
  await activateLabelWithoutMovingExistingFocus(recovery);
  await expect(recovery).toBeChecked();
  await expect(feedback).toHaveText(
    'Interruption recovery is on. Incomplete answers will be stored in this browser.',
  );
  await expect(answer).toBeChecked();
  await expectSupportAnnouncement(
    page,
    'Interruption recovery is on. Incomplete answers will be stored in this browser.',
  );

  await activateLabelWithoutMovingExistingFocus(recovery);
  await expect(recovery).not.toBeChecked();
  await expect(feedback).toHaveText(
    'Interruption recovery is off. The saved in-progress copy has been removed.',
  );
  await expect(answer).toBeChecked();
  await expectSupportAnnouncement(
    page,
    'Interruption recovery is off. The saved in-progress copy has been removed.',
  );

  const audio = toolbar.locator('input[id$="-audio"]');
  await expect(audio, `${browserName}: browser speech synthesis should make the declared control available`).toBeEnabled();
  await activateLabelWithoutMovingExistingFocus(audio);
  await expect(audio).toBeChecked();
  await expect(feedback).toHaveText(
    'Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.',
  );
  await expect(answer).toBeChecked();
  await expectNoSupportAnnouncement(page);

  await activateLabelWithoutMovingExistingFocus(audio);
  await expect(audio).not.toBeChecked();
  await expect(feedback).toHaveText(
    'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
  );
  await expect(answer).toBeChecked();
  await expectSupportAnnouncement(
    page,
    'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
  );

  await expect(feedback).not.toBeFocused();
});
