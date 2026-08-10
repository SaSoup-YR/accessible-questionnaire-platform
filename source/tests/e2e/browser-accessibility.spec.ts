import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const participantBaseUrl = 'http://127.0.0.1:4173/index.html';
const completedResultsKey = 'accessible-questionnaire-v0.8-completed-results';
const wcagTags = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
];

const requiredStateNames = [
  'Invalid participant link',
  'SUS introduction',
  'SUS accessibility options expanded',
  'SUS missing-answer error',
  'SUS built-in voice unavailable',
  'SUS voice listening',
  'SUS confirmed-voice proposal',
  'SUS voice-recognition error',
  'SUS item screen',
  'SUS saved-session recovery offer',
  'SUS resumed-progress summary',
  'SUS review screen',
  'SUS local submission failure and retry',
  'SUS completion screen',
  'SUS recovered-completion backup offer',
  'Qualtrics bridge connecting',
  'Qualtrics bridge failure',
  'Qualtrics submission transition',
  'Qualtrics recording-unconfirmed recovery',
  'NASA-TLX pairwise comparison',
  'NASA-TLX smiley-landmark item',
  'NASA-TLX gaze setup expanded',
  'NASA-TLX gaze positioning dialog',
  'NASA-TLX gaze calibration dialog',
  'NASA-TLX gaze proposal confirmation',
  'Synthetic semantic-differential item',
  'Imported fully labelled agreement item',
];

const fixtureInducedStates = new Set([
  'SUS local submission failure and retry',
  'Qualtrics bridge connecting',
  'Qualtrics bridge failure',
  'Qualtrics submission transition',
  'Qualtrics recording-unconfirmed recovery',
  'NASA-TLX gaze positioning dialog',
  'NASA-TLX gaze calibration dialog',
  'NASA-TLX gaze proposal confirmation',
]);

const scanProfiles = [
  {
    id: 'width-1280',
    viewport: { width: 1280, height: 900 },
    zoomPercent: 100,
    method: 'Playwright CSS viewport',
  },
  {
    id: 'width-768',
    viewport: { width: 768, height: 900 },
    zoomPercent: 100,
    method: 'Playwright CSS viewport',
  },
  {
    id: 'width-320',
    viewport: { width: 320, height: 900 },
    zoomPercent: 100,
    method: 'Playwright CSS viewport',
  },
  {
    id: 'zoom-200-cdp',
    viewport: { width: 1280, height: 900 },
    zoomPercent: 200,
    pageScaleFactor: 2,
    method:
      'Chromium DevTools Protocol Emulation.setPageScaleFactor at 2.0 on a 1280 × 900 viewport.',
  },
  {
    id: 'zoom-200-layout-equivalent',
    viewport: { width: 640, height: 450 },
    nominalViewport: { width: 1280, height: 900 },
    zoomPercent: 200,
    method:
      'Reflow companion for 200% zoom: a 1280 × 900 physical window exposes a 640 × 450 CSS-pixel layout viewport.',
  },
] as const;

interface ScanRecord {
  state: string;
  stateSetup: 'production workflow' | 'deterministic UI-state fixture';
  profile: string;
  zoomPercent: number;
  emulationMethod: string;
  nominalViewport?: { width: number; height: number };
  path: string;
  documentTitle: string;
  viewport: { width: number; height: number } | null;
  visualViewport: { width: number; height: number; scale: number } | null;
  horizontalOverflowCssPixels: number;
  horizontalOverflowElements: Array<{
    element: string;
    left: number;
    right: number;
    width: number;
  }>;
  targetSize: {
    tested: number;
    minimumWidthCssPixels: number | null;
    minimumHeightCssPixels: number | null;
    undersized: Array<{ element: string; width: number; height: number }>;
  };
  violations: Array<{ id: string; impact: string | null; nodes: number }>;
  incomplete: Array<{
    id: string;
    impact: string | null;
    nodes: number;
    nodeDetails: Array<{
      target: string;
      html: string;
      failureSummary: string;
    }>;
  }>;
}

const scans: ScanRecord[] = [];

