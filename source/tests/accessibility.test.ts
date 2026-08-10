// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import axe from 'axe-core';
import '../src/accessible-nasa-tlx';
import '../src/study-conductor';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import type { StudyConductorApp } from '../src/study-conductor';
import { createCustomQuestionnaireDefinition } from '../src/custom-questionnaire';
import {
  DEFAULT_QUESTIONNAIRE_ID,
  buildQuestionnairePairs,
  getQuestionnaireDefinition,
} from '../src/questionnaire-definition';
import {
  buildParticipantUrl,
  createStudyConfig,
  progressStorageKey,
} from '../src/study';
import { reviewQuestionnaireExport } from '../src/platform-questionnaire-import';

async function renderComponent() {
  const component = document.createElement('accessible-nasa-tlx') as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  return component;
}

async function scan(component: AccessibleNasaTlx) {
  return axe.run(component, {
    rules: {
      'color-contrast': { enabled: false },
    },
  });
}

function checkbox(component: AccessibleNasaTlx, text: string) {
  const label = [...component.querySelectorAll<HTMLLabelElement>('label')].find((item) =>
    item.textContent?.includes(text),
  );
  return label?.querySelector<HTMLInputElement>('input');
}

async function showImportedQuestionnaireUpload(conductor: StudyConductorApp) {
  const route = [...conductor.querySelectorAll<HTMLLabelElement>('label')]
    .find((label) => label.textContent?.includes('Import a Qualtrics or LimeSurvey export'))!
    .querySelector<HTMLInputElement>('input')!;
  route.click();
  await conductor.updateComplete;
  conductor.querySelector<HTMLButtonElement>(
    '.wizard-navigation .primary-button',
  )!.click();
  await conductor.updateComplete;
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/');
});

