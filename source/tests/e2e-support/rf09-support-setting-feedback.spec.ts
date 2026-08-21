import { expect, test, type Locator, type Page } from '@playwright/test';

async function activateLabelWithoutMovingExistingFocus(input: Locator) {
  await input.focus();
  const label = input.locator('xpath=ancestor::label[1]');
  await label.click();
  await expect(input).toBeFocused();
}

async function expectPoliteAnnouncement(page: Page, message: string) {
  const politeLog = page.locator('[data-aqp-announcement-priority="polite"]');
  await expect(politeLog.locator(':scope > div').last()).toHaveText(message);
  await expect(page.locator('[data-aqp-announcement-priority="assertive"]')).toBeEmpty();
}

test('RF-09 support settings give one visible, non-focus-moving feedback path', async ({ page, browserName }) => {
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

  const large = toolbar.locator('.text-size-control input[value="large"]');
  await activateLabelWithoutMovingExistingFocus(large);
  await expect(large).toBeChecked();
  await expect(feedback).toBeVisible();
  await expect(feedback).toHaveText('Large text selected.');
  await expect(answer).toBeChecked();
  await expectPoliteAnnouncement(page, 'Large text selected.');

  const recovery = toolbar.locator('input[id$="-recovery"]');
  await activateLabelWithoutMovingExistingFocus(recovery);
  await expect(recovery).toBeChecked();
  await expect(feedback).toHaveText(
    'Interruption recovery is on. Incomplete answers will be stored in this browser.',
  );
  await expect(answer).toBeChecked();
  await expectPoliteAnnouncement(
    page,
    'Interruption recovery is on. Incomplete answers will be stored in this browser.',
  );

  const audio = toolbar.locator('input[id$="-audio"]');
  await expect(audio, `${browserName}: browser speech synthesis should make the declared control available`).toBeEnabled();
  await activateLabelWithoutMovingExistingFocus(audio);
  await expect(audio).toBeChecked();
  await expect(feedback).toHaveText(
    'Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.',
  );
  await expect(answer).toBeChecked();

  await activateLabelWithoutMovingExistingFocus(audio);
  await expect(audio).not.toBeChecked();
  await expect(feedback).toHaveText(
    'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
  );
  await expect(answer).toBeChecked();
  await expectPoliteAnnouncement(
    page,
    'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
  );

  await expect(feedback).not.toBeFocused();
});