async function scanProfile(page: Page, state: string, profile: typeof scanProfiles[number]) {
  await page.setViewportSize(profile.viewport);
  const cdp = await page.context().newCDPSession(page);
  const requestedPageScaleFactor = 'pageScaleFactor' in profile
    ? profile.pageScaleFactor
    : 1;
  await cdp.send('Emulation.setPageScaleFactor', {
    pageScaleFactor: requestedPageScaleFactor,
  });
  await cdp.detach();
  const visualViewport = await page.evaluate(() => window.visualViewport
    ? {
        width: Math.round(window.visualViewport.width * 100) / 100,
        height: Math.round(window.visualViewport.height * 100) / 100,
        scale: Math.round(window.visualViewport.scale * 100) / 100,
      }
    : null);
  if ('pageScaleFactor' in profile) {
    expect(
      visualViewport?.scale,
      `${state} at ${profile.id}: the requested page scale factor must be observable`,
    ).toBeCloseTo(profile.pageScaleFactor, 1);
  }
  const result = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  const horizontalOverflowCssPixels = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
  const horizontalOverflowElements = await page.locator('body *').evaluateAll((elements) => {
    const viewportWidth = document.documentElement.clientWidth;
    return elements.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.right <= viewportWidth + 1 && rect.left >= -1) return [];
      const identifier = [
        element.tagName.toLowerCase(),
        element.id ? `#${element.id}` : '',
        ...Array.from(element.classList).slice(0, 3).map((name) => `.${name}`),
      ].join('');
      return [{
        element: identifier,
        left: Math.round(rect.left * 100) / 100,
        right: Math.round(rect.right * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
      }];
    }).slice(0, 20);
  });
  const renderedTargets = await page.locator(
    'button:visible, summary:visible, .rating-option:visible, .choice-card:visible, .smiley-option:visible',
  ).evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      element: [
        element.tagName.toLowerCase(),
        element.id ? `#${element.id}` : '',
        element.getAttribute('aria-label') ? `[aria-label="${element.getAttribute('aria-label')}"]` : '',
      ].join(''),
      width: Math.round(rect.width * 100) / 100,
      height: Math.round(rect.height * 100) / 100,
    };
  }));
  const undersized = renderedTargets.filter(({ width, height }) => width < 24 || height < 24);
  scans.push({
    state,
    stateSetup: fixtureInducedStates.has(state)
      ? 'deterministic UI-state fixture'
      : 'production workflow',
    profile: profile.id,
    zoomPercent: profile.zoomPercent,
    emulationMethod: profile.method,
    ...('nominalViewport' in profile ? { nominalViewport: profile.nominalViewport } : {}),
    path: new URL(page.url()).pathname,
    documentTitle: await page.title(),
    viewport: page.viewportSize(),
    visualViewport,
    horizontalOverflowCssPixels,
    horizontalOverflowElements,
    targetSize: {
      tested: renderedTargets.length,
      minimumWidthCssPixels: renderedTargets.length
        ? Math.min(...renderedTargets.map(({ width }) => width))
        : null,
      minimumHeightCssPixels: renderedTargets.length
        ? Math.min(...renderedTargets.map(({ height }) => height))
        : null,
      undersized,
    },
    violations: result.violations.map(({ id, impact, nodes }) => ({
      id,
      impact: impact ?? null,
      nodes: nodes.length,
    })),
    incomplete: result.incomplete.map(({ id, impact, nodes }) => ({
      id,
      impact: impact ?? null,
      nodes: nodes.length,
      nodeDetails: nodes.map(({ target, html, failureSummary }) => ({
        target: JSON.stringify(target),
        html,
        failureSummary: failureSummary ?? 'axe did not provide a failure summary',
      })),
    })),
  });
  expect(
    result.violations,
    `${state} at ${profile.id}: automatically detectable axe violations`,
  ).toEqual([]);
  expect(
    horizontalOverflowCssPixels,
    `${state} at ${profile.id}: horizontal overflow; extending elements: ${JSON.stringify(horizontalOverflowElements)}`,
  ).toBeLessThanOrEqual(1);
  expect(
    undersized,
    `${state} at ${profile.id}: critical rendered targets smaller than 24 by 24 CSS pixels`,
  )
    .toEqual([]);
}

