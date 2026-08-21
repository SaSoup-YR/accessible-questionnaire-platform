import { expect, test } from '@playwright/test';

const expected = [
  { value: '0', label: 'Low' },
  { value: '25', label: 'Closer to Low' },
  { value: '50', label: 'Middle' },
  { value: '75', label: 'Closer to High' },
  { value: '100', label: 'High' },
] as const;

test('RF-08 smiley choices keep native names and expose real on-screen radio targets', async ({ page, browserName }) => {
  await page.goto('/index.html');

  const answerMode = page.locator('.answer-mode-control');
  const smileyMode = answerMode.locator('input[type="radio"][value="smiley"]');
  await expect(smileyMode).toHaveCount(1);
  // RF-08 is testing the five rendered smiley answer radios, not the separate
  // answer-format control. Activate that existing custom radio through its
  // visible label so the test does not mistake its intentional hidden-input
  // styling for an RF-08 product failure.
  await answerMode.locator('label').filter({ hasText: 'Smiley landmarks' }).click();
  await expect(smileyMode).toBeChecked();

  await page.getByRole('button', { name: 'Start the six ratings' }).click();

  const group = page.locator('.smiley-response');
  await expect(group).toBeVisible();
  await expect(group).toContainText('Each face is one official value. Facial expression may imply good or bad, so this route is experimental.');

  const radios = group.locator('.smiley-option input[type="radio"]');
  await expect(radios).toHaveCount(5);

  for (const option of expected) {
    const radio = group.locator(`.smiley-option input[value="${option.value}"]`);
    await expect(radio, `${browserName}: smiley ${option.value} should be visible`).toBeVisible();
    await expect(radio).toHaveAttribute('aria-describedby', /smiley-help-/);

    const box = await radio.boundingBox();
    expect(box, `${browserName}: smiley ${option.value} must have a real layout box`).not.toBeNull();
    expect(box!.width, `${browserName}: smiley ${option.value} target width`).toBeGreaterThanOrEqual(20);
    expect(box!.height, `${browserName}: smiley ${option.value} target height`).toBeGreaterThanOrEqual(20);

    const style = await radio.evaluate((element) => {
      const css = getComputedStyle(element);
      return {
        clip: css.clip,
        clipPath: css.clipPath,
        overflow: css.overflow,
        position: css.position,
      };
    });
    expect(style.clip, `${browserName}: smiley ${option.value} must not be clipped`).toBe('auto');
    expect(style.clipPath, `${browserName}: smiley ${option.value} must not use inset clipping`).not.toContain('inset(50%');

    // Preserve the pre-fix screen-reader semantics: the accessible name keeps
    // the official value and visible landmark label, with item context after it.
    await expect(
      page.getByRole('radio', {
        name: new RegExp(`^${option.value}, ${option.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}, for Mental Demand$`),
      }),
      `${browserName}: smiley ${option.value} accessible name`,
    ).toHaveCount(1);
  }

  // Pointer/native-radio activation must still use the existing response path.
  const middle = group.locator('.smiley-option input[value="50"]');
  await middle.check();
  await expect(middle).toBeChecked();
  await expect(group.locator('.smiley-option').filter({ has: middle })).toContainText('Selected');

  const precise = page.locator('.precision-scale');
  await expect(precise.locator('summary')).toHaveText('Choose a more precise value on the full scale');
  await precise.locator('summary').click();
  await expect(precise.locator('.rating-fieldset')).toBeVisible();
  await expect(precise.locator('.rating-option input')).toHaveCount(21);
});