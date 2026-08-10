// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../src/accessible-nasa-tlx';
import '../src/study-conductor';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import type { StudyConductorApp } from '../src/study-conductor';
import {
  createCustomItemDraft,
  createCustomQuestionnaireDefinition,
  createCustomQuestionnaireDraft,
} from '../src/custom-questionnaire';
import {
  buildParticipantUrl,
  createStudyConfig,
  loadCompletedResults,
  progressStorageKey,
  readStudyConfigFromHash,
  resultsToCsv,
  type StudyResultRecord,
} from '../src/study';
import { reviewQuestionnaireExport } from '../src/platform-questionnaire-import';
import { getQuestionnaireDefinition } from '../src/questionnaire-definition';
import { scoreQuestionnaire } from '../src/scoring';

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/index.html');
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  sessionStorage.clear();
  delete window.webkitSpeechRecognition;
  delete window.SpeechRecognition;
  delete window.SpeechRecognitionPhrase;
  window.history.replaceState({}, '', '/');
});

describe('instrument-independent questionnaire workflow', () => {
  it('suppresses only duplicated German endpoint labels and preserves middle labels', async () => {
    const draft = createCustomQuestionnaireDraft();
    draft.language = 'de';
    draft.name = 'German agreement check';
    draft.shortName = 'GAC';
    draft.items = [createCustomItemDraft({
      name: 'Item 1',
      prompt: 'Ich hatte das Gefühl, nur Bilder zu sehen.',
      lowAnchor: 'trifft gar nicht zu',
      highAnchor: 'trifft völlig zu',
      responseLabels: {
        1: 'trifft gar nicht zu',
        2: 'trifft eher nicht zu',
        3: 'teils/teils',
        4: 'trifft eher zu',
        5: 'trifft völlig zu',
      },
    })];
    const definition = createCustomQuestionnaireDefinition(draft);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'GERMAN-ENDPOINT-01',
      studyTitle: 'German endpoint regression',
      taskLabel: 'using the test interface',
      showScoreToParticipant: false,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: false,
        participantAdjustmentPolicy: 'locked',
        voiceInputAvailable: false,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config, 'P-DE-01'));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 1 item'))!
      .click();
    await component.updateComplete;

    const fieldset = component.querySelector('.rating-fieldset')!;
    const anchors = fieldset.querySelector('.rating-anchors')!;
    expect(anchors.getAttribute('aria-hidden')).toBe('true');
    expect(fieldset.querySelector('legend')?.textContent).toContain('trifft gar nicht zu');
    expect(anchors.textContent).toContain('trifft gar nicht zu');
    expect(
      [...fieldset.querySelectorAll('.rating-option small')].map((label) => label.textContent?.trim()),
    ).toEqual(['trifft eher nicht zu', 'teils/teils', 'trifft eher zu']);
    expect(fieldset.querySelector<HTMLInputElement>('input[value="1"]')?.getAttribute('aria-label'))
      .toContain('trifft gar nicht zu');
    expect(fieldset.textContent?.match(/trifft gar nicht zu/g)).toHaveLength(2);
    expect(fieldset.textContent?.match(/teils\/teils/g)).toHaveLength(1);
  });

  it('runs a researcher-supplied definition through the same participant, result and recovery model', async () => {
    const draft = createCustomQuestionnaireDraft();
    draft.name = 'Work Assistance Inventory';
    draft.shortName = 'WAI';
    draft.items = [
      createCustomItemDraft({
        name: 'Clarity',
        prompt: 'The instructions were clear.',
        lowAnchor: 'Strongly disagree',
        highAnchor: 'Strongly agree',
      }),
      createCustomItemDraft({
        name: 'Difficulty',
        prompt: 'The task was difficult.',
        lowAnchor: 'Strongly disagree',
        highAnchor: 'Strongly agree',
        reverseScored: true,
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'CUSTOM-PLATFORM-01',
      studyTitle: 'Custom questionnaire evaluation',
      taskLabel: 'using the route-planning system',
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
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    let completed: StudyResultRecord | null = null;
    component.addEventListener('questionnaire-complete', (event) => {
      completed = (event as CustomEvent<StudyResultRecord>).detail;
    });
    document.body.append(component);
    await component.updateComplete;

    expect(component.querySelector('h1')?.textContent).toBe('Work Assistance Inventory');
    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-CUSTOM-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 2 items'))!
      .click();
    await component.updateComplete;

    for (const value of ['5', '1']) {
      component.querySelector<HTMLInputElement>(
        `.rating-option input[value="${value}"]`,
      )!.click();
      await component.updateComplete;
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) =>
          button.textContent?.includes(value === '1' ? 'Review responses' : 'Next question'))!
        .click();
      await component.updateComplete;
    }
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit responses'))!
      .click();
    await component.updateComplete;

    expect(completed).not.toBeNull();
    expect((completed as unknown as StudyResultRecord).instrument.id).toBe('custom-wai');
    expect((completed as unknown as StudyResultRecord).instrument.definition).toEqual(
      definition,
    );
    expect((completed as unknown as StudyResultRecord).result.primaryScore).toBe(5);
    expect(component.textContent).toContain('Questionnaire score');
    expect(component.textContent).toContain('5.00');
  });

  it('uses one English voice control and accepts a complete visible English answer label', async () => {
    const draft = createCustomQuestionnaireDraft();
    draft.language = 'en-GB';
    draft.name = 'Task Support Check';
    draft.shortName = 'TSC';
    draft.items = [
      createCustomItemDraft({
        name: 'clarity',
        prompt: 'The task instructions were clear.',
        lowAnchor: 'Strongly disagree',
        highAnchor: 'Strongly agree',
        responseLabels: {
          1: 'Strongly disagree',
          2: 'Disagree',
          3: 'Neither agree nor disagree',
          4: 'Agree',
          5: 'Strongly agree',
        },
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'IMPORTED-EN-VOICE-01',
      studyTitle: 'Imported English questionnaire',
      taskLabel: 'using the prototype',
      showScoreToParticipant: false,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: false,
        participantAdjustmentPolicy: 'participant-choice',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

    let alternatives = ['Strongly agree'];
    class FakePhrase {
      constructor(public phrase: string, public boost = 1) {}
    }
    window.SpeechRecognitionPhrase = FakePhrase as any;
    class FakeRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      phrases: FakePhrase[] = [];
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        expect(this.lang).toBe('en-GB');
        expect(this.phrases.some(({ phrase, boost }) =>
          phrase === 'Strongly agree' && boost === 4)).toBe(true);
        expect(this.phrases.some(({ phrase }) => phrase === 'number four')).toBe(true);
        const result = Object.assign(
          alternatives.map((transcript) => ({ transcript })),
          { length: alternatives.length },
        );
        this.onresult?.({
          results: {
            0: result,
            length: 1,
          },
        });
      }
      stop() {}
    }
    window.webkitSpeechRecognition = FakeRecognition as any;

    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;
    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-EN-VOICE-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 1 item'))!
      .click();
    await component.updateComplete;

    expect(component.querySelectorAll('[data-voice-start]')).toHaveLength(1);
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    expect(component.querySelector('.voice-confirmation')?.textContent).toContain(
      'Strongly agree, value 5, for clarity',
    );
    component.querySelector<HTMLButtonElement>('[data-voice-confirm]')!.click();
    await component.updateComplete;
    expect(component.querySelector<HTMLInputElement>('input[value="5"]')?.checked).toBe(true);

    alternatives = ['4', 'Note 4'];
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    expect(component.querySelector('.voice-confirmation')).toBeNull();
    expect(component.textContent).toContain('No answer was selected');
    expect(component.querySelector('[role="status"]')?.textContent).toContain('I heard “Note 4”');
    expect(component.querySelector<HTMLInputElement>('input[value="5"]')?.checked).toBe(true);
    expect(component.querySelector<HTMLInputElement>('input[value="4"]')?.checked).toBe(false);

    alternatives = ['strong degree'];
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    expect(component.querySelector('.voice-confirmation')).toBeNull();
    expect(component.querySelector('[role="status"]')?.textContent).toContain(
      'I heard “strong degree”',
    );
  });

  it('retries once without contextual hints when the browser rejects the experimental phrase API', async () => {
    const draft = createCustomQuestionnaireDraft();
    draft.language = 'en-GB';
    draft.name = 'Task Support Check';
    draft.shortName = 'TSC';
    draft.items = [createCustomItemDraft({
      name: 'clarity',
      prompt: 'The task instructions were clear.',
      lowAnchor: 'Strongly disagree',
      highAnchor: 'Strongly agree',
      responseLabels: {
        1: 'Strongly disagree',
        2: 'Disagree',
        3: 'Neither agree nor disagree',
        4: 'Agree',
        5: 'Strongly agree',
      },
    })];
    const definition = createCustomQuestionnaireDefinition(draft);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'VOICE-HINT-FALLBACK-01',
      studyTitle: 'Voice hint fallback',
      taskLabel: 'using the prototype',
      showScoreToParticipant: false,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: false,
        participantAdjustmentPolicy: 'participant-choice',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

    class FakePhrase {
      constructor(public phrase: string, public boost = 1) {}
    }
    window.SpeechRecognitionPhrase = FakePhrase as any;
    const recognitions: FakeRecognition[] = [];
    class FakeRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      phrases: FakePhrase[] = [];
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      constructor() {
        recognitions.push(this);
      }
      start() {
        // The test dispatches browser events after start() to preserve their
        // asynchronous ordering and exercise stale callbacks explicitly.
      }
      stop() {}
    }
    window.webkitSpeechRecognition = FakeRecognition as any;

    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;
    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-HINT-FALLBACK-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 1 item'))!
      .click();
    await component.updateComplete;

    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    expect(recognitions).toHaveLength(1);
    const phraseAttempt = recognitions[0];
    const staleEnd = phraseAttempt.onend!;
    await Promise.resolve();
    phraseAttempt.onerror?.({ error: 'phrases-not-supported' });
    await component.updateComplete;
    expect(recognitions).toHaveLength(2);
    const ordinaryAttempt = recognitions[1];
    expect(ordinaryAttempt.phrases).toHaveLength(0);

    // A browser may deliver an already-queued end callback from the rejected
    // recogniser after the ordinary fallback has started. It must not replace
    // the second attempt's listening state or result handler.
    staleEnd();
    ordinaryAttempt.onresult?.({
      results: {
        0: Object.assign([{ transcript: 'number four' }], { length: 1 }),
        length: 1,
      },
    });
    await component.updateComplete;
    expect(component.textContent).not.toContain('phrases-not-supported');
    expect(component.querySelector('.voice-confirmation')?.textContent).toContain(
      'Agree, value 4, for clarity',
    );
    component.querySelector<HTMLButtonElement>('[data-voice-confirm]')!.click();
    await component.updateComplete;
    expect(component.querySelector<HTMLInputElement>('input[value="4"]')?.checked).toBe(true);

    // A new user attempt may try contextual hints again. If its ordinary
    // fallback also reports the same browser error, stop after two instances,
    // keep the existing answer and never expose the internal error code.
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    expect(recognitions).toHaveLength(3);
    recognitions[2].onerror?.({ error: 'phrases-not-supported' });
    expect(recognitions).toHaveLength(4);
    recognitions[3].onerror?.({ error: 'phrases-not-supported' });
    await component.updateComplete;
    expect(recognitions).toHaveLength(4);
    expect(component.textContent).not.toContain('phrases-not-supported');
    expect(component.textContent).toContain('Voice input is unavailable in this browser');
    expect(component.querySelector<HTMLInputElement>('input[value="4"]')?.checked).toBe(true);
  });

  it('rejects non-English labels but keeps one English numeric route for an imported questionnaire', async () => {
    const draft = createCustomQuestionnaireDraft();
    draft.language = 'de';
    draft.name = 'Realismus';
    draft.shortName = 'REAL';
    draft.items = [createCustomItemDraft({
      name: 'real2',
      prompt: 'Die Umgebung entsprach einer echten Einsatzstelle.',
      lowAnchor: 'Stimme überhaupt nicht zu',
      highAnchor: 'Stimme vollkommen zu',
      responseLabels: {
        1: 'Stimme überhaupt nicht zu',
        2: '2',
        3: '3',
        4: '4',
        5: 'Stimme vollkommen zu',
      },
    })];
    const definition = createCustomQuestionnaireDefinition(draft);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'IMPORTED-DE-NUMBER-01',
      studyTitle: 'Imported German questionnaire',
      taskLabel: 'using the prototype',
      showScoreToParticipant: false,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: false,
        participantAdjustmentPolicy: 'participant-choice',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

    let transcript = 'Stimme vollkommen zu';
    class FakeRecognition {
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        expect(this.lang).toBe('en-GB');
        this.onresult?.({ results: { 0: { 0: { transcript }, length: 1 }, length: 1 } });
      }
      stop() {}
    }
    window.webkitSpeechRecognition = FakeRecognition as any;

    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;
    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-DE-NUMBER-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 1 item'))!
      .click();
    await component.updateComplete;

    expect(component.querySelectorAll('[data-voice-start]')).toHaveLength(1);
    expect(component.querySelector('.voice-input-content > p')?.textContent).not.toContain('answer label');
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    expect(component.querySelector('.voice-confirmation')).toBeNull();
    expect(component.querySelector('[role="status"]')?.textContent).toContain('No answer was selected');
    expect(component.textContent).not.toContain('Voice answer not accepted');

    transcript = 'five';
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    expect(component.querySelector('.voice-confirmation')?.textContent).toContain(
      'Stimme vollkommen zu, value 5, for real2',
    );
  });

  it('runs an imported QSF definition through participant completion and result export', async () => {
    const qsf = readFileSync(
      resolve(import.meta.dirname, 'fixtures', 'qualtrics-rating.qsf'),
      'utf8',
    );
    const review = reviewQuestionnaireExport(qsf, 'task-support.qsf');
    const definition = createCustomQuestionnaireDefinition(review.draft!);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'QSF-IMPORT-01',
      studyTitle: 'Imported questionnaire evaluation',
      taskLabel: 'using the route-planning system',
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
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);
    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;

    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-QSF-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 2 items'))!
      .click();
    await component.updateComplete;
    expect(component.textContent).toContain('Neither agree nor disagree');

    for (const [index, value] of ['4', '2'].entries()) {
      component.querySelector<HTMLInputElement>(
        `.rating-option input[value="${value}"]`,
      )!.click();
      await component.updateComplete;
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes(
          index === 1 ? 'Review responses' : 'Next question',
        ))!
        .click();
      await component.updateComplete;
    }
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit responses'))!
      .click();
    await component.updateComplete;

    const records = loadCompletedResults();
    expect(records).toHaveLength(1);
    expect(records[0].instrument.definition).toEqual(definition);
    expect(records[0].result.primaryScore).toBe(3);
    const csv = resultsToCsv(records);
    expect(csv).toContain('custom-tsc');
    expect(csv).toContain('P-QSF-01');
    expect(csv).toContain('Strongly agree');
  });

  it('renders expanded Qualtrics matrix rows as accessible sequential items and completes scoring', async () => {
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
      2: { Display: 'I felt in control.' },
      1: { Display: 'The instructions were clear.' },
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
    expect(review.confirmations.map(({ code }) => code)).toContain(
      'qualtrics-matrix-expanded',
    );
    const definition = createCustomQuestionnaireDefinition(review.draft!);
    const config = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'QSF-MATRIX-01',
      studyTitle: 'Expanded matrix evaluation',
      taskLabel: 'using the route-planning system',
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
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);
    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;

    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-MATRIX-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 3 items'))!
      .click();
    await component.updateComplete;

    expect(component.querySelector('.step-label')?.textContent).toContain('Rating 1 of 3');
    expect(component.querySelector('#rating-heading')?.textContent).toBe(
      'The instructions were clear.',
    );
    expect(component.querySelector('.rating-fieldset')).not.toBeNull();
    expect(component.querySelector('.rating-fieldset legend')?.textContent).toContain(
      'Choose one answer',
    );
    expect(component.querySelector('.rating-anchors')?.getAttribute('aria-hidden')).toBe('true');
    expect(component.querySelector('.fully-labelled-rating-grid')).not.toBeNull();
    expect(component.querySelector('.rating-fieldset')?.textContent?.match(/Strongly disagree/g))
      .toHaveLength(2);
    expect(component.querySelector('.rating-option input[value="1"]')
      ?.closest('.rating-option')?.querySelector('small')).toBeNull();
    expect(component.querySelector('.rating-option input[value="3"]')
      ?.closest('.rating-option')?.querySelector('small')?.textContent).toBe(
        'Neither agree nor disagree',
      );
    expect(component.querySelectorAll<HTMLInputElement>('.rating-option input')).toHaveLength(5);
    expect(
      component.querySelector<HTMLInputElement>('.rating-option input[value="5"]')
        ?.getAttribute('aria-label'),
    ).toBe('5, Strongly agree, for The instructions were clear.');

    for (const [index, value] of ['5', '4', '3'].entries()) {
      component.querySelector<HTMLInputElement>(
        `.rating-option input[value="${value}"]`,
      )!.click();
      await component.updateComplete;
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes(
          index === 2 ? 'Review responses' : 'Next question',
        ))!
        .click();
      await component.updateComplete;
      if (index === 0) {
        expect(component.querySelector('.step-label')?.textContent).toContain('Rating 2 of 3');
        expect(component.querySelector('#rating-heading')?.textContent).toBe('I felt in control.');
      }
    }

    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit responses'))!
      .click();
    await component.updateComplete;

    const [record] = loadCompletedResults();
    expect(record.instrument.definition?.items.map(({ name }) => name)).toEqual([
      'The instructions were clear.',
      'I felt in control.',
      'CONTROL',
    ]);
    expect(record.result.primaryScore).toBe(4);
  });

  it('runs SUS through the same participant component without NASA comparison logic', async () => {
    const config = createStudyConfig({
      instrumentId: 'system-usability-scale',
      studyId: 'SUS-PLATFORM-01',
      studyTitle: 'System evaluation',
      taskLabel: 'using the route-planning system',
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
    });
    const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
    window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

    const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
    let completed: StudyResultRecord | null = null;
    component.addEventListener('questionnaire-complete', (event) => {
      completed = (event as CustomEvent<StudyResultRecord>).detail;
    });
    document.body.append(component);
    await component.updateComplete;

    expect(component.querySelector('h1')?.textContent).toBe('System Usability Scale');
    expect(component.textContent).not.toContain('Smiley landmarks');
    expect(component.textContent).toContain('no reworded item support');

    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-SUS-01';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the 10 items'))!
      .click();
    await component.updateComplete;

    expect(
      component.querySelector<HTMLInputElement>('.rating-option input[value="1"]')
        ?.getAttribute('aria-label'),
    ).toBe('1, Strongly disagree, for Item 1');
    expect(
      component.querySelector<HTMLInputElement>('.rating-option input[value="3"]')
        ?.getAttribute('aria-label'),
    ).toBe('3 for Item 1');
    expect(
      component.querySelector<HTMLInputElement>('.rating-option input[value="5"]')
        ?.getAttribute('aria-label'),
    ).toBe('5, Strongly agree, for Item 1');
    expect(component.querySelector('.rating-fieldset legend')?.textContent).toContain(
      'Choose one answer',
    );
    expect(component.querySelector('.rating-fieldset')?.textContent?.match(/Strongly disagree/g))
      .toHaveLength(2);
    expect(component.textContent).toContain('exact visible endpoint label');
    expect(component.textContent).not.toContain('Neutral');

    for (let index = 0; index < 10; index += 1) {
      const expectedValue = index % 2 === 0 ? '5' : '1';
      const options = component.querySelectorAll<HTMLInputElement>('.rating-option input');
      expect(options).toHaveLength(5);
      component.querySelector<HTMLInputElement>(`.rating-option input[value="${expectedValue}"]`)!.click();
      await component.updateComplete;
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes(index === 9 ? 'Review responses' : 'Next question'))!
        .click();
      await component.updateComplete;
    }

    expect(component.querySelector('.choice-fieldset')).toBeNull();
    expect(component.textContent).not.toContain('Pairwise comparisons');
    const reviewCards = component.querySelectorAll<HTMLElement>('.review-rating-card');
    expect(reviewCards).toHaveLength(10);
    expect(reviewCards[0].getAttribute('role')).toBe('group');
    expect(reviewCards[0].getAttribute('aria-labelledby')).toBe('review-item-label-1');
    expect(reviewCards[0].getAttribute('aria-describedby')).toBe('review-item-answer-1');
    expect(reviewCards[0].textContent).toContain(
      'I think that I would like to use this system frequently.',
    );
    expect(reviewCards[0].textContent).toContain('Selected answer: 5 — Strongly agree');

    const changeButtons = [...component.querySelectorAll<HTMLButtonElement>(
      '.review-rating-card button[data-gaze-target]',
    )];
    expect(changeButtons).toHaveLength(10);
    changeButtons.forEach((button, index) => {
      const visibleLabel = `Change item ${index + 1} answer`;
      expect(button.textContent?.trim()).toBe(visibleLabel);
      expect(button.getAttribute('aria-label')).toMatch(new RegExp(`^${visibleLabel}\\.`));
      expect(button.getAttribute('data-gaze-label')).toBe(visibleLabel);
    });

    const progressKey = progressStorageKey(config.configId, 'P-SUS-01');
    const savedBeforeEdit = JSON.parse(localStorage.getItem(progressKey)!) as {
      stage: string;
      ratings: Record<string, number>;
      ratingInputRoutes: Record<string, string>;
    };
    expect(savedBeforeEdit.stage).toBe('review');
    expect(savedBeforeEdit.ratings.sus02).toBe(1);
    expect(savedBeforeEdit.ratingInputRoutes.sus02).toBe('standard-scale');
    const susDefinition = getQuestionnaireDefinition('system-usability-scale')!;
    const scoreBeforeEdit = scoreQuestionnaire(susDefinition, savedBeforeEdit.ratings).primaryScore;
    expect(scoreBeforeEdit).toBe(100);

    component.querySelector<HTMLButtonElement>('button[aria-label^="Change item 2 answer."]')!.click();
    await component.updateComplete;
    // Exercise a different pending input route as well as a different value.
    // Neither may enter the canonical response or progress record before Save.
    (component as any).selectRating('sus02', 5, 'voice');
    await component.updateComplete;
    expect(component.querySelector<HTMLInputElement>('.rating-option input[value="5"]')?.checked).toBe(true);
    const savedDuringEdit = JSON.parse(localStorage.getItem(progressKey)!) as {
      stage: string;
      ratings: Record<string, number>;
      ratingInputRoutes: Record<string, string>;
    };
    expect(savedDuringEdit.stage).toBe('review');
    expect(savedDuringEdit.ratings.sus02).toBe(1);
    expect(savedDuringEdit.ratingInputRoutes.sus02).toBe('standard-scale');
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Cancel change and return to review'))!
      .click();
    await component.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 0));
    await component.updateComplete;
    expect(component.querySelectorAll<HTMLElement>('.review-rating-card')[1].textContent)
      .toContain('Selected answer: 1 — Strongly disagree');
    expect(component.querySelectorAll<HTMLElement>('.review-rating-card')[1].textContent)
      .toContain('Input route: full scale');
    expect(document.activeElement).toBe(component.querySelector('#review-item-2'));
    expect(component.querySelector('.sr-only[aria-live="polite"]')?.textContent)
      .toContain('edit cancelled. Original answer kept. 1 — Strongly disagree');
    const savedAfterCancel = JSON.parse(localStorage.getItem(progressKey)!) as {
      stage: string;
      ratings: Record<string, number>;
      ratingInputRoutes: Record<string, string>;
    };
    expect(savedAfterCancel.stage).toBe('review');
    expect(savedAfterCancel.ratings.sus02).toBe(1);
    expect(savedAfterCancel.ratingInputRoutes.sus02).toBe('standard-scale');
    expect(scoreQuestionnaire(susDefinition, savedAfterCancel.ratings).primaryScore)
      .toBe(scoreBeforeEdit);

    component.querySelector<HTMLButtonElement>('button[aria-label^="Change item 2 answer."]')!.click();
    await component.updateComplete;
    expect(component.querySelector('#rating-heading')?.textContent).toContain('Item 2');
    component.querySelector<HTMLInputElement>('.rating-option input[value="2"]')!.click();
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Save change and return to review'))!
      .click();
    await component.updateComplete;
    expect(component.querySelectorAll<HTMLElement>('.review-rating-card')[1].textContent)
      .toContain('Selected answer: 2');
    expect(document.activeElement).toBe(component.querySelector('#review-item-2'));
    const savedAfterCommit = JSON.parse(localStorage.getItem(progressKey)!) as {
      ratings: Record<string, number>;
      ratingInputRoutes: Record<string, string>;
    };
    expect(savedAfterCommit.ratings.sus02).toBe(2);
    expect(savedAfterCommit.ratingInputRoutes.sus02).toBe('standard-scale');

    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit responses'))!
      .click();
    await component.updateComplete;

    expect(component.textContent).toContain('SUS score');
    expect(component.textContent).toContain('97.50');
    expect(completed).not.toBeNull();
    expect((completed as unknown as StudyResultRecord).instrument.id).toBe('system-usability-scale');
    expect((completed as unknown as StudyResultRecord).result.strategy).toBe('sus-standard-v1');
    expect((completed as unknown as StudyResultRecord).result.ratings.sus02).toBe(2);
    expect((completed as unknown as StudyResultRecord).supportMetadata.ratingInputRoutes.sus02)
      .toBe('standard-scale');
    expect((completed as unknown as StudyResultRecord).responses.pairPresentationOrder).toEqual([]);
  });

  it('generates a SUS participant configuration from the shared conductor', async () => {
    window.history.replaceState({}, '', '/study.html');
    const conductor = document.createElement('study-conductor-app') as StudyConductorApp;
    document.body.append(conductor);
    await conductor.updateComplete;

    const select = conductor.querySelector<HTMLSelectElement>('select')!;
    select.value = 'system-usability-scale';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await conductor.updateComplete;
    expect(conductor.textContent).toContain('Smiley landmarks are disabled');

    const byLabel = (text: string) =>
      [...conductor.querySelectorAll<HTMLLabelElement>('label')]
        .find((label) => label.textContent?.includes(text))!
        .querySelector<HTMLInputElement>('input')!;
    for (const [label, value] of [
      ['Study ID', 'SUS-PLATFORM-02'],
      ['Study title', 'System evaluation'],
      ['Task label', 'using the route-planning system'],
      ['Pseudonymous participant code for this link', 'P-SUS-02'],
    ]) {
      const input = byLabel(label);
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    [...conductor.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Generate link')!
      .click();
    await conductor.updateComplete;

    const link = conductor.querySelector<HTMLTextAreaElement>('#participant-link')!.value;
    expect(readStudyConfigFromHash(new URL(link).hash)?.instrumentId).toBe('system-usability-scale');
  });

  it.each([
    {
      instrumentId: 'nasa-tlx-raw',
      participantCode: 'P-RAW-01',
      values: [0, 20, 40, 60, 80, 100],
      expectedScore: 50,
      expectedStrategy: 'nasa-tlx-raw-v1',
      expectedTitle: 'Raw NASA Task Load Index',
    },
  ])(
    'runs $instrumentId through the same rating-only participant workflow',
    async ({
      instrumentId,
      participantCode,
      values,
      expectedScore,
      expectedStrategy,
      expectedTitle,
    }) => {
      const config = createStudyConfig({
        instrumentId,
        studyId: 'PLATFORM-MULTI-01',
        studyTitle: 'Questionnaire platform evaluation',
        taskLabel: 'using the route-planning system',
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
      });
      const configuredUrl = new URL(buildParticipantUrl(window.location.href, config));
      window.history.replaceState({}, '', configuredUrl.pathname + configuredUrl.hash);

      const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
      let completed: StudyResultRecord | null = null;
      component.addEventListener('questionnaire-complete', (event) => {
        completed = (event as CustomEvent<StudyResultRecord>).detail;
      });
      document.body.append(component);
      await component.updateComplete;

      expect(component.querySelector('h1')?.textContent).toBe(expectedTitle);
      const code = component.querySelector<HTMLInputElement>('#participant-code')!;
      code.value = participantCode;
      code.dispatchEvent(new Event('input', { bubbles: true }));
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes(`Start the ${values.length} items`))!
        .click();
      await component.updateComplete;

      for (let index = 0; index < values.length; index += 1) {
        component.querySelector<HTMLInputElement>(
          `.rating-option input[value="${values[index]}"]`,
        )!.click();
        await component.updateComplete;
        [...component.querySelectorAll<HTMLButtonElement>('button')]
          .find((button) =>
            button.textContent?.includes(index === values.length - 1
              ? 'Review responses'
              : 'Next question'))!
          .click();
        await component.updateComplete;
      }

      expect(component.querySelector('.choice-fieldset')).toBeNull();
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.includes('Calculate and submit responses'))!
        .click();
      await component.updateComplete;

      expect(completed).not.toBeNull();
      expect((completed as unknown as StudyResultRecord).instrument.id).toBe(instrumentId);
      expect((completed as unknown as StudyResultRecord).result.strategy).toBe(expectedStrategy);
      expect((completed as unknown as StudyResultRecord).result.primaryScore).toBe(expectedScore);
    },
  );
});