async function scan(page: Page, state: string) {
  for (const profile of scanProfiles) {
    await scanProfile(page, state, profile);
  }
  await page.setViewportSize(scanProfiles[0].viewport);
}

async function setRenderedState(page: Page, state: Record<string, unknown>) {
  await page.locator('accessible-questionnaire').evaluate(async (element, nextState) => {
    Object.assign(element, nextState);
    const component = element as HTMLElement & {
      requestUpdate(): void;
      updateComplete: Promise<boolean>;
    };
    component.requestUpdate();
    await component.updateComplete;
  }, state);
}

function configuredParticipant(
  instrumentId: string,
  participantCode: string,
) {
  const fixture = JSON.parse(readFileSync(
    resolve(process.cwd(), 'test-results/browser-study-configs.json'),
    'utf8',
  )) as {
    configurations: Record<string, { encodedStudy: string; definitionHash: string }>;
  };
  const config = fixture.configurations[instrumentId];
  if (!config) throw new Error(`No production-generated browser configuration exists for ${instrumentId}.`);
  const hash = new URLSearchParams({
    study: config.encodedStudy,
    participant: participantCode,
  });
  return {
    url: `${participantBaseUrl}#${hash.toString()}`,
    definitionHash: config.definitionHash,
  };
}

async function choose(page: Page, value: number) {
  await page.locator(`.rating-option:has(input[value="${value}"])`).click();
}

async function focusByKeyboard(page: Page, target: ReturnType<Page['locator']>) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  for (let step = 0; step < 30; step += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) break;
  }
  await expect(target).toBeFocused();
  return target.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      inViewport: rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight,
    };
  });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let recognitionStarts = 0;
    const testWindow = window as Window & {
      __aqpCompleteDeterministicRecognition?: () => void;
    };
    class DeterministicRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        recognitionStarts += 1;
        if (recognitionStarts === 1) {
          testWindow.__aqpCompleteDeterministicRecognition = () => {
            this.onresult?.({
              results: { 0: { 0: { transcript: 'number four' }, length: 1 }, length: 1 },
            });
            delete testWindow.__aqpCompleteDeterministicRecognition;
          };
          return;
        }
        queueMicrotask(() => {
          if (recognitionStarts === 2) {
            this.onerror?.({ error: 'no-speech' });
            return;
          }
          this.onresult?.({
            results: { 0: { 0: { transcript: 'number four' }, length: 1 }, length: 1 },
          });
        });
      }
      stop() {}
      abort() {}
    }
    Object.defineProperty(window, 'SpeechRecognition', {
      configurable: true,
      value: DeterministicRecognition,
    });
  });
});

test.afterAll(async ({ browser }) => {
  const output = resolve(process.cwd(), '../docs/evidence/axe-browser-report.json');
  const scannedStateNames = new Set(scans.map(({ state }) => state));
  const missingRequiredStates = requiredStateNames.filter((state) => !scannedStateNames.has(state));
  const missingRequiredStateProfiles = requiredStateNames.flatMap((state) =>
    scanProfiles
      .filter((profile) => !scans.some((scanRecord) =>
        scanRecord.state === state && scanRecord.profile === profile.id))
      .map((profile) => `${state} @ ${profile.id}`));
  const violationCount = scans.reduce((total, record) => total + record.violations.length, 0);
  const incompleteCount = scans.reduce((total, record) => total + record.incomplete.length, 0);
  const horizontalOverflowFailures = scans.filter(
    ({ horizontalOverflowCssPixels }) => horizontalOverflowCssPixels > 1,
  ).length;
  const targetSizeFailures = scans.reduce(
    (total, record) => total + record.targetSize.undersized.length,
    0,
  );
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify({
    schemaVersion: 1,
    evidenceType: 'real-browser automated accessibility regression',
    generatedAt: new Date().toISOString(),
    revision: process.env.GITHUB_SHA ?? 'local-uncommitted',
    testedRevision: process.env.GITHUB_SHA ?? 'local-uncommitted',
    sourceHeadRevision: process.env.AQP_SOURCE_HEAD_SHA ?? 'local-uncommitted',
    baseRevision: process.env.AQP_BASE_SHA || null,
    workflowEvent: process.env.AQP_WORKFLOW_EVENT ?? 'local',
    browser: `Chromium ${browser.version()}`,
    profiles: scanProfiles,
    axeTags: wcagTags,
    summary: {
      scannedStates: scannedStateNames.size,
      totalStateProfileScans: scans.length,
      violations: violationCount,
      incomplete: incompleteCount,
      horizontalOverflowFailures,
      targetSizeFailures,
      missingRequiredStates,
      missingRequiredStateProfiles,
    },
    interpretation:
      'Zero violations means axe found no automatically detectable violations in the named rendered states and profiles. The 200% condition uses Chromium DevTools Protocol page-scale emulation and is paired with the corresponding 640 × 450 CSS layout viewport for reflow. It is not a claim about browser-chrome controls. Automated output is not a complete WCAG conformance claim and does not test assistive-technology usability.',
    scans,
  }, null, 2)}\n`);
  expect(missingRequiredStates, 'all pre-specified rendered states must be scanned').toEqual([]);
  expect(
    missingRequiredStateProfiles,
    'every pre-specified rendered state must be scanned in every viewport and zoom profile',
  ).toEqual([]);
});

test('invalid participant link is rendered as a blocked, actionable state', async ({ page }) => {
  await page.goto(`${participantBaseUrl}#study=not-a-valid-configuration&participant=E2E-BAD-01`);
  await expect(page.getByRole('heading', { name: 'Study link problem' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Start/ })).toBeDisabled();
  await scan(page, 'Invalid participant link');
});

