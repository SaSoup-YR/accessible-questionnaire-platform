import { expect, test, type Locator, type Page } from '@playwright/test';

type NotificationRecord = {
  message: string;
  priority: string | null;
  targetName: string;
};

const AUDIO_ON_MESSAGE =
  'Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.';

async function installNotificationRecorder(page: Page) {
  await page.evaluate(() => {
    const prototype = Element.prototype as Element & {
      ariaNotify: (
        message: string,
        options?: { priority?: string },
      ) => void;
    };
    const original = prototype.ariaNotify;
    if (typeof original !== 'function') {
      throw new Error('RF-09 ARIA notification polyfill was not installed.');
    }

    (window as any).__rf09NotificationLog = [];
    prototype.ariaNotify = function (
      this: Element,
      message: string,
      options?: { priority?: string },
    ) {
      (window as any).__rf09NotificationLog.push({
        message,
        priority: options?.priority ?? null,
        targetName: this.getAttribute('aria-label') ?? this.textContent?.trim() ?? '',
      });
      original.call(this, message, options);
    };
  });
}

async function notificationLog(page: Page) {
  return page.evaluate<NotificationRecord[]>(
    () => (window as any).__rf09NotificationLog ?? [],
  );
}

async function activateLabelWithoutMovingExistingFocus(input: Locator) {
  await input.focus();
  const label = input.locator('xpath=ancestor::label[1]');
  await label.click();
  await expect(input).toBeFocused();
}

async function expectSupportNotification(
  page: Page,
  message: string,
  expectedCount: number,
  legacyStatusBefore: string,
  targetName: string,
) {
  await expect.poll(async () => notificationLog(page)).toHaveLength(expectedCount);
  const records = await notificationLog(page);
  expect(records.at(-1)).toEqual({
    message,
    priority: 'normal',
    targetName,
  });

  // The older component-wide live region is not mutated by these setting
  // changes; ariaNotify is the sole new AT message when browser speech did not
  // actually start.
  await expect(page.locator('main > p.sr-only[aria-live="polite"]')).toHaveText(
    legacyStatusBefore,
  );
  await expect(
    page.locator('[data-aqp-announcement-priority="assertive"]'),
  ).toBeEmpty();
}

async function audioOnNotificationCount(
  page: Page,
  priorCount: number,
  legacyStatusBefore: string,
  targetName: string,
) {
  // Headless browser engines differ in whether their installed speech service
  // actually starts an utterance. RF-09 deliberately has two valid outcomes:
  // if speech starts, browser speech is the only AQP spoken channel; if it does
  // not start within the bounded grace period, one normal ariaNotify fallback
  // is emitted. Unit tests deterministically exercise both branches. This
  // rendered-browser test verifies either platform outcome without mocking the
  // browser's native speech service.
  await page.waitForTimeout(1200);
  const records = await notificationLog(page);
  expect(
    [priorCount, priorCount + 1],
    'audio-on must either start browser speech or emit exactly one AT fallback',
  ).toContain(records.length);
  if (records.length === priorCount + 1) {
    expect(records.at(-1)).toEqual({
      message: AUDIO_ON_MESSAGE,
      priority: 'normal',
      targetName,
    });
  }
  await expect(page.locator('main > p.sr-only[aria-live="polite"]')).toHaveText(
    legacyStatusBefore,
  );
  return records.length;
}

