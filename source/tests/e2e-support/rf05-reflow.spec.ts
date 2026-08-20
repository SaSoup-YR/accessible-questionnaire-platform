import { expect, test, type Page } from '@playwright/test';

async function expectNoDocumentHorizontalOverflow(page: Page, state: string) {
  const measurement = await page.evaluate(() => {
    const root = document.documentElement;
    const viewportWidth = root.clientWidth;
    const offenders = Array.from(document.body.querySelectorAll<HTMLElement>('*'))
      .flatMap((element) => {
        const style = getComputedStyle(element);
        if (style.position === 'fixed' && element.hidden) return [];
        const rect = element.getBoundingClientRect();
        if (rect.right <= viewportWidth + 1 && rect.left >= -1) return [];
        return [{
          element: [
            element.tagName.toLowerCase(),
            element.id ? `#${element.id}` : '',
            ...Array.from(element.classList).slice(0, 3).map((name) => `.${name}`),
          ].join(''),
          left: Math.round(rect.left * 100) / 100,
          right: Math.round(rect.right * 100) / 100,
          width: Math.round(rect.width * 100) / 100,
        }];
      })
      .slice(0, 20);
    return {
      clientWidth: viewportWidth,
      scrollWidth: root.scrollWidth,
      overflow: Math.max(0, root.scrollWidth - viewportWidth),
      offenders,
    };
  });

  expect(
    measurement.overflow,
    `${state}: document horizontal overflow; ${JSON.stringify(measurement)}`,
  ).toBeLessThanOrEqual(1);
}

async function chooseRating50(page: Page) {
  const allRatings = page.locator('.rating-option input');
  const value50 = page.locator('.rating-option input[value="50"]');
  await expect(allRatings).toHaveCount(21);
  await expect(value50).toHaveCount(1);
  await value50.check();
}

test('RF-05 ordinary participant states reflow at 320 CSS px', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/index.html');

  // Reserve a conventional vertical-scrollbar gutter. The frozen R1 failure was
  // observed in Firefox Responsive Design Mode where a page-level scrollbar made
  // a 320px body minimum create horizontal pressure. This stress remains within
  // the same 320 CSS-pixel A22 requirement and does not hide overflow.
  await page.addStyleTag({ content: 'html { scrollbar-gutter: stable; }' });

  await expectNoDocumentHorizontalOverflow(page, `${browserName}: introduction`);

  await page.getByRole('button', { name: 'Start the six ratings' }).click();
  await expect(page.locator('.rating-fieldset')).toBeVisible();
  await expectNoDocumentHorizontalOverflow(page, `${browserName}: rating item`);

  const voiceDetails = page.locator('.voice-input').first();
  await voiceDetails.locator('summary').click();
  await expect(voiceDetails).toHaveAttribute('open', '');
  await expectNoDocumentHorizontalOverflow(page, `${browserName}: expanded voice panel`);

  for (let item = 1; item <= 6; item += 1) {
    await chooseRating50(page);
    await expectNoDocumentHorizontalOverflow(page, `${browserName}: selected rating ${item}`);
    await page.getByRole('button', {
      name: item === 6 ? 'Continue to comparisons' : 'Next question',
    }).click();
  }

  const pairwise = page.locator('.choice-fieldset');
  await expect(pairwise).toBeVisible();
  await expectNoDocumentHorizontalOverflow(page, `${browserName}: pairwise choices`);

  await pairwise.locator('.choice-card input').first().check();
  await expect(pairwise.locator('.choice-card').first()).toContainText('Selected');
  await expectNoDocumentHorizontalOverflow(page, `${browserName}: selected pairwise choice`);
});