test('participant-code link precedence and manual fallback are enforced in Chromium', async ({ page }) => {
  const oldLink = configuredParticipant('system-usability-scale', 'E2E-OLD-LINK-01').url;
  await page.goto(oldLink);
  await expect(page.locator('#participant-code')).toHaveValue('E2E-OLD-LINK-01');
  await page.getByRole('button', { name: 'Start the 10 items' }).click();
  await expect(page.locator('.step-label')).toContainText('Item 1 of 10');

  const newLink = configuredParticipant('system-usability-scale', 'E2E-NEW-LINK-02').url;
  await page.goto(newLink);
  await expect(page.locator('#participant-code')).toHaveValue('E2E-NEW-LINK-02');
  await expect(page.locator('.restored-code-note')).toHaveCount(0);

  await page.evaluate(() => sessionStorage.clear());
  const missingCodeLink = new URL(newLink);
  const missingCodeParameters = new URLSearchParams(missingCodeLink.hash.slice(1));
  missingCodeParameters.delete('participant');
  missingCodeLink.hash = missingCodeParameters.toString();
  await page.goto(missingCodeLink.toString());
  await expect(page.locator('#participant-code')).toHaveValue('');
  await expect(page.locator('#participant-code')).toBeEditable();
  await expect(page.locator('#participant-code')).toHaveAttribute('aria-invalid', 'false');
  await page.locator('#participant-code').fill('E2E-MANUAL-03');
  await page.getByRole('button', { name: 'Start the 10 items' }).click();
  await expect(page.locator('.step-label')).toContainText('Item 1 of 10');
  expect(await page.evaluate(() => Object.keys(localStorage).some((key) =>
    key.startsWith('accessible-questionnaire-v0.8-progress:') &&
    key.endsWith(':E2E-MANUAL-03')))).toBe(true);

  const invalidCodeLink = new URL(newLink);
  const invalidCodeParameters = new URLSearchParams(invalidCodeLink.hash.slice(1));
  invalidCodeParameters.set('participant', '<script>');
  invalidCodeLink.hash = invalidCodeParameters.toString();
  await page.goto(invalidCodeLink.toString());
  await expect(page.locator('#participant-code')).toHaveValue('');
  await expect(page.locator('#participant-code')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#participant-code-help')).toContainText(
    'participant code in this link is invalid',
  );
  await expect(page.locator('.restored-code-note')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start the 10 items' }).click();
  await expect(page.locator('#error-summary')).toContainText(
    'Enter the valid pseudonymous participant code',
  );
});

test('SUS rendered states, recovery, review editing and completion', async ({ page }) => {
  const { url, definitionHash } = configuredParticipant(
    'system-usability-scale',
    'E2E-SUS-01',
  );
  await page.goto(url);

  await expect(page.locator('#participant-code')).toHaveValue('E2E-SUS-01');
  await expect(page.locator('#participant-code')).toBeEditable();
  await expect(page.locator('.participant-support-setup')).not.toHaveAttribute('open', '');
  await expect(page.locator('.participant-support-setup .audio-guidance')).toHaveCount(1);
  await expect(page.locator('.process-overview, .factor-reference, .study-details')).toHaveCount(0);
  const introWords = await page.locator('main').evaluate((element) =>
    (element as HTMLElement).innerText.trim().split(/\s+/).length);
  expect(introWords).toBeLessThan(160);
  await scan(page, 'SUS introduction');

  await page.getByText('Accessibility and audio options (optional)').click();
  await expect(page.locator('.participant-support-setup')).toHaveAttribute('open', '');
  await scan(page, 'SUS accessibility options expanded');

  await page.locator('#participant-code').fill('E2E-SUS-02');
  await expect(page.locator('#participant-code')).toHaveValue('E2E-SUS-02');

  await page.getByRole('button', { name: 'Start the 10 items' }).click();
  await expect(page.locator('.audio-guidance')).toHaveCount(0);
  const focusStyle = await focusByKeyboard(
    page,
    page.getByRole('button', { name: 'Next question' }),
  );
  expect(focusStyle.outlineStyle).not.toBe('none');
  expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(2);
  expect(focusStyle.inViewport).toBe(true);

  await page.getByRole('button', { name: 'Next question' }).click();
  await expect(page.locator('#error-summary')).toContainText('Choose a rating');
  await scan(page, 'SUS missing-answer error');

  await page.getByText('Answer this question by voice').click();
  await page.getByRole('button', { name: 'Start voice input' }).click();
  await expect(page.getByRole('button', { name: 'Listening…' })).toBeDisabled();
  await expect(page.locator('.voice-input')).toContainText('Listening for one answer');
  await scan(page, 'SUS voice listening');
  await page.evaluate(() => {
    const testWindow = window as Window & {
      __aqpCompleteDeterministicRecognition?: () => void;
    };
    testWindow.__aqpCompleteDeterministicRecognition?.();
  });
  await expect(page.locator('.voice-confirmation')).toContainText('Proposed answer');
  await scan(page, 'SUS confirmed-voice proposal');
  await page.locator('[data-voice-confirm]').click();
  await page.getByRole('button', { name: 'Next question' }).click();

  await page.getByText('Answer this question by voice').click();
  await page.getByRole('button', { name: 'Start voice input' }).click();
  await expect(page.locator('.voice-input')).toContainText('No speech was detected');
  await scan(page, 'SUS voice-recognition error');

  await page.evaluate(() => {
    delete (window as Window & { SpeechRecognition?: unknown }).SpeechRecognition;
    delete (window as Window & { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  });
  await setRenderedState(page, { voiceState: 'idle', voiceMessage: '', pendingVoiceAnswer: null });
  await expect(page.locator('.voice-input')).toContainText('unavailable in this browser');
  await scan(page, 'SUS built-in voice unavailable');
  await choose(page, 3);
  await page.getByRole('button', { name: 'Next question' }).click();
  // Preserve Mark's concrete regression case: Item 3 has the interior SUS
  // value 4, for which the instrument declares endpoints but no invented label.
  await choose(page, 4);
  await page.getByRole('button', { name: 'Next question' }).click();
  await scan(page, 'SUS item screen');

  await page.reload();
  await expect(page.locator('#participant-code')).toHaveValue('E2E-SUS-02');
  await expect(page.locator('.restored-code-note')).toContainText('restored for this tab');
  await expect(page.locator('.saved-session')).toContainText('3 of 10');
  await scan(page, 'SUS saved-session recovery offer');
  await page.getByRole('button', { name: /Resume saved questionnaire/ }).click();
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
  await scan(page, 'SUS resumed-progress summary');
  await page.getByRole('button', { name: 'Continue from here' }).click();

  for (let item = 4; item <= 10; item += 1) {
    await choose(page, item % 2 === 0 ? 2 : 4);
    await page.getByRole('button', {
      name: item === 10 ? 'Review responses' : 'Next question',
    }).click();
  }

  await expect(page.locator('.review-rating-card')).toHaveCount(10);
  await expect(page.locator('.review-rating-card').first()).toContainText(
    'I think that I would like to use this system frequently.',
  );
  await expect(page.locator('.review-rating-card').first()).toContainText('Selected answer');
  const markReviewCase = page.locator('#review-item-3');
  await expect(markReviewCase).toContainText('I thought the system was easy to use.');
  await expect(markReviewCase).toContainText('Selected answer: 4');
  await expect(markReviewCase.locator('.review-scale-context')).toContainText(
    'Scale: 1 — Strongly disagree to 5 — Strongly agree',
  );
  await expect(markReviewCase.getByRole('button')).toHaveAccessibleName(
    /Current answer: 4\. Scale: 1 — Strongly disagree to 5 — Strongly agree$/,
  );
  await expect(page.locator('.audio-guidance')).toHaveCount(0);
  const reviewChangeButtons = page.locator('.review-rating-card button[data-gaze-target]');
  await expect(reviewChangeButtons).toHaveCount(10);
  for (let item = 1; item <= 10; item += 1) {
    const button = reviewChangeButtons.nth(item - 1);
    const visibleLabel = `Change item ${item} answer`;
    await expect(button).toHaveText(visibleLabel);
    await expect(button).toHaveAttribute('aria-label', new RegExp(`^${visibleLabel}\\.`));
    await expect(button).toHaveAttribute('data-gaze-label', visibleLabel);
  }
  await scan(page, 'SUS review screen');

  await setRenderedState(page, {
    hostSubmissionFailed: true,
    completionSavedLocally: false,
    submittedRecord: { submissionId: 'fixture-submission-not-sent' },
  });
  await expect(page.getByRole('heading', { name: /has not confirmed this response/ })).toBeVisible();
  await scan(page, 'SUS local submission failure and retry');
  await setRenderedState(page, {
    hostSubmissionFailed: false,
    submittedRecord: null,
  });

  const readSavedItemTwo = () => page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) =>
      candidate.startsWith('accessible-questionnaire-v0.8-progress:') &&
      candidate.endsWith(':E2E-SUS-02'));
    if (!key) return null;
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as {
      stage?: string;
      ratings?: Record<string, number>;
      ratingInputRoutes?: Record<string, string>;
    } | null;
    return saved
      ? {
          stage: saved.stage,
          value: saved.ratings?.sus02,
          route: saved.ratingInputRoutes?.sus02,
        }
      : null;
  });
  expect(await readSavedItemTwo()).toEqual({ stage: 'review', value: 3, route: 'standard-scale' });

  await page.getByRole('button', { name: /^Change item 2 answer\./ }).click();
  await choose(page, 1);
  // A proposed review edit is not committed to recovery storage until Save.
  expect(await readSavedItemTwo()).toEqual({ stage: 'review', value: 3, route: 'standard-scale' });
  await page.getByRole('button', { name: 'Cancel change and return to review' }).click();
  const cancelledReviewItem = page.locator('#review-item-2');
  await expect(cancelledReviewItem.locator('#review-item-answer-2 > strong')).toHaveText(
    'Selected answer: 3',
  );
  await expect(cancelledReviewItem.locator('.review-scale-context')).toHaveText(
    'Scale: 1 — Strongly disagree to 5 — Strongly agree',
  );
  await expect(cancelledReviewItem).toBeFocused();
  expect(await readSavedItemTwo()).toEqual({ stage: 'review', value: 3, route: 'standard-scale' });

  await page.getByRole('button', { name: /^Change item 2 answer\./ }).click();
  await choose(page, 5);
  await page.getByRole('button', { name: 'Save change and return to review' }).click();
  const editedReviewItem = page.locator('#review-item-2');
  await expect(editedReviewItem.locator('#review-item-answer-2 > strong')).toHaveText(
    'Selected answer: 5 — Strongly agree',
  );
  await expect(editedReviewItem.locator('.review-scale-context')).toHaveCount(0);
  await expect(editedReviewItem).toBeFocused();
  expect(await readSavedItemTwo()).toEqual({ stage: 'review', value: 5, route: 'standard-scale' });
  const reviewFocusStyle = await editedReviewItem.evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      inViewport: rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight,
    };
  });
  expect(reviewFocusStyle.outlineStyle).not.toBe('none');
  expect(Number.parseFloat(reviewFocusStyle.outlineWidth)).toBeGreaterThanOrEqual(2);
  expect(reviewFocusStyle.inViewport).toBe(true);

  await page.getByRole('button', { name: 'Calculate and submit responses' }).click();
  await expect(page.locator('#complete-heading')).toBeVisible();
  const storedRecord = await page.evaluate(({ storageKey, participantCode }) => {
    const records = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Array<{
      participantCode: string;
      instrument: { definitionHash: string; definition?: { id: string; items: unknown[] } };
    }>;
    return records.find((record) => record.participantCode === participantCode) ?? null;
  }, { storageKey: completedResultsKey, participantCode: 'E2E-SUS-02' });
  expect(definitionHash).toMatch(/^sha256:[0-9a-f]{64}$/);
  expect(storedRecord?.participantCode).toBe('E2E-SUS-02');
  expect(storedRecord?.instrument.definitionHash).toBe(definitionHash);
  expect(storedRecord?.instrument.definition?.id).toBe('system-usability-scale');
  expect(storedRecord?.instrument.definition?.items).toHaveLength(10);
  await scan(page, 'SUS completion screen');

  // Reload the document rather than navigating to the already-current URL.
  // A same-URL navigation may remain on the live completion component and
  // therefore does not exercise startup reconstruction from localStorage.
  await page.reload();
  await expect(page.locator('#complete-heading')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'A completed backup was found on this device' })).toBeVisible();
  await scan(page, 'SUS recovered-completion backup offer');
});

