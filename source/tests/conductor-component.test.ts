// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildQualtricsEndOfSurveyMessage,
  buildQualtricsQuestionHtml,
} from '../src/study-conductor';
import {
  createCustomItemDraft,
  createCustomQuestionnaireDefinition,
  createCustomQuestionnaireDraft,
} from '../src/custom-questionnaire';
import { createStudyConfig, readStudyConfigFromHash } from '../src/study';

const scrollIntoView = vi.fn();

async function renderConductor() {
  const component = document.createElement('study-conductor-app');
  document.body.append(component);
  await (component as any).updateComplete;
  return component;
}

function inputFor(component: HTMLElement, labelText: string) {
  return [...component.querySelectorAll<HTMLLabelElement>('label')]
    .find((label) => label.textContent?.includes(labelText))!
    .querySelector<HTMLInputElement>('input')!;
}

function wizardContinue(component: HTMLElement) {
  return component.querySelector<HTMLButtonElement>(
    '.wizard-navigation .primary-button',
  )!;
}

async function chooseImportedRoute(component: HTMLElement) {
  inputFor(component, 'Import a Qualtrics or LimeSurvey export').click();
  await (component as any).updateComplete;
  wizardContinue(component).click();
  await (component as any).updateComplete;
  expect(component.textContent).toContain('Step 2 of 10');
}

async function continueWizard(component: HTMLElement) {
  wizardContinue(component).click();
  await (component as any).updateComplete;
}

function mixedLimeSurveyRatingSets() {
  let lss = readFileSync(
    resolve(import.meta.dirname, 'fixtures', 'limesurvey-current-rating.lss'),
    'utf8',
  );
  for (let index = 1; index <= 5; index += 1) {
    lss = lss.replace(
      `<qid><![CDATA[202]]></qid><code><![CDATA[A00${index}]]></code>`,
      `<qid><![CDATA[202]]></qid><code><![CDATA[${index * 10}]]></code>`,
    );
  }
  return lss;
}

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
  });
  scrollIntoView.mockClear();
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/study.html');
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, 'clipboard');
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
});