describe('automated structural accessibility scan', () => {
  it('finds no detectable violations on the introduction', async () => {
    const component = await renderComponent();
    const result = await scan(component);
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations on a rating with configurable support active', async () => {
    const component = await renderComponent();
    component.querySelector<HTMLInputElement>('input[value="smiley"]')!.click();
    component.querySelector('.text-size-control input[value="large"]')!.dispatchEvent(
      new Event('change', { bubbles: true }),
    );
    checkbox(component, 'Save progress and show a return summary')!.click();
    await component.updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the six ratings'))!
      .click();
    await component.updateComplete;

    const result = await scan(component);
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations on the study-conductor setup page', async () => {
    const conductor = document.createElement('study-conductor-app') as StudyConductorApp;
    document.body.append(conductor);
    await conductor.updateComplete;
    const result = await axe.run(conductor, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations in the visible configuration-success state', async () => {
    const conductor = document.createElement('study-conductor-app') as StudyConductorApp;
    document.body.append(conductor);
    await conductor.updateComplete;
    (conductor as any).studyId = 'SUCCESS-01';
    (conductor as any).studyTitle = 'Success confirmation check';
    (conductor as any).taskLabel = 'checking the generated study workflow';
    (conductor as any).participantCode = 'A11Y-001';
    await conductor.updateComplete;
    [...conductor.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Generate link')!
      .click();
    await conductor.updateComplete;
    expect(conductor.querySelector('.success-confirmation')).not.toBeNull();
    const result = await axe.run(conductor, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations in the no-code custom questionnaire builder', async () => {
    const conductor = document.createElement('study-conductor-app') as StudyConductorApp;
    document.body.append(conductor);
    await conductor.updateComplete;
    [...conductor.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Add your own questionnaire')!
      .click();
    await conductor.updateComplete;
    expect(conductor.querySelector('#custom-questionnaire-builder')).not.toBeNull();
    const result = await axe.run(conductor, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations in a structured export import review', async () => {
    const conductor = document.createElement('study-conductor-app') as StudyConductorApp;
    document.body.append(conductor);
    await conductor.updateComplete;
    await showImportedQuestionnaireUpload(conductor);
    const qsf = readFileSync(
      resolve(import.meta.dirname, 'fixtures', 'qualtrics-rating.qsf'),
      'utf8',
    );
    const input = conductor.querySelector<HTMLInputElement>(
      '[data-platform-questionnaire-import]',
    )!;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [{ name: 'task-support.qsf', text: async () => qsf }],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await conductor.updateComplete;
    expect(conductor.textContent).toContain('File review ready');
    const result = await axe.run(conductor, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations in the expanded import instructions', async () => {
    const conductor = document.createElement('study-conductor-app') as StudyConductorApp;
    document.body.append(conductor);
    await conductor.updateComplete;
    await showImportedQuestionnaireUpload(conductor);

    const guide = conductor.querySelector<HTMLDetailsElement>('.platform-import-guide')!;
    guide.open = true;
    const result = await axe.run(conductor, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations in the LimeSurvey group-selection review', async () => {
    const conductor = document.createElement('study-conductor-app') as StudyConductorApp;
    document.body.append(conductor);
    await conductor.updateComplete;
    await showImportedQuestionnaireUpload(conductor);
    const lss = readFileSync(
      resolve(import.meta.dirname, 'fixtures', 'limesurvey-group-rating.lsg'),
      'utf8',
    )
      .replace(
        '<LimeSurveyDocType>Group</LimeSurveyDocType>',
        '<LimeSurveyDocType>Survey</LimeSurveyDocType>',
      )
      .replace(
        '</rows>\n </groups>',
        '<row><gid>20</gid><group_order>2</group_order><randomization_group/><grelevance>1</grelevance></row></rows>\n </groups>',
      )
      .replace(
        '</rows>\n </group_l10ns>',
        '<row><gid>20</gid><group_name>Other content</group_name><description/><language>en</language></row></rows>\n </group_l10ns>',
      );
    const input = conductor.querySelector<HTMLInputElement>(
      '[data-platform-questionnaire-import]',
    )!;
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [{ name: 'multi-group.lss', text: async () => lss }],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await conductor.updateComplete;
    expect(conductor.textContent).toContain('Choose one LimeSurvey questionnaire group');
    const result = await axe.run(conductor, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations in the configured presentation-only preference route', async () => {
    const config = createStudyConfig({
      studyId: 'A11Y-01',
      studyTitle: 'Accessibility route check',
      taskLabel: 'the test task',
      showScoreToParticipant: false,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: true,
        participantAdjustmentPolicy: 'presentation-only',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const url = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', url.pathname + url.hash);
    const component = await renderComponent();
    const result = await scan(component);
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations in the structurally different SUS introduction', async () => {
    const config = createStudyConfig({
      instrumentId: 'system-usability-scale',
      studyId: 'A11Y-SUS-01',
      studyTitle: 'SUS accessibility route check',
      taskLabel: 'using the test system',
      showScoreToParticipant: false,
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
    });
    const url = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', url.pathname + url.hash);
    const component = await renderComponent();
    expect(component.textContent).toContain('System Usability Scale');
    expect(component.textContent).not.toContain('Smiley landmarks');
    const result = await scan(component);
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations when an imported Qualtrics matrix row is rendered', async () => {
    const qsf = JSON.parse(readFileSync(
      resolve(import.meta.dirname, 'fixtures', 'qualtrics-rating.qsf'),
      'utf8',
    ));
    const matrix = qsf.SurveyElements.find(
      (element: any) => element.PrimaryAttribute === 'QID_CLARITY',
    );
    matrix.Payload.QuestionType = 'Matrix';
    matrix.Payload.Selector = 'Likert';
    matrix.Payload.SubSelector = 'SingleAnswer';
    matrix.Payload.QuestionText = 'Rate each statement.';
    matrix.Payload.Choices = {
      1: { Display: 'The instructions were clear.' },
      2: { Display: 'I felt in control.' },
    };
    matrix.Payload.ChoiceOrder = [1, 2];
    matrix.Payload.Answers = {
      1: { Display: 'Strongly disagree' },
      2: { Display: 'Disagree' },
      3: { Display: 'Neither agree nor disagree' },
      4: { Display: 'Agree' },
      5: { Display: 'Strongly agree' },
    };
    matrix.Payload.AnswerOrder = [1, 2, 3, 4, 5];
    const review = reviewQuestionnaireExport(JSON.stringify(qsf), 'matrix.qsf');
    const definition = createCustomQuestionnaireDefinition(review.draft!);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'A11Y-MATRIX-01',
      studyTitle: 'Expanded matrix accessibility check',
      taskLabel: 'using the test system',
      showScoreToParticipant: false,
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
    });
    const url = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', url.pathname + url.hash);
    const component = await renderComponent();
    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-A11Y-MATRIX';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 3 items'))!
      .click();
    await component.updateComplete;

    expect(component.querySelector('#rating-heading')?.textContent).toBe(
      'The instructions were clear.',
    );
    const result = await scan(component);
    expect(result.violations).toEqual([]);
  });

  it('finds no detectable violations in the saved-session recovery offer', async () => {
    const definition = getQuestionnaireDefinition(DEFAULT_QUESTIONNAIRE_ID)!;
    localStorage.setItem(progressStorageKey('demo-config', 'DEMO'), JSON.stringify({
      version: 4,
      instrumentId: definition.id,
      savedAt: Date.now(),
      startedAt: '2026-07-28T00:00:00.000Z',
      configId: 'demo-config',
      participantCode: 'DEMO',
      stage: 'ratings',
      ratingIndex: 1,
      pairIndex: 0,
      pairOrder: buildQuestionnairePairs(definition),
      pairResponses: {},
      ratings: { mental: 50 },
      ratingInputRoutes: { mental: 'standard-scale' },
      pairInputRoutes: {},
      supportChanges: [],
      support: {
        answerMode: 'standard',
        showSimpleLanguage: false,
        largeText: false,
        audioGuidance: false,
      },
    }));

    const component = await renderComponent();
    await component.updateComplete;
    expect(component.querySelector('#resume-saved-questionnaire')).not.toBeNull();
    const result = await scan(component);
    expect(result.violations).toEqual([]);
  });
});