test('Qualtrics bridge and recording recovery states are rendered explicitly', async ({ page }) => {
  const { url } = configuredParticipant('system-usability-scale', 'E2E-Q-01');
  await page.goto(url);
  const qualtricsCollection = {
    mode: 'qualtrics',
    parentOrigin: 'https://ucl-example.eu.qualtrics.com',
  };
  await page.locator('accessible-questionnaire').evaluate(async (element, collection) => {
    const component = element as any;
    component.studyConfig = { ...component.studyConfig, collection };
    component.hostBridgeState = 'connecting';
    component.hostBridgeMessage = 'Checking the pinned Qualtrics bridge.';
    component.requestUpdate();
    await component.updateComplete;
  }, qualtricsCollection);
  await expect(page.getByRole('heading', { name: 'Checking secure result collection' })).toBeVisible();
  await scan(page, 'Qualtrics bridge connecting');

  await setRenderedState(page, {
    hostBridgeState: 'failed',
    hostBridgeMessage: 'The required Qualtrics bridge did not connect. Do not start this questionnaire.',
  });
  await expect(page.getByRole('heading', { name: 'Qualtrics connection problem' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Start/ })).toBeDisabled();
  await scan(page, 'Qualtrics bridge failure');

  const result = {
    scoreName: 'SUS score',
    primaryScore: 50,
    scoreMaximum: 100,
  };
  await setRenderedState(page, {
    stage: 'complete',
    result,
    submittedRecord: { submissionId: 'fixture-qualtrics-complete' },
    completionSavedLocally: true,
    completionSavedByHost: true,
    remoteRecordingUnconfirmed: false,
    hostBridgeState: 'connected',
  });
  await expect(page.locator('#complete-heading')).toHaveText('Submitting response');
  await expect(page.getByRole('heading', { name: 'Waiting for Qualtrics', exact: true })).toBeVisible();
  await scan(page, 'Qualtrics submission transition');

  await setRenderedState(page, { remoteRecordingUnconfirmed: true });
  await expect(page.getByRole('heading', { name: 'Qualtrics has not confirmed a recorded response' })).toBeVisible();
  await scan(page, 'Qualtrics recording-unconfirmed recovery');
});

