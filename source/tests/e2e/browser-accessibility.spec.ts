import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { QuestionnaireDefinition } from '../../src/questionnaire-definition';

const participantBaseUrl = 'http://127.0.0.1:4173/index.html';
const completedResultsKey = 'accessible-questionnaire-v0.8-completed-results';
const builtInDefinitionFiles: Record<string, string> = {
  'nasa-tlx-weighted': 'nasa-tlx-weighted.questionnaire.json',
  'nasa-tlx-raw': 'nasa-tlx-raw.questionnaire.json',
  'system-usability-scale': 'system-usability-scale.questionnaire.json',
  'user-experience-questionnaire-short': 'user-experience-questionnaire-short.questionnaire.json',
};

const wcagTags = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
];

const requiredStateNames = [
  'SUS introduction',
  'SUS missing-answer error',
  'SUS voice listening',
  'SUS confirmed-voice proposal',
  'SUS voice-recognition error',
  'SUS item screen',
  'SUS saved-session recovery offer',
  'SUS review screen',
  'SUS completion screen',
  'NASA-TLX pairwise comparison',
  'UEQ-S semantic-differential item',
  'Imported fully labelled agreement item',
];

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
  profile: string;
  zoomPercent: number;
  emulationMethod: string;
  nominalViewport?: { width: number; height: number };
  path: string;
  documentTitle: string;
  viewport: { width: number; height: number } | null;
  visualViewport: { width: number; height: number; scale: number } | null;
  horizontalOverflowCssPixels: number;
  targetSize: {
    tested: number;
    minimumWidthCssPixels: number | null;
    minimumHeightCssPixels: number | null;
    undersized: Array<{ element: string; width: number; height: number }>;
  };
  violations: Array<{ id: string; impact: string | null; nodes: number }>;
  incomplete: Array<{ id: string; impact: string | null; nodes: number }>;
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
    profile: profile.id,
    zoomPercent: profile.zoomPercent,
    emulationMethod: profile.method,
    ...('nominalViewport' in profile ? { nominalViewport: profile.nominalViewport } : {}),
    path: new URL(page.url()).pathname,
    documentTitle: await page.title(),
    viewport: page.viewportSize(),
    visualViewport,
    horizontalOverflowCssPixels,
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
    })),
  });
  expect(
    result.violations,
    `${state} at ${profile.id}: automatically detectable axe violations`,
  ).toEqual([]);
  expect(
    horizontalOverflowCssPixels,
    `${state} at ${profile.id}: horizontal overflow`,
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

function configuredParticipant(
  instrumentId: string,
  participantCode: string,
  questionnaireDefinition?: QuestionnaireDefinition,
) {
  const definition = questionnaireDefinition ?? readBuiltInDefinition(instrumentId);
  const definitionHash = `sha256:${createHash('sha256').update(canonicalJson(definition)).digest('hex')}`;
  const config = {
    schemaVersion: 4,
    configId: `browser-config-${instrumentId}`,
    createdAt: '2026-08-08T00:00:00.000Z',
    prototypeVersion: '0.8.0',
    instrumentId,
    definitionHash,
    ...(questionnaireDefinition ? { questionnaireDefinition } : {}),
    studyId: `BROWSER-${instrumentId}`.slice(0, 64),
    studyTitle: 'Browser accessibility regression',
    taskLabel: 'using the test interface',
    showScoreToParticipant: true,
    support: {
      showSimpleLanguage: false,
      answerMode: 'standard',
      largeText: false,
      audioGuidance: false,
      recoveryEnabled: true,
      participantAdjustmentPolicy: 'participant-choice',
      voiceInputAvailable: true,
      gazeInputAvailable: false,
    },
    collection: { mode: 'local' },
  };
  const hash = new URLSearchParams({
    study: Buffer.from(JSON.stringify(config), 'utf8').toString('base64url'),
    participant: participantCode,
  });
  return {
    url: `${participantBaseUrl}#${hash.toString()}`,
    definitionHash,
  };
}

function readBuiltInDefinition(instrumentId: string) {
  const fileName = builtInDefinitionFiles[instrumentId];
  if (!fileName) throw new Error(`No browser fixture exists for ${instrumentId}.`);
  return JSON.parse(
    readFileSync(resolve(process.cwd(), 'instruments', fileName), 'utf8'),
  ) as QuestionnaireDefinition;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`).join(',')}}`;
}

async function choose(page: Page, value: number) {
  await page.locator(`.rating-option input[value="${value}"]`).check();
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
  await choose(page, 3);
  await page.getByRole('button', { name: 'Next question' }).click();
  await choose(page, 2);
  await page.getByRole('button', { name: 'Next question' }).click();
  await scan(page, 'SUS item screen');

  await page.reload();
  await expect(page.locator('.saved-session')).toContainText('3 of 10');
  await scan(page, 'SUS saved-session recovery offer');
  await page.getByRole('button', { name: /Resume saved questionnaire/ }).click();
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
  await expect(page.locator('.audio-guidance')).toHaveCount(0);
  await scan(page, 'SUS review screen');

  await page.getByRole('button', { name: /^Change answer for Item 2\./ }).click();
  await choose(page, 5);
  await page.getByRole('button', { name: 'Save change and return to review' }).click();
  const editedReviewItem = page.locator('#review-item-2');
  await expect(editedReviewItem).toContainText('5 — Strongly agree');
  await expect(editedReviewItem).toBeFocused();
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
  const storedInstrument = await page.evaluate(({ storageKey, participantCode }) => {
    const records = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as Array<{
      participantCode: string;
      instrument: { definitionHash: string; definition?: { id: string; items: unknown[] } };
    }>;
    return records.find((record) => record.participantCode === participantCode)
      ?.instrument ?? null;
  }, { storageKey: completedResultsKey, participantCode: 'E2E-SUS-01' });
  expect(definitionHash).toMatch(/^sha256:[0-9a-f]{64}$/);
  expect(storedInstrument?.definitionHash).toBe(definitionHash);
  expect(storedInstrument?.definition?.id).toBe('system-usability-scale');
  expect(storedInstrument?.definition?.items).toHaveLength(10);
  await scan(page, 'SUS completion screen');
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

test('UEQ-S uses unnumbered semantic-differential positions', async ({ page }) => {
  const { url } = configuredParticipant(
    'user-experience-questionnaire-short',
    'E2E-UEQS-01',
  );
  await page.goto(url);
  await page.getByRole('button', { name: 'Start the 8 items' }).click();

  await expect(page.locator('.semantic-differential-grid .rating-option')).toHaveCount(7);
  await expect(page.locator('.semantic-differential-grid .rating-option-content strong')).toHaveCount(0);
  await expect(page.locator('.semantic-differential-grid input').first()).toHaveAttribute(
    'aria-label',
    /Position 1 of 7, Obstructive/,
  );
  await scan(page, 'UEQ-S semantic-differential item');
});

test('imported German scale suppresses duplicate endpoints but keeps middle labels', async ({ page }) => {
  const definition: QuestionnaireDefinition = {
    schemaVersion: 1,
    language: 'de',
    id: 'custom-german-agreement-check',
    version: '1.0.0',
    name: 'German Agreement Check',
    shortName: 'GAC',
    description: 'A browser fixture for a fully labelled imported scale.',
    introPrompt: 'Bitte beantworten Sie die Frage.',
    officialContentNotice: 'Browser regression fixture.',
    source: { label: 'AQP browser fixture' },
    scale: { type: 'agreement', minimum: 1, maximum: 5, step: 1 },
    items: [{
      id: 'item-01',
      name: 'Item 1',
      prompt: 'Ich hatte das Gefühl, nur Bilder zu sehen.',
      shortMeaning: 'Agreement with the item.',
      lowAnchor: 'trifft gar nicht zu',
      highAnchor: 'trifft völlig zu',
      responseLabels: {
        1: 'trifft gar nicht zu',
        2: 'trifft eher nicht zu',
        3: 'teils/teils',
        4: 'trifft eher zu',
        5: 'trifft völlig zu',
      },
    }],
    scoring: {
      strategy: 'mean-v1',
      scoreName: 'Mean score',
      minimum: 1,
      maximum: 5,
    },
    supports: { simplerExplanations: false, smileyLandmarks: false },
  };
  const { url } = configuredParticipant(
    definition.id,
    'E2E-LABELS-01',
    definition,
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