describe('study conductor defaults and guidance', () => {
  it('uses a six-step ready-made route and a guarded ten-step import route', async () => {
    const component = await renderConductor();
    expect(component.textContent).toContain('Step 1 of 6');

    inputFor(component, 'Import a Qualtrics or LimeSurvey export').click();
    await (component as any).updateComplete;
    expect(component.textContent).toContain('Step 1 of 10');
    wizardContinue(component).click();
    await (component as any).updateComplete;
    expect(component.textContent).toContain('Step 2 of 10');

    wizardContinue(component).click();
    await (component as any).updateComplete;
    expect(component.textContent).toContain('Step 2 of 10');
    expect(component.textContent).toContain(
      'Choose and review a questionnaire export before continuing.',
    );
    expect(document.activeElement?.id).toBe('conductor-error');
  });

  it('restores a setup draft after reload and supports browser step history', async () => {
    const component = await renderConductor();
    const studyId = inputFor(component, 'Study ID');
    studyId.value = 'RECOVERY-01';
    studyId.dispatchEvent(new Event('input', { bubbles: true }));
    await chooseImportedRoute(component);
    await (component as any).updateComplete;

    component.remove();
    const restored = await renderConductor();
    expect(restored.textContent).toContain('Step 2 of 10');
    expect(inputFor(restored, 'Study ID').value).toBe('RECOVERY-01');

    window.dispatchEvent(new PopStateEvent('popstate', {
      state: { aqpConductorStep: 0 },
    }));
    await (restored as any).updateComplete;
    expect(restored.textContent).toContain('Step 1 of 10');
    expect(document.activeElement?.id).toBe('conductor-step-heading');
  });

  it('separates participant identity and starts with optional participant choice for an accessibility evaluation', async () => {
    const component = await renderConductor();
    expect(component.textContent).toContain('This researcher page generates a separate participant page');
    expect(component.textContent).toContain('Current Qualtrics generator: 0.8.10-q10');
    expect(component.querySelector<HTMLAnchorElement>(
      'a[href="study.html?package=0.8.10-q10"]',
    )).not.toBeNull();
    expect(component.textContent).toContain('P-001');
    expect(inputFor(component, 'Study ID').placeholder).toBe('ACCESS-TECH-01');
    expect(inputFor(component, 'Study title').placeholder).toBe('Route-planning interface study');
    expect(inputFor(component, 'Task label').placeholder).toContain('planning a route');

    const questionnaireDefinition = component.querySelector<HTMLSelectElement>('select')!;
    expect(questionnaireDefinition.value).toBe('nasa-tlx-weighted');
    expect(questionnaireDefinition.selectedOptions[0]?.textContent).toContain(
      'NASA Task Load Index',
    );
    expect(component.querySelector('.definition-summary')?.textContent).toContain(
      'Weighted workload score',
    );
    expect(component.querySelector('.definition-summary')?.textContent).toContain(
      'Questionnaire language: en-GB',
    );
    expect(component.querySelector('.definition-summary')?.textContent?.replace(/\s+/g, ' ')).toContain(
      'Voice input uses English recognition',
    );

    const participantChoice = inputFor(component, 'Prepared defaults with optional participant choice');
    expect(participantChoice.checked).toBe(true);
  });

  it('generates a separate local participant link with prepared defaults and optional participant choice', async () => {
    const component = await renderConductor();
    const values = [
      ['Study ID', 'TLX-TECH-01'],
      ['Study title', 'Route-planning workload study'],
      ['Task label', 'planning a route from A to B using the prototype'],
      ['Pseudonymous participant code for this link', 'P-LOCAL-01'],
    ] as const;
    for (const [label, value] of values) {
      const input = inputFor(component, label);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    await (component as any).updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Generate link')!
      .click();
    await (component as any).updateComplete;

    const link = component.querySelector<HTMLTextAreaElement>('#participant-link')!.value;
    const config = readStudyConfigFromHash(new URL(link).hash);
    expect(config?.support.participantAdjustmentPolicy).toBe('participant-choice');
    expect(config?.collection.mode).toBe('local');
    expect(new URLSearchParams(new URL(link).hash.slice(1)).get('participant')).toBe('P-LOCAL-01');
    expect(config).not.toHaveProperty('participantCode');
    expect(new URL(link).pathname).toMatch(/index\.html$/);
    expect(component.textContent).toContain('Configuration ready');
    const readyPanel = component.querySelector<HTMLElement>('#configuration-ready-panel')!;
    expect(readyPanel.classList).toContain('success-confirmation');
    expect(readyPanel.textContent).toContain(
      'Participant link and configuration generated',
    );
    expect(document.activeElement).toBe(readyPanel);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'start',
      inline: 'nearest',
    });
  });

  it('lets a researcher add a validated questionnaire without editing code', async () => {
    const component = await renderConductor();
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Add your own questionnaire')!
      .click();
    await (component as any).updateComplete;

    expect(component.textContent).toContain(
      '1. Reuse an AQP questionnaire definition',
    );
    expect(component.textContent).toContain(
      '2. Build a questionnaire manually',
    );
    expect(component.textContent).toContain(
      'These routes accept different file types and are not interchangeable',
    );

    const setValue = (selector: string, value: string) => {
      const control = component.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
      control.value = value;
      control.dispatchEvent(new Event('input', { bubbles: true }));
    };
    setValue('[data-custom-field="name"]', 'Work Assistance Inventory');
    setValue('[data-custom-field="short-name"]', 'WAI');
    for (const [index, prompt] of [
      [0, 'The instructions were clear.'],
      [1, 'The task was easy.'],
    ] as const) {
      setValue(
        `[data-custom-item="${index}"][data-custom-item-field="prompt"]`,
        prompt,
      );
      setValue(
        `[data-custom-item="${index}"][data-custom-item-field="low-anchor"]`,
        'Strongly disagree',
      );
      setValue(
        `[data-custom-item="${index}"][data-custom-item-field="high-anchor"]`,
        'Strongly agree',
      );
    }
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Validate and use this questionnaire')!
      .click();
    await (component as any).updateComplete;

    const questionnaireDefinition = component.querySelector<HTMLSelectElement>(
      'label select',
    )!;
    expect(questionnaireDefinition.value).toBe('custom-wai');
    expect(questionnaireDefinition.selectedOptions[0]?.textContent).toContain(
      'researcher supplied',
    );
    expect(component.querySelector('.definition-summary')?.textContent).toContain(
      '2 items',
    );
    const selectedSummary = component.querySelector<HTMLElement>(
      '#selected-questionnaire-summary',
    )!;
    expect(selectedSummary.classList).toContain('success-confirmation');
    expect(selectedSummary.textContent).toContain('Questionnaire ready');
    expect(selectedSummary.textContent).toContain('validated and selected');
    expect(document.activeElement).toBe(selectedSummary);

    for (const [label, value] of [
      ['Study ID', 'CUSTOM-01'],
      ['Study title', 'Custom questionnaire study'],
      ['Task label', 'using the route-planning prototype'],
      ['Pseudonymous participant code for this link', 'P-CUSTOM-01'],
    ] as const) {
      const input = inputFor(component, label);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Generate link')!
      .click();
    await (component as any).updateComplete;

    const link = component.querySelector<HTMLTextAreaElement>('#participant-link')!.value;
    const config = readStudyConfigFromHash(new URL(link).hash);
    expect(config?.instrumentId).toBe('custom-wai');
    expect(config?.questionnaireDefinition?.items).toHaveLength(2);
    expect(config?.questionnaireDefinition?.scoring.strategy).toBe('mean-v1');
    expect(component.textContent).toContain(
      'full definition is embedded in the configuration',
    );
  });

  it('reveals and visibly confirms an imported questionnaire definition', async () => {
    const component = await renderConductor();
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Add your own questionnaire')!
      .click();
    await (component as any).updateComplete;

    const draft = createCustomQuestionnaireDraft();
    const definition = createCustomQuestionnaireDefinition({
      ...draft,
      name: 'Imported Confidence Check',
      shortName: 'ICC',
      items: [
        createCustomItemDraft({
          name: 'Confidence',
          prompt: 'I could complete the task.',
          lowAnchor: 'Strongly disagree',
          highAnchor: 'Strongly agree',
        }),
      ],
    });
    const fileInput = component.querySelector<HTMLInputElement>(
      '[data-custom-definition-import]',
    )!;
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [{ text: async () => JSON.stringify(definition) }],
    });

    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;

    const selectedSummary = component.querySelector<HTMLElement>(
      '#selected-questionnaire-summary',
    )!;
    expect(selectedSummary.classList).toContain('success-confirmation');
    expect(selectedSummary.textContent).toContain('Imported Confidence Check');
    expect(selectedSummary.textContent).toContain('imported, validated and selected');
    expect(document.activeElement).toBe(selectedSummary);
  });

  it('reviews and confirms a Qualtrics export before converting it', async () => {
    const component = await renderConductor();
    await chooseImportedRoute(component);

    const qsf = readFileSync(
      resolve(import.meta.dirname, 'fixtures', 'qualtrics-rating.qsf'),
      'utf8',
    );
    const fileInput = component.querySelector<HTMLInputElement>(
      '[data-platform-questionnaire-import]',
    )!;
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [{ name: 'task-support.qsf', text: async () => qsf }],
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;

    expect(component.textContent).toContain('File review ready');
    expect(component.textContent).toContain('2 compatible items');

    await continueWizard(component);
    expect(component.textContent).toContain('Step 3 of 10');
    expect(component.textContent).toContain('The instructions were clear.');
    await continueWizard(component);
    expect(component.textContent).toContain('Step 4 of 10');
    expect(component.textContent).toContain('3 = Neither agree nor disagree');
    await continueWizard(component);
    expect(component.textContent).toContain('Step 5 of 10');
    expect(component.textContent).toContain('Imported safely (2)');
    expect(component.textContent).toContain('Requires confirmation');
    expect(component.textContent).toContain('Unsupported content (0)');
    component.querySelector<HTMLInputElement>(
      '[data-platform-import-warnings-confirm]',
    )!.click();
    await continueWizard(component);
    expect(component.textContent).toContain('Step 6 of 10');

    const reverse = component.querySelector<HTMLInputElement>(
      '[data-platform-import-reverse="1"]',
    )!;
    reverse.click();
    const confirmation = component.querySelector<HTMLInputElement>(
      '[data-platform-import-confirm]',
    )!;
    confirmation.click();
    await (component as any).updateComplete;
    await continueWizard(component);
    expect(component.textContent).toContain('Step 7 of 10');

    const summary = component.querySelector<HTMLElement>('#selected-questionnaire-summary')!;
    expect(summary.textContent).toContain('Task Support Check');
    expect(summary.textContent).toContain('imported, validated and selected');
    expect(document.activeElement?.id).toBe('conductor-step-heading');
    const definition = (component as any).customDefinition;
    expect(definition.items[0].responseLabels['3']).toBe(
      'Neither agree nor disagree',
    );
    expect(definition.scoring.reverseItemIds).toEqual(['item-02']);
  });

  it('asks for one group before reviewing a multi-group LimeSurvey survey', async () => {
    const component = await renderConductor();
    await chooseImportedRoute(component);

    const lss = readFileSync(
      resolve(import.meta.dirname, 'fixtures', 'limesurvey-group-rating.lsg'),
      'utf8',
    )
      .replace('<LimeSurveyDocType>Group</LimeSurveyDocType>', '<LimeSurveyDocType>Survey</LimeSurveyDocType>')
      .replace(
        '</rows>\n </groups>',
        '<row><gid>20</gid><group_order>2</group_order><randomization_group/><grelevance>1</grelevance></row></rows>\n </groups>',
      )
      .replace(
        '</rows>\n </group_l10ns>',
        '<row><gid>20</gid><group_name>Other content</group_name><description/><language>en</language></row></rows>\n </group_l10ns>',
      );
    const fileInput = component.querySelector<HTMLInputElement>(
      '[data-platform-questionnaire-import]',
    )!;
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [{ name: 'multi-group.lss', text: async () => lss }],
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;

    let review = component.querySelector<HTMLElement>('#platform-import-review')!;
    expect(review.textContent).toContain('Choose one LimeSurvey questionnaire group');
    expect(review.textContent).toContain('Task support');
    expect(review.textContent).toContain('Other content');
    const group = component.querySelector<HTMLSelectElement>(
      '[data-platform-import-group]',
    )!;
    group.value = '10';
    group.dispatchEvent(new Event('change', { bubbles: true }));
    await (component as any).updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Review selected group')!
      .click();
    await (component as any).updateComplete;

    expect(component.textContent).toContain('File review ready');
    expect(component.textContent).toContain('2 compatible items');
    await continueWizard(component);
    await continueWizard(component);
    await continueWizard(component);
    expect(component.textContent).toContain('Only “Task support” will be converted');
    expect(component.textContent).toContain('Blank scale positions');
  });

  it('reviews a LimeSurvey LSQ as one standalone question', async () => {
    const component = await renderConductor();
    await chooseImportedRoute(component);

    const lsq = readFileSync(
      resolve(import.meta.dirname, 'fixtures', 'limesurvey-question-rating.lsq'),
      'utf8',
    );
    const fileInput = component.querySelector<HTMLInputElement>(
      '[data-platform-questionnaire-import]',
    )!;
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [{ name: 'clarity.lsq', text: async () => lsq }],
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;

    expect(component.textContent).toContain('File review ready');
    expect(component.textContent).toContain('LimeSurvey LSQ');
    expect(component.textContent).toContain('1 compatible item');
    await continueWizard(component);
    await continueWizard(component);
    await continueWizard(component);
    expect(component.textContent).toContain('standalone questionnaire');
    expect(component.textContent).toContain('Unsupported content (0)');
  });

  it('exposes every supported native import format with linked instructions', async () => {
    const component = await renderConductor();
    await chooseImportedRoute(component);

    const source = component.querySelector<HTMLSelectElement>(
      '[data-platform-import-source]',
    )!;
    expect([...source.options].map((option) => option.value)).toEqual([
      'auto',
      'qualtrics-qsf',
      'limesurvey-lss',
      'limesurvey-lsg',
      'limesurvey-lsq',
    ]);
    expect(source.getAttribute('aria-describedby')).toBe('platform-import-source-hint');

    const file = component.querySelector<HTMLInputElement>(
      '[data-platform-questionnaire-import]',
    )!;
    expect(file.accept).toContain('.qsf');
    expect(file.accept).toContain('.lss');
    expect(file.accept).toContain('.lsg');
    expect(file.accept).toContain('.lsq');
    expect(file.getAttribute('aria-describedby')).toBe('platform-import-file-hint');
  });

  it('asks for one compatible rating set and then reviews only that set', async () => {
    const component = await renderConductor();
    await chooseImportedRoute(component);

    const fileInput = component.querySelector<HTMLInputElement>(
      '[data-platform-questionnaire-import]',
    )!;
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [{
        name: 'mixed-rating-sets.lss',
        text: async () => mixedLimeSurveyRatingSets(),
      }],
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;

    let review = component.querySelector<HTMLElement>('#platform-import-review')!;
    expect(review.textContent).toContain('Choose one compatible rating set');
    expect(review.textContent).toContain('values 1, 2, 3, 4, 5');
    expect(review.textContent).toContain('values 10, 20, 30, 40, 50');
    expect(document.activeElement).toBe(review);

    const ratingSet = component.querySelector<HTMLSelectElement>(
      '[data-platform-import-rating-set]',
    )!;
    ratingSet.value = 'values-1-2-3-4-5';
    ratingSet.dispatchEvent(new Event('change', { bubbles: true }));
    await (component as any).updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Review selected rating set')!
      .click();
    await (component as any).updateComplete;

    expect(component.textContent).toContain('File review ready');
    expect(component.textContent).toContain('1 compatible item');
    await continueWizard(component);
    await continueWizard(component);
    await continueWizard(component);
    expect(component.textContent).toContain('Only the 1–5 rating set will be converted');
    expect(component.textContent).toContain('CONTROL [type L]');
  });

  it('shows unsupported exported content and does not offer partial conversion', async () => {
    const component = await renderConductor();
    await chooseImportedRoute(component);

    const qsf = JSON.parse(readFileSync(
      resolve(import.meta.dirname, 'fixtures', 'qualtrics-rating.qsf'),
      'utf8',
    ));
    qsf.SurveyElements.find(
      (element: any) => element.PrimaryAttribute === 'QID_CONTROL',
    ).Payload.Selector = 'MAVR';
    const fileInput = component.querySelector<HTMLInputElement>(
      '[data-platform-questionnaire-import]',
    )!;
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [{
        name: 'unsupported.qsf',
        text: async () => JSON.stringify(qsf),
      }],
    });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;

    const review = component.querySelector<HTMLElement>('#platform-import-review')!;
    expect(review.textContent).toContain('Conversion blocked');
    expect(review.textContent).toContain('Unsupported content (1)');
    expect(review.textContent).toContain('MAVR');
    expect(component.textContent).toContain('has not created a partial questionnaire');
    expect([...component.querySelectorAll<HTMLButtonElement>('button')]
      .some((button) =>
        button.textContent?.trim() === 'Convert and use this questionnaire')).toBe(false);
  });

  it('reveals and visibly confirms an imported study configuration', async () => {
    const component = await renderConductor();
    const config = createStudyConfig({
      studyId: 'IMPORT-01',
      studyTitle: 'Imported study',
      taskLabel: 'testing the questionnaire workflow',
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
    const fileInput = component.querySelector<HTMLInputElement>(
      '[data-configuration-import]',
    )!;
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [{ text: async () => JSON.stringify(config) }],
    });

    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;

    const readyPanel = component.querySelector<HTMLElement>('#configuration-ready-panel')!;
    expect(readyPanel.classList).toContain('success-confirmation');
    expect(readyPanel.textContent).toContain('Configuration imported');
    expect(readyPanel.textContent).toContain(config.configId);
    expect(readyPanel.textContent).toContain('No participant link is available');
    expect(component.querySelector('#participant-link')).toBeNull();
    expect(document.activeElement).toBe(readyPanel);
  });

  it('generates an origin-bound Qualtrics iframe configuration without placing an account token in the link', async () => {
    const component = await renderConductor();
    inputFor(component, 'UCL Qualtrics central collection').click();
    await (component as any).updateComplete;

    const qualtricsUrl = component.querySelector<HTMLInputElement>('input[placeholder*="qualtrics.com"]')!;
    qualtricsUrl.value = 'https://ucl-example.eu.qualtrics.com/jfe/form/SV_TEST';
    qualtricsUrl.dispatchEvent(new Event('input', { bubbles: true }));
    const values = [
      ['Study ID', 'TLX-REMOTE-01'],
      ['Study title', 'Remote workload study'],
      ['Task label', 'completing the route-planning task'],
      ['Pseudonymous participant code for this link', 'P-REMOTE-01'],
    ] as const;
    for (const [label, value] of values) {
      const input = inputFor(component, label);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Generate link')!
      .click();
    await (component as any).updateComplete;

    const participantUrl = component.querySelector<HTMLTextAreaElement>('#participant-link')!.value;
    const config = readStudyConfigFromHash(new URL(participantUrl).hash);
    expect(config?.collection).toEqual({
      mode: 'qualtrics',
      parentOrigin: 'https://ucl-example.eu.qualtrics.com',
    });
    expect(participantUrl).not.toContain('SV_TEST');
    const setupAssets = [
      ...component.querySelectorAll<HTMLTextAreaElement>('[data-qualtrics-asset]'),
    ];
    expect(setupAssets).toHaveLength(4);
    const questionHtml = component.querySelector<HTMLTextAreaElement>('[data-qualtrics-asset="question-html"]')!.value;
    expect(questionHtml).toContain('id="accessible-questionnaire-frame"');
    expect(questionHtml).toContain('id="accessible-questionnaire-recorded-summary"');
    expect(questionHtml).toContain('style="display:none"');
    expect(questionHtml).toContain('data-recorded="${e://Field/__js_AQP_ACCEPTED}"');
    expect(questionHtml).toContain(
      '#accessible-questionnaire-recorded-summary[data-recorded="1"] + #accessible-questionnaire-live-question',
    );
    expect(questionHtml).toContain('${e://Field/__js_AQP_PARTICIPANT_CODE}');
    expect(questionHtml).toContain('${e://Field/__js_AQP_PRIMARY_SCORE}');
    expect(questionHtml).toContain(participantUrl.replace(/&/g, '&amp;'));
    expect(questionHtml).not.toContain('PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE');
    expect(questionHtml).toContain('data-aqp-package-build="0.8.10-q10"');
    expect(questionHtml).toBe(buildQualtricsQuestionHtml(participantUrl));
    expect(questionHtml).toBe(
      readFileSync(
        resolve(process.cwd(), '../integrations/qualtrics/question-html-template.html'),
        'utf8',
      )
        .trim()
        .replace('PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE', participantUrl.replace(/&/g, '&amp;')),
    );
    const embeddedFields = component.querySelector<HTMLTextAreaElement>(
      '[data-qualtrics-asset="embedded-data"]',
    )!.value;
    expect(embeddedFields.trim().split(/\r?\n/)).toHaveLength(63);
    expect(embeddedFields).toContain('__js_AQP_ACCEPTED');
    expect(component.querySelector<HTMLTextAreaElement>(
      '[data-qualtrics-asset="question-javascript"]',
    )!.value).toContain('Qualtrics.SurveyEngine.addOnReady');
    expect(component.querySelector<HTMLTextAreaElement>(
      '[data-qualtrics-asset="end-message"]',
    )!.value).toContain('Questionnaire complete');
    expect(component.textContent).toContain('Do not upload these repository files to Qualtrics');
    expect(component.textContent).toContain('Copy complete question HTML');
    expect(component.textContent).toContain('Copy Embedded Data field list');
    expect(component.textContent).toContain('Copy complete question JavaScript');
    expect(component.textContent).toContain('Copy End of Survey message');
    expect(component.textContent).toContain(
      'The first three blocks below are the required installation inputs',
    );
    expect(component.textContent).toContain(
      'An anonymous distribution link still records IP address',
    );
    expect(component.querySelector<HTMLAnchorElement>(
      'a[href*="qualtrics.com/support"][href*="AnonymizeResponses"]',
    )).not.toBeNull();
    expect(component.textContent).toContain('Optional: End of Survey plain-text message');
    expect(component.textContent).toContain('not required for data collection');
    expect(component.textContent).toContain("Qualtrics' default End of Survey page is acceptable");
    expect(component.textContent).toContain('Qualtrics bridge 0.8.10-q10');
    expect(component.textContent).toContain('__js_AQP_ACCEPTED = 1');
    expect(component.textContent).toContain('participant application must fill the browser viewport');

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Copy complete question HTML')!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;
    expect(writeText).toHaveBeenCalledWith(questionHtml);
    expect(component.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'Question HTML copied.',
    );

    const participantCode = inputFor(component, 'Pseudonymous participant code for this link');
    participantCode.value = '';
    participantCode.dispatchEvent(new Event('input', { bubbles: true }));
    await (component as any).updateComplete;
    expect(component.querySelector('#configuration-ready-panel')).not.toBeNull();
    expect(component.querySelector('#participant-link')).toBeNull();
    expect(component.textContent).toContain('No participant link is available');

    participantCode.value = 'P-REMOTE-02';
    participantCode.dispatchEvent(new Event('input', { bubbles: true }));
    await (component as any).updateComplete;
    expect(component.querySelector<HTMLTextAreaElement>('#participant-link')?.value)
      .toContain('participant=P-REMOTE-02');
  });

  it('refuses to build Qualtrics question HTML without a generated participant URL', () => {
    expect(() => buildQualtricsQuestionHtml('')).toThrow(/generated participant URL/i);
    expect(() =>
      buildQualtricsQuestionHtml('PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE'),
    ).toThrow(/generated participant URL/i);
  });

  it('keeps the persistent Qualtrics completion message aligned with score-display policy', () => {
    const hidden = buildQualtricsEndOfSurveyMessage(false);
    expect(hidden).toContain('Your questionnaire responses have been recorded successfully.');
    expect(hidden).not.toContain('__js_AQP_PRIMARY_SCORE');
    expect(hidden).not.toContain('{{OPTIONAL_SCORE_BLOCK}}');

    const shown = buildQualtricsEndOfSurveyMessage(true);
    expect(shown).toContain('${e://Field/__js_AQP_INSTRUMENT_NAME}');
    expect(shown).toContain('${e://Field/__js_AQP_SCORE_NAME}');
    expect(shown).toContain('${e://Field/__js_AQP_PRIMARY_SCORE}');
    expect(shown).not.toContain('{{OPTIONAL_SCORE_BLOCK}}');
  });

  it('identifies a result export as the wrong file type and moves focus to the import error', async () => {
    const component = await renderConductor();
    const fileInput = component.querySelector<HTMLInputElement>('input[type="file"]')!;
    const resultExport = {
      schemaVersion: 2,
      study: { studyId: 'TLX-TECH-01' },
      responses: { ratings: {} },
      result: { weightedScore: 50 },
    };
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [{ text: async () => JSON.stringify(resultExport) }],
    });

    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await (component as any).updateComplete;

    expect(component.querySelector('#conductor-error')?.textContent).toContain('completed result file');
    expect(document.activeElement).toBe(component.querySelector('#conductor-error'));
  });
});