test('NASA-TLX pairwise state', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByRole('button', { name: 'Start the six ratings' }).click();
  for (let item = 1; item <= 6; item += 1) {
    await choose(page, 50);
    await page.getByRole('button', {
      name: item === 6 ? 'Continue to comparisons' : 'Next question',
    }).click();
  }
  await expect(page.locator('.choice-fieldset')).toBeVisible();
  await scan(page, 'NASA-TLX pairwise comparison');
});

test('NASA-TLX optional smiley and experimental gaze UI states', async ({ page }) => {
  await page.goto('/index.html');
  await page.getByText('Accessibility and audio options (optional)').click();
  await page.locator('.gaze-setup').first().getByText('Gaze-assisted answering with WebGazer (experimental)').click();
  await expect(page.locator('.gaze-setup').first()).toHaveAttribute('open', '');
  await scan(page, 'NASA-TLX gaze setup expanded');

  await page.locator('#support-intro-smiley-answer').check();
  await page.getByRole('button', { name: 'Start the six ratings' }).click();
  await expect(page.locator('.smiley-response')).toBeVisible();
  await scan(page, 'NASA-TLX smiley-landmark item');

  await setRenderedState(page, { gazeState: 'positioning' });
  await expect(page.getByRole('dialog', { name: 'Position your camera' })).toBeVisible();
  await scan(page, 'NASA-TLX gaze positioning dialog');

  await setRenderedState(page, {
    gazeState: 'calibrating',
    gazeCalibrationIndex: 0,
    gazeCalibrationRepetition: 0,
  });
  await expect(page.getByRole('dialog', { name: 'Gaze calibration' })).toBeVisible();
  await scan(page, 'NASA-TLX gaze calibration dialog');

  await page.locator('accessible-questionnaire').evaluate(async (element) => {
    const component = element as any;
    component.gazeState = 'ready';
    component.gazePendingLabel = '50 for Mental Demand';
    component.gazePendingElement = component.querySelector('.smiley-option');
    component.gazeDwellProgress = 0.5;
    component.requestUpdate();
    await component.updateComplete;
  });
  await expect(page.getByRole('heading', { name: 'Gaze proposal' })).toBeVisible();
  await scan(page, 'NASA-TLX gaze proposal confirmation');
});

