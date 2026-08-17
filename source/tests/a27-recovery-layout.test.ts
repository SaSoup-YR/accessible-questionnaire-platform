// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  QUALTRICS_ADVANCE_FAILED_MESSAGE,
  QUALTRICS_BRIDGE_BUILD,
  QUALTRICS_CHILD_READY_MESSAGE,
  QUALTRICS_SUBMIT_MESSAGE,
} from '../src/result-sink';
import { getQuestionnaireDefinition } from '../src/questionnaire-definition';
import { scoreQuestionnaire } from '../src/scoring';
import { createStudyResultRecord, questionnaireDefinitionHash, type StudyConfig, type SupportMetadata } from '../src/study';

function trackedStyle() {
  const values: Record<string, string> = {};
  return {
    values,
    style: {
      setProperty(property: string, value: string) {
        values[property] = value;
      },
      getPropertyValue(property: string) {
        return values[property] ?? '';
      },
      getPropertyPriority() {
        return '';
      },
    },
  };
}

function completeSusRecord() {
  const definition = structuredClone(getQuestionnaireDefinition('system-usability-scale')!);
  const values = [5, 1, 4, 2, 3, 5, 1, 4, 2, 3];
  const ratings = Object.fromEntries(definition.items.map((item, index) => [item.id, values[index]]));
  const result = scoreQuestionnaire(definition, ratings, {});
  const config: StudyConfig = {
    schemaVersion: 4,
    configId: 'a27-q10-config',
    createdAt: '2026-08-17T12:00:00.000Z',
    prototypeVersion: '0.8.0',
    instrumentId: definition.id,
    definitionHash: questionnaireDefinitionHash(definition),
    studyId: 'A27-Q10',
    studyTitle: 'A27 q10 recovery test',
    taskLabel: 'Complete the fixed SUS route',
    showScoreToParticipant: true,
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
    collection: {
      mode: 'qualtrics',
      parentOrigin: 'https://ucl-example.eu.qualtrics.com',
    },
  };
  const supportMetadata: SupportMetadata = {
    simplerExplanationsShownAtSubmission: false,
    largeTextUsedAtSubmission: false,
    answerModeAtSubmission: 'standard',
    recoveryEnabledAtSubmission: true,
    interruptionSummaryShown: false,
    readAloudUsed: false,
    automaticAudioGuidanceEnabledAtSubmission: false,
    gazeUsed: false,
    gazeActionCount: 0,
    gazeEngine: null,
    ratingInputRoutes: {},
    pairInputRoutes: {},
    supportChanges: [],
  };
  return createStudyResultRecord({
    config,
    participantCode: 'A27-Q10-TEST',
    startedAt: '2026-08-17T12:00:00.000Z',
    completedAt: '2026-08-17T12:05:00.000Z',
    pairPresentationOrder: [],
    pairwiseChoices: {},
    result,
    supportMetadata,
    submissionId: 'submission-a27-q10',
  });
}

describe('A27 post-staging recovery layout', () => {
  it('keeps the live participant iframe mounted when the Qualtrics advance watchdog fails', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    let onReady: (() => void) | undefined;
    let receiveMessage: ((event: MessageEvent) => void) | undefined;
    const timers: Array<{ callback: () => void; delay: number }> = [];
    const frameWindow = { postMessage: vi.fn() };
    const liveStyle = trackedStyle();
    const iframeStyle = trackedStyle();
    const bodyStyle = trackedStyle();
    const htmlStyle = trackedStyle();
    const statusStyle = trackedStyle();
    const originalParent = {
      appendChild(node: any) {
        node.parentNode = originalParent;
      },
      insertBefore(node: any) {
        node.parentNode = originalParent;
      },
    };
    const liveQuestion: any = {
      style: liveStyle.style,
      parentNode: originalParent,
      nextSibling: null,
      getAttribute(name: string) {
        return name === 'data-aqp-package-build' ? QUALTRICS_BRIDGE_BUILD : null;
      },
    };
    const iframe = {
      contentWindow: frameWindow,
      style: iframeStyle.style,
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const statusAttributes: Record<string, string> = {};
    const status = {
      style: statusStyle.style,
      textContent: '',
      scrollIntoView: vi.fn(),
      setAttribute(name: string, value: string) {
        statusAttributes[name] = value;
      },
    };
    const body: any = {
      style: bodyStyle.style,
      appendChild(node: any) {
        node.parentNode = body;
      },
    };
    const documentRef = {
      body,
      documentElement: { style: htmlStyle.style },
      getElementById(id: string) {
        if (id === 'accessible-questionnaire-frame') return iframe;
        if (id === 'accessible-questionnaire-collection-status') return status;
        if (id === 'accessible-questionnaire-live-question') return liveQuestion;
        if (id === 'accessible-questionnaire-recorded-summary') {
          return { getAttribute: () => '0' };
        }
        return null;
      },
    };
    const showNextButton = vi.fn();
    const clickNextButton = vi.fn();
    const fakeQualtrics = {
      SurveyEngine: {
        addOnReady(callback: () => void) {
          onReady = callback;
        },
        addOnUnload: vi.fn(),
        setJSEmbeddedData: vi.fn(),
      },
    };
    const fakeWindow = {
      CSS: { supports: () => true },
      navigator: { onLine: true },
      setTimeout(callback: () => void, delay: number) {
        timers.push({ callback, delay });
        return timers.length;
      },
      clearTimeout: vi.fn(),
      addEventListener(type: string, listener: EventListener) {
        if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
      },
      removeEventListener: vi.fn(),
    };

    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      documentRef,
      fakeWindow,
    );
    onReady!.call({
      hideNextButton: vi.fn(),
      showNextButton,
      clickNextButton,
    });

    receiveMessage!({
      source: frameWindow,
      origin: 'https://sasoup-yr.github.io',
      data: {
        type: QUALTRICS_CHILD_READY_MESSAGE,
        protocolVersion: 2,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      },
    } as unknown as MessageEvent);
    receiveMessage!({
      source: frameWindow,
      origin: 'https://sasoup-yr.github.io',
      data: {
        type: QUALTRICS_SUBMIT_MESSAGE,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
        record: completeSusRecord(),
      },
    } as unknown as MessageEvent);

    expect(liveQuestion.parentNode).toBe(body);
    timers.filter(({ delay }) => delay === 800).at(-1)!.callback();
    expect(clickNextButton).toHaveBeenCalledOnce();
    timers.filter(({ delay }) => delay === 6000).at(-1)!.callback();

    expect(showNextButton).toHaveBeenCalledOnce();
    expect(liveQuestion.parentNode).toBe(body);
    expect(iframeStyle.values.height).toBe('70vh');
    expect(bodyStyle.values.overflow).toBe('');
    expect(htmlStyle.values.overflow).toBe('');
    expect(statusAttributes['data-severity']).toBe('error');
    expect(frameWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: QUALTRICS_ADVANCE_FAILED_MESSAGE,
        submissionId: 'submission-a27-q10',
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      }),
      'https://sasoup-yr.github.io',
    );
  });
});