test('RF-09 support settings expose unique text labels and one non-focus-moving notification path', async ({ page, browserName }) => {
  await page.goto('/index.html');
  await installNotificationRecorder(page);
  await page.getByRole('button', { name: 'Start the six ratings' }).click();

  const answer = page.locator('.rating-option input[value="50"]');
  await answer.evaluate((element: HTMLInputElement) => element.click());
  await expect(answer).toBeChecked();
  const legacyStatusBefore =
    (await page.locator('main > p.sr-only[aria-live="polite"]').textContent())?.trim() ?? '';

  const toolbar = page.locator('.support-toolbar');
  await toolbar.locator('summary').click();
  await expect(toolbar).toHaveAttribute('open', '');

  const feedback = toolbar.locator('[data-rf09-support-feedback]');
  await expect(feedback).toBeHidden();

  const standard = toolbar.getByRole('radio', { name: 'Standard text', exact: true });
  const large = toolbar.getByRole('radio', { name: 'Large text', exact: true });
  await expect(
    standard,
    `${browserName}: Standard text must be a unique visible voice target`,
  ).toBeVisible();
  await expect(
    large,
    `${browserName}: Large text must be a unique visible voice target`,
  ).toBeVisible();
  await expect(standard.locator('xpath=ancestor::label[1]')).toContainText(
    'Standard text',
  );
  await expect(large.locator('xpath=ancestor::label[1]')).toContainText(
    'Large text',
  );
  await expect(standard).toHaveAttribute('aria-controls', /rf09-toolbar-support-feedback/);
  await expect(large).toHaveAttribute('aria-controls', /rf09-toolbar-support-feedback/);

  let expectedNotifications = 0;

  await activateLabelWithoutMovingExistingFocus(large);
  await expect(large).toBeChecked();
  await expect(feedback).toBeVisible();
  await expect(feedback).toHaveText('Large text selected.');
  await expect(answer).toBeChecked();
  expectedNotifications += 1;
  await expectSupportNotification(
    page,
    'Large text selected.',
    expectedNotifications,
    legacyStatusBefore,
    'Large text',
  );

  await activateLabelWithoutMovingExistingFocus(standard);
  await expect(standard).toBeChecked();
  await expect(feedback).toHaveText('Standard text selected.');
  await expect(answer).toBeChecked();
  expectedNotifications += 1;
  await expectSupportNotification(
    page,
    'Standard text selected.',
    expectedNotifications,
    legacyStatusBefore,
    'Standard text',
  );

  const recovery = toolbar.locator('input[id$="-recovery"]');
  await activateLabelWithoutMovingExistingFocus(recovery);
  await expect(recovery).toBeChecked();
  await expect(feedback).toHaveText(
    'Interruption recovery is on. Incomplete answers will be stored in this browser.',
  );
  await expect(answer).toBeChecked();
  expectedNotifications += 1;
  await expectSupportNotification(
    page,
    'Interruption recovery is on. Incomplete answers will be stored in this browser.',
    expectedNotifications,
    legacyStatusBefore,
    await recovery.getAttribute('aria-label') ?? '',
  );

  await activateLabelWithoutMovingExistingFocus(recovery);
  await expect(recovery).not.toBeChecked();
  await expect(feedback).toHaveText(
    'Interruption recovery is off. The saved in-progress copy has been removed.',
  );
  await expect(answer).toBeChecked();
  expectedNotifications += 1;
  await expectSupportNotification(
    page,
    'Interruption recovery is off. The saved in-progress copy has been removed.',
    expectedNotifications,
    legacyStatusBefore,
    await recovery.getAttribute('aria-label') ?? '',
  );

  const audio = toolbar.locator('input[id$="-audio"]');
  await expect(
    audio,
    `${browserName}: browser speech synthesis should make the declared control available`,
  ).toBeEnabled();
  await activateLabelWithoutMovingExistingFocus(audio);
  await expect(audio).toBeChecked();
  await expect(feedback).toHaveText(AUDIO_ON_MESSAGE);
  await expect(answer).toBeChecked();
  expectedNotifications = await audioOnNotificationCount(
    page,
    expectedNotifications,
    legacyStatusBefore,
    await audio.getAttribute('aria-label') ?? '',
  );

  await activateLabelWithoutMovingExistingFocus(audio);
  await expect(audio).not.toBeChecked();
  await expect(feedback).toHaveText(
    'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
  );
  await expect(answer).toBeChecked();
  expectedNotifications += 1;
  await expectSupportNotification(
    page,
    'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
    expectedNotifications,
    legacyStatusBefore,
    await audio.getAttribute('aria-label') ?? '',
  );

  await expect(feedback).not.toBeFocused();
});