test('a synthetic semantic differential uses unnumbered response positions', async ({ page }) => {
  const { url } = configuredParticipant(
    'custom-semantic-differential-check',
    'E2E-SEMANTIC-01',
  );
  await page.goto(url);
  await page.getByRole('button', { name: 'Start the 1 item' }).click();

  await expect(page.locator('.semantic-differential-grid .rating-option')).toHaveCount(7);
  await expect(page.locator('.semantic-differential-grid .rating-option-content strong')).toHaveCount(0);
  await expect(page.locator('.semantic-differential-grid input').first()).toHaveAttribute(
    'aria-label',
    /Position 1 of 7, Rigid/,
  );
  await scan(page, 'Synthetic semantic-differential item');
});

test('imported German scale suppresses duplicate endpoints but keeps middle labels', async ({ page }) => {
  const { url } = configuredParticipant(
    'custom-german-agreement-check',
    'E2E-LABELS-01',
  );
  await page.goto(url);
  await page.getByRole('button', { name: 'Start the 1 item' }).click();

  await expect(page.locator('.fully-labelled-rating-grid')).toBeVisible();
  await expect(page.locator('.rating-anchors')).toHaveCount(1);
  await expect(page.locator('.rating-anchors')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.rating-option small')).toHaveText([
    'trifft eher nicht zu',
    'teils/teils',
    'trifft eher zu',
  ]);
  const fieldsetText = await page.locator('.rating-fieldset').innerText();
  // The endpoint is visible in the legend and visual anchor, but not repeated
  // a third time inside its option. The anchor is aria-hidden, so assistive
  // technology receives the endpoint once through the legend.
  expect(fieldsetText.match(/trifft gar nicht zu/g)).toHaveLength(2);
  expect(fieldsetText.match(/teils\/teils/g)).toHaveLength(1);
  await expect(page.locator('.rating-option input').first()).toHaveAttribute(
    'aria-label',
    /1, trifft gar nicht zu, for Item 1/,
  );
  await scan(page, 'Imported fully labelled agreement item');
});
