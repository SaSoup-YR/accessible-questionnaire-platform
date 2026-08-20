// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  QUALTRICS_ADVANCE_FAILED_MESSAGE,
  QUALTRICS_BRIDGE_BUILD,
  QUALTRICS_CHILD_READY_MESSAGE,
  QUALTRICS_PARENT_READY_MESSAGE,
  QUALTRICS_RECEIPT_MESSAGE,
  QUALTRICS_SUBMIT_MESSAGE,
  configuredResultSink,
  createQualtricsParentResultSink,
  installQualtricsBridgeHandshake,
  submitToApprovedResultSink,
} from '../src/result-sink';
import { getQuestionnaireDefinition } from '../src/questionnaire-definition';
import { questionnaireDefinitionHash, type StudyResultRecord } from '../src/study';

const record = {
  submissionId: 'submission-fixed',
} as StudyResultRecord;

function trackedStyle(initial: Record<string, string> = {}) {
  const values = { ...initial };
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

function createBridgeDocument(frameWindow: { postMessage: ReturnType<typeof vi.fn> }) {
  const iframeStyle = trackedStyle();
  const liveStyle = trackedStyle();
  const bodyStyle = trackedStyle();
  const documentElementStyle = trackedStyle();
  const statusAttributes: Record<string, string> = {};
  const originalParent = {
    appendChild(node: any) {
      node.parentNode = originalParent;
    },
    insertBefore(node: any) {
      node.parentNode = originalParent;
    },
  };
  const liveQuestion = {
    style: liveStyle.style,
    parentNode: originalParent,
    nextSibling: null,
    getAttribute(name: string): string | null {
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
  const status = {
    textContent: '',
    scrollIntoView: vi.fn(),
    setAttribute(name: string, value: string) {
      statusAttributes[name] = value;
    },
  };
  const recordedSummary = {
    getAttribute(name: string): string | null {
      return name === 'data-recorded' ? '0' : null;
    },
  };
  const body = {
    style: bodyStyle.style,
    appendChild(node: any) {
      node.parentNode = body;
    },
  };
  const documentElement = { style: documentElementStyle.style };
  const documentRef = {
    body,
    documentElement,
    getElementById(id: string) {
      if (id === 'accessible-questionnaire-frame') return iframe;
      if (id === 'accessible-questionnaire-collection-status') return status;
      if (id === 'accessible-questionnaire-live-question') return liveQuestion;
      if (id === 'accessible-questionnaire-recorded-summary') return recordedSummary;
      return null;
    },
  };
  return {
    documentRef,
    iframe,
    iframeStyle: iframeStyle.values,
    liveQuestion,
    liveStyle: liveStyle.values,
    bodyStyle: bodyStyle.values,
    documentElementStyle: documentElementStyle.values,
    status,
    statusAttributes,
    recordedSummary,
  };
}

function createCompleteQualtricsRecord(): StudyResultRecord {
  const definition = structuredClone(getQuestionnaireDefinition('system-usability-scale')!);
  const items = definition.items.map(({ id }) => id);
  const ratings = Object.fromEntries(items.map((item, index) => [item, index % 2 === 0 ? 5 : 1]));
  const contributions = Object.fromEntries(items.map((item) => [item, 4]));

  return {
    schemaVersion: 4,
    submissionId: 'submission-complete',
    study: {
      studyId: 'SUS-TEST',
      configId: 'config-test',
      studyTitle: 'SUS bridge test',
      taskLabel: 'Evaluate the configured participant flow',
    },
    participantCode: 'TEST-001',
    timing: {
      startedAt: '2026-07-27T10:00:00.000Z',
      completedAt: '2026-07-27T10:05:00.000Z',
    },
    prototype: { name: 'Accessible Questionnaire Platform', version: '0.8.0' },
    instrument: {
      id: definition.id,
      name: definition.name,
      version: definition.version,
      definitionSchemaVersion: 1,
      definitionHash: questionnaireDefinitionHash(definition),
      scoringStrategy: definition.scoring.strategy,
      definition,
    },
    collection: {
      mode: 'qualtrics',
      parentOrigin: 'https://ucl-example.eu.qualtrics.com',
    },
    configuration: {
      showSimpleLanguage: false,
      answerMode: 'standard',
      largeText: false,
      audioGuidance: false,
      recoveryEnabled: true,
      participantAdjustmentPolicy: 'presentation-only',
      voiceInputAvailable: true,
      gazeInputAvailable: false,
    },
    responses: {
      ratings,
      pairwiseChoices: {},
      pairPresentationOrder: [],
    },
    result: {
      strategy: 'sus-standard-v1',
      scoreName: 'SUS score',
      primaryScore: 100,
      scoreMinimum: 0,
      scoreMaximum: 100,
      ratings,
      details: {
        kind: 'sus-contributions',
        contributions,
      },
    },
    supportMetadata: {
      ratingInputRoutes: { sus01: 'voice' },
      pairInputRoutes: {},
      supportChanges: [],
      simplerExplanationsShownAtSubmission: false,
      answerModeAtSubmission: 'standard',
      largeTextUsedAtSubmission: false,
      automaticAudioGuidanceEnabledAtSubmission: false,
      recoveryEnabledAtSubmission: true,
      readAloudUsed: false,
      interruptionSummaryShown: false,
      gazeUsed: false,
      gazeActionCount: 0,
      gazeEngine: null,
    },
  };
}

function createQualtricsSubmissionRuntime(
  recordToSubmit: unknown,
  setEmbeddedDataImplementation?: (name: string, value: string) => void,
) {
  const bridge = readFileSync(
    resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
    'utf8',
  );
  let onReady: (() => void) | undefined;
  let receiveMessage: ((event: MessageEvent) => void) | undefined;
  const setJSEmbeddedData = vi.fn(setEmbeddedDataImplementation);
  const hideNextButton = vi.fn();
  const showNextButton = vi.fn();
  const clickNextButton = vi.fn();
  const frameWindow = { postMessage: vi.fn() };
  const dom = createBridgeDocument(frameWindow);
  const fakeQualtrics = {
    SurveyEngine: {
      addOnReady(callback: () => void) {
        onReady = callback;
      },
      addOnUnload: vi.fn(),
      setJSEmbeddedData,
    },
  };
  const fakeWindow = {
    CSS: { supports: () => true },
    navigator: { onLine: true },
    setTimeout: vi.fn(() => 1),
    clearTimeout: vi.fn(),
    addEventListener(type: string, listener: EventListener) {
      if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
    },
    removeEventListener: vi.fn(),
  };

  new Function('Qualtrics', 'document', 'window', bridge)(
    fakeQualtrics,
    dom.documentRef,
    fakeWindow,
  );
  onReady!.call({ hideNextButton, showNextButton, clickNextButton });
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
      record: recordToSubmit,
    },
  } as unknown as MessageEvent);

  return {
    setJSEmbeddedData,
    hideNextButton,
    showNextButton,
    clickNextButton,
    frameWindow,
    dom,
  };
}

afterEach(() => {
  delete window.accessibleQuestionnaireResultSink;
  delete window.accessibleNasaTlxResultSink;
});

describe('approved host result sink', () => {
  it('is absent unless the host page explicitly installs a named submit function', () => {
    expect(configuredResultSink()).toBeNull();
    window.accessibleNasaTlxResultSink = { name: '', async submit() {
      return { accepted: true, submissionId: 'submission-fixed' };
    } };
    expect(configuredResultSink()).toBeNull();
  });

  it('accepts only a receipt for the same idempotent submission ID', async () => {
    const sink = {
      name: 'Approved platform',
      async submit() {
        return { accepted: true as const, submissionId: 'submission-fixed', receiptId: 'receipt-001' };
      },
    };
    await expect(submitToApprovedResultSink(record, sink)).resolves.toEqual({
      accepted: true,
      submissionId: 'submission-fixed',
      receiptId: 'receipt-001',
    });
  });

  it('rejects a mismatched receipt instead of falsely reporting completion', async () => {
    const sink = {
      name: 'Approved platform',
      async submit() {
        return { accepted: true as const, submissionId: 'different-submission' };
      },
    };
    await expect(submitToApprovedResultSink(record, sink)).rejects.toThrow(/invalid submission receipt/i);
  });

  it('times out a host that never confirms receipt', async () => {
    const sink = {
      name: 'Unresponsive platform',
      async submit() {
        return new Promise<never>(() => undefined);
      },
    };
    await expect(submitToApprovedResultSink(record, sink, 5)).rejects.toThrow(/did not acknowledge the staged response in time/i);
  });

  it('sends a record only to the configured Qualtrics origin and accepts a matching parent receipt', async () => {
    let receiveMessage: ((event: MessageEvent) => void) | undefined;
    const parent = {
      postMessage(message: any, targetOrigin: string) {
        expect(message.type).toBe(QUALTRICS_SUBMIT_MESSAGE);
        expect(message.bridgeBuild).toBe(QUALTRICS_BRIDGE_BUILD);
        expect(message.record).toBe(record);
        expect(targetOrigin).toBe('https://ucl-example.eu.qualtrics.com');
        queueMicrotask(() => receiveMessage?.({
          source: parent,
          origin: targetOrigin,
          data: {
            type: QUALTRICS_RECEIPT_MESSAGE,
            accepted: true,
            submissionId: record.submissionId,
            receiptId: 'qualtrics-accepted-submission-fixed',
            bridgeBuild: QUALTRICS_BRIDGE_BUILD,
          },
        } as unknown as MessageEvent));
      },
    };
    const windowRef = {
      parent,
      setTimeout: window.setTimeout.bind(window),
      clearTimeout: window.clearTimeout.bind(window),
      addEventListener(type: string, listener: EventListener) {
        if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
      },
      removeEventListener() {
        receiveMessage = undefined;
      },
    } as unknown as Window;
    const sink = createQualtricsParentResultSink(
      'https://ucl-example.eu.qualtrics.com',
      windowRef,
      20,
    );

    await expect(sink.submit(record)).resolves.toEqual({
      accepted: true,
      submissionId: 'submission-fixed',
      receiptId: 'qualtrics-accepted-submission-fixed',
    });
  });

  it('rejects direct opening instead of pretending Qualtrics collected the response', async () => {
    const directWindow = {
      setTimeout: window.setTimeout.bind(window),
      clearTimeout: window.clearTimeout.bind(window),
    } as unknown as Window;
    Object.defineProperty(directWindow, 'parent', { value: directWindow });
    const sink = createQualtricsParentResultSink('https://ucl-example.eu.qualtrics.com', directWindow);
    await expect(sink.submit(record)).rejects.toThrow(/opened through its Qualtrics survey/i);
  });

  it('connects only to the exact Qualtrics origin and matching bridge package', () => {
    let receiveMessage: ((event: MessageEvent) => void) | undefined;
    const parent = { postMessage: vi.fn() };
    const states: string[] = [];
    const advanceFailures: string[] = [];
    const fakeWindow = {
      parent,
      setTimeout: vi.fn(() => 1),
      clearTimeout: vi.fn(),
      addEventListener(type: string, listener: EventListener) {
        if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
      },
      removeEventListener: vi.fn(),
    } as unknown as Window;

    const bridge = installQualtricsBridgeHandshake(
      'https://ucl-example.eu.qualtrics.com',
      fakeWindow,
      ({ state }) => states.push(state),
      (message) => advanceFailures.push(message),
    );
    expect(states).toEqual(['connecting']);
    receiveMessage!({
      source: parent,
      origin: 'https://attacker.example',
      data: {
        type: QUALTRICS_PARENT_READY_MESSAGE,
        protocolVersion: 2,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      },
    } as unknown as MessageEvent);
    expect(parent.postMessage).not.toHaveBeenCalled();

    receiveMessage!({
      source: parent,
      origin: 'https://ucl-example.eu.qualtrics.com',
      data: {
        type: QUALTRICS_PARENT_READY_MESSAGE,
        protocolVersion: 2,
        bridgeBuild: '0.8.1-q1',
      },
    } as unknown as MessageEvent);
    expect(bridge.getState()).toBe('failed');
    expect(parent.postMessage).not.toHaveBeenCalled();

    receiveMessage!({
      source: parent,
      origin: 'https://ucl-example.eu.qualtrics.com',
      data: {
        type: QUALTRICS_PARENT_READY_MESSAGE,
        protocolVersion: 2,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      },
    } as unknown as MessageEvent);
    expect(bridge.getState()).toBe('connected');
    expect(parent.postMessage).toHaveBeenCalledWith(
      {
        type: QUALTRICS_CHILD_READY_MESSAGE,
        protocolVersion: 2,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      },
      'https://ucl-example.eu.qualtrics.com',
    );

    receiveMessage!({
      source: parent,
      origin: 'https://ucl-example.eu.qualtrics.com',
      data: {
        type: QUALTRICS_ADVANCE_FAILED_MESSAGE,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
        error: 'The response is not confirmed as recorded.',
      },
    } as unknown as MessageEvent);
    expect(advanceFailures).toEqual(['The response is not confirmed as recorded.']);

    receiveMessage!({
      source: parent,
      origin: 'https://attacker.example',
      data: {
        type: QUALTRICS_ADVANCE_FAILED_MESSAGE,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
        error: 'False warning.',
      },
    } as unknown as MessageEvent);
    expect(advanceFailures).toEqual(['The response is not confirmed as recorded.']);
    bridge.disconnect();
  });

  it('fails closed when result submission is attempted before the verified bridge connects', async () => {
    const parent = { postMessage: vi.fn() };
    const windowRef = {
      parent,
      setTimeout: window.setTimeout.bind(window),
      clearTimeout: window.clearTimeout.bind(window),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Window;
    const sink = createQualtricsParentResultSink(
      'https://ucl-example.eu.qualtrics.com',
      windowRef,
      20,
      () => false,
    );
    await expect(sink.submit(record)).rejects.toThrow(/bridge .* is not connected/i);
    expect(parent.postMessage).not.toHaveBeenCalled();
  });

  it('ships a syntactically valid Qualtrics parent bridge with exact-origin messaging and bounded raw fields', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    expect(() => new Function(bridge)).not.toThrow();
    expect(bridge).toContain("var childOrigin = 'https://sasoup-yr.github.io'");
    expect(bridge).toContain('var rawChunkLength = 900');
    expect(bridge).toContain('var maximumRawChunks = 24');
    expect(bridge).toContain('var completionDelayMs = 800');
    expect(bridge).toContain('}, completionDelayMs);');
    expect(bridge).toContain('question.showNextButton();');
    expect(bridge).not.toContain('No further action is required.');
    expect(bridge).not.toContain('Your answers have been accepted');
    expect(bridge).toContain('Waiting for Qualtrics. Keep this page open.');
    expect(bridge).toContain('Qualtrics could not confirm this response.');
    expect(bridge).toContain('Internet connection unavailable.');
    expect(bridge).toContain('sendAdvanceFailure(advanceFailureMessage)');
    expect(bridge).toContain('window.navigator.onLine === false');
    expect(bridge).not.toContain('Please keep this page open until the next page appears by itself.');
    expect(bridge).toContain('Qualtrics could not confirm this response.');
    expect(bridge).not.toContain('five minutes');
    expect(bridge).toContain('window.clearTimeout(completionTimerId);');
    expect(bridge).toContain('window.clearTimeout(advanceWatchdogTimerId);');
    expect(bridge).toContain('Qualtrics.SurveyEngine.setJSEmbeddedData(');
    expect(bridge).toContain(
      "setField('AQP_PRIMARY_SCORE', Number(record.result.primaryScore).toFixed(2));",
    );
    expect(bridge).toContain("setField('AQP_INSTRUMENT_ID', record.instrument.id);");
    expect(bridge).not.toContain('Qualtrics.SurveyEngine.setEmbeddedData(');
    expect(bridge).not.toMatch(/postMessage\([^)]*,\s*['"]\*['"]\s*\)/);

    const embeddedDataFields = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/embedded-data-fields.txt'),
      'utf8',
    )
      .trim()
      .split(/\r?\n/);
    expect(embeddedDataFields).toHaveLength(63);
    expect(embeddedDataFields.every((field) => field.startsWith('__js_AQP_'))).toBe(true);
    const bridgeFieldNames = new Set(
      [...bridge.matchAll(/setField\('([A-Z0-9_]+)'/g)].map((match) => `__js_${match[1]}`),
    );
    Array.from({ length: 24 }, (_, index) => index + 1).forEach((index) => {
      bridgeFieldNames.add(`__js_AQP_RAW_${String(index).padStart(2, '0')}`);
    });
    expect([...bridgeFieldNames].sort()).toEqual([...embeddedDataFields].sort());

    const questionHtml = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/question-html-template.html'),
      'utf8',
    );
    expect(questionHtml).toContain('id="accessible-questionnaire-recorded-summary"');
    expect(questionHtml).toContain('REFERENCE TEMPLATE ONLY');
    expect(questionHtml).toContain('style="display:none"');
    expect(questionHtml).toContain('display: block !important');
    expect(questionHtml).toContain('data-recorded="${e://Field/__js_AQP_ACCEPTED}"');
    expect(questionHtml).toContain(
      '#accessible-questionnaire-recorded-summary[data-recorded="1"] + #accessible-questionnaire-live-question',
    );
    expect(questionHtml).toContain('${e://Field/__js_AQP_PARTICIPANT_CODE}');
    expect(questionHtml).toContain('${e://Field/__js_AQP_PRIMARY_SCORE}');
    expect(questionHtml).toContain('${e://Field/__js_AQP_INSTRUMENT_NAME}');
    expect(questionHtml).toContain('referrerpolicy="origin"');
    expect(questionHtml).toContain('scrolling="yes"');
    expect(questionHtml).toContain('position: fixed');
    expect(questionHtml).toContain('height: 100dvh');
    expect(questionHtml).toContain('overflow: auto');
    expect(questionHtml).toContain(`data-aqp-package-build="${QUALTRICS_BRIDGE_BUILD}"`);
    expect(questionHtml).not.toContain('min-height:1200px');
    expect(questionHtml).toContain('visibility:hidden');
    expect(questionHtml).toContain('aria-hidden="true"');
    expect(questionHtml).not.toContain('__js_AQP_RAW_01');
    const summaryFields = [...questionHtml.matchAll(/\$\{e:\/\/Field\/(__js_AQP_[A-Z0-9_]+)\}/g)]
      .map((match) => match[1]);
    expect(summaryFields.length).toBeGreaterThan(20);
    expect(summaryFields.every((field) => embeddedDataFields.includes(field))).toBe(true);

    const endOfSurveyMessage = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/end-of-survey-message.txt'),
      'utf8',
    );
    expect(endOfSurveyMessage).toContain('Questionnaire complete');
    expect(endOfSurveyMessage).toContain('{{OPTIONAL_SCORE_BLOCK}}');
    expect(endOfSurveyMessage).toContain('Your questionnaire responses have been recorded successfully.');
    expect(endOfSurveyMessage).toContain(
      'accessibility-support choices and input-route information have been saved separately',
    );
    expect(endOfSurveyMessage).not.toMatch(/<[^>]+>/);
  });

  it('presents the participant runner as one full-viewport scrolling page after an exact package handshake', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    let onReady: (() => void) | undefined;
    let receiveMessage: ((event: MessageEvent) => void) | undefined;
    const frameWindow = { postMessage: vi.fn() };
    const dom = createBridgeDocument(frameWindow);
    const fakeWindow = {
      CSS: { supports: () => true },
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      addEventListener(type: string, listener: EventListener) {
        if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
      },
      removeEventListener: vi.fn(),
    };
    const setJSEmbeddedData = vi.fn();
    const fakeQualtrics = {
      SurveyEngine: {
        addOnReady(callback: () => void) {
          onReady = callback;
        },
        addOnUnload: vi.fn(),
        setJSEmbeddedData,
      },
    };

    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      dom.documentRef,
      fakeWindow,
    );
    onReady!.call({
      hideNextButton: vi.fn(),
      showNextButton: vi.fn(),
      clickNextButton: vi.fn(),
    });

    expect(frameWindow.postMessage).toHaveBeenCalledWith(
      {
        type: QUALTRICS_PARENT_READY_MESSAGE,
        protocolVersion: 2,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      },
      'https://sasoup-yr.github.io',
    );
    expect(dom.iframe.setAttribute).toHaveBeenCalledWith('scrolling', 'yes');
    expect(dom.iframeStyle.overflow).toBe('auto');
    expect(dom.iframeStyle.height).toBe('100%');
    expect(dom.liveStyle.position).toBe('fixed');
    expect(dom.liveStyle.height).toBe('100dvh');
    expect(dom.bodyStyle.overflow).toBe('hidden');
    expect(dom.documentElementStyle.overflow).toBe('hidden');
    receiveMessage!({
      source: frameWindow,
      origin: 'https://sasoup-yr.github.io',
      data: {
        type: QUALTRICS_CHILD_READY_MESSAGE,
        protocolVersion: 2,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      },
    } as unknown as MessageEvent);
    expect(dom.status.textContent).toContain('questionnaire is connected');
    expect(dom.statusAttributes['data-quiet']).toBe('true');
    expect(dom.statusAttributes['aria-live']).toBe('off');
    expect(dom.iframe.removeAttribute).toHaveBeenCalledWith('aria-hidden');
    expect(dom.iframeStyle.visibility).toBe('visible');
    expect(setJSEmbeddedData).not.toHaveBeenCalledWith('AQP_ACCEPTED', '0');
    expect(setJSEmbeddedData).toHaveBeenCalledWith('AQP_BRIDGE_READY', '1');
    expect(setJSEmbeddedData).toHaveBeenCalledWith('AQP_BRIDGE_BUILD', QUALTRICS_BRIDGE_BUILD);
    expect(setJSEmbeddedData).toHaveBeenCalledWith('AQP_SCHEMA', '4');
    expect(setJSEmbeddedData).not.toHaveBeenCalledWith(
      'AQP_PROTOTYPE_VERSION',
      QUALTRICS_BRIDGE_BUILD,
    );
    expect(setJSEmbeddedData).toHaveBeenCalledWith('AQP_COLLECTION_MODE', 'qualtrics');
  });

  it('blocks a mixed HTML and JavaScript package before the participant can start', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    let onReady: (() => void) | undefined;
    const frameWindow = { postMessage: vi.fn() };
    const dom = createBridgeDocument(frameWindow);
    dom.liveQuestion.getAttribute = () => '0.8.1-q1';
    const showNextButton = vi.fn();
    const hideNextButton = vi.fn();
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
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      dom.documentRef,
      fakeWindow,
    );
    onReady!.call({
      hideNextButton,
      showNextButton,
      clickNextButton: vi.fn(),
    });

    expect(hideNextButton).not.toHaveBeenCalled();
    expect(showNextButton).toHaveBeenCalledOnce();
    expect(dom.status.textContent).toContain('HTML and JavaScript versions do not match');
    expect(frameWindow.postMessage).not.toHaveBeenCalled();
  });

  it('does not replace a recorded-response summary with the live full-screen runner', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    let onReady: (() => void) | undefined;
    const frameWindow = { postMessage: vi.fn() };
    const dom = createBridgeDocument(frameWindow);
    dom.recordedSummary.getAttribute = () => '1';
    const hideNextButton = vi.fn();
    const fakeQualtrics = {
      SurveyEngine: {
        addOnReady(callback: () => void) {
          onReady = callback;
        },
        addOnUnload: vi.fn(),
        setJSEmbeddedData: vi.fn(),
      },
    };

    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      dom.documentRef,
      {
        setTimeout: vi.fn(),
        clearTimeout: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    );
    onReady!.call({
      hideNextButton,
      showNextButton: vi.fn(),
      clickNextButton: vi.fn(),
    });

    expect(hideNextButton).not.toHaveBeenCalled();
    expect(dom.liveStyle.position).toBeUndefined();
    expect(frameWindow.postMessage).not.toHaveBeenCalled();
  });

  it('stages a complete SUS record through the generic bridge and advances after the bounded hand-off', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    const completeRecord = createCompleteQualtricsRecord();
    function createRuntime(online: boolean) {
      let onReady: (() => void) | undefined;
      let receiveMessage: ((event: MessageEvent) => void) | undefined;
      let latestTimerCallback: (() => void) | undefined;
      let latestTimerDelay: number | undefined;
      const setJSEmbeddedData = vi.fn();
      const hideNextButton = vi.fn();
      const showNextButton = vi.fn();
      const clickNextButton = vi.fn();
      const frameWindow = { postMessage: vi.fn() };
      const dom = createBridgeDocument(frameWindow);
      const fakeQualtrics = {
        SurveyEngine: {
          addOnReady(callback: () => void) {
            onReady = callback;
          },
          addOnUnload: vi.fn(),
          setJSEmbeddedData,
        },
      };
      const fakeWindow = {
        CSS: { supports: () => true },
        navigator: { onLine: online },
        setTimeout(callback: () => void, delay: number) {
          latestTimerCallback = callback;
          latestTimerDelay = delay;
          return 1;
        },
        clearTimeout: vi.fn(),
        addEventListener(type: string, listener: EventListener) {
          if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
        },
        removeEventListener: vi.fn(),
      };

      new Function('Qualtrics', 'document', 'window', bridge)(
        fakeQualtrics,
        dom.documentRef,
        fakeWindow,
      );
      onReady!.call({ hideNextButton, showNextButton, clickNextButton });
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
          record: completeRecord,
        },
      } as unknown as MessageEvent);

      return {
        clickLatestTimer: () => latestTimerCallback!(),
        getLatestTimerDelay: () => latestTimerDelay,
        setJSEmbeddedData,
        hideNextButton,
        showNextButton,
        clickNextButton,
        frameWindow,
        dom,
      };
    }

    const onlineRuntime = createRuntime(true);

    expect(onlineRuntime.hideNextButton).toHaveBeenCalledOnce();
    expect(onlineRuntime.showNextButton).not.toHaveBeenCalled();
    expect(onlineRuntime.setJSEmbeddedData).toHaveBeenCalledTimes(65);
    expect(onlineRuntime.setJSEmbeddedData).toHaveBeenCalledWith('AQP_ACCEPTED', '1');
    expect(onlineRuntime.setJSEmbeddedData.mock.lastCall).toEqual(['AQP_ACCEPTED', '1']);
    expect(onlineRuntime.setJSEmbeddedData).toHaveBeenCalledWith('AQP_INSTRUMENT_ID', 'system-usability-scale');
    expect(onlineRuntime.setJSEmbeddedData).toHaveBeenCalledWith(
      'AQP_DEFINITION_HASH',
      expect.stringMatching(/^sha256:[0-9a-f]{64}$/),
    );
    expect(onlineRuntime.setJSEmbeddedData).toHaveBeenCalledWith('AQP_PRIMARY_SCORE', '100.00');
    expect(onlineRuntime.frameWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        accepted: true,
        submissionId: 'submission-complete',
        receiptId: 'qualtrics-accepted-submission-complete',
      }),
      'https://sasoup-yr.github.io',
    );
    expect(onlineRuntime.dom.status.textContent).toBe(
      'Waiting for Qualtrics. Keep this page open.',
    );
    expect(onlineRuntime.getLatestTimerDelay()).toBe(800);
    onlineRuntime.clickLatestTimer();
    expect(onlineRuntime.clickNextButton).toHaveBeenCalledOnce();
    expect(onlineRuntime.getLatestTimerDelay()).toBe(6000);
    onlineRuntime.clickLatestTimer();
    expect(onlineRuntime.showNextButton).toHaveBeenCalledOnce();
    expect(onlineRuntime.dom.status.textContent).toContain('could not confirm this response');
    expect(onlineRuntime.frameWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: QUALTRICS_ADVANCE_FAILED_MESSAGE,
        submissionId: 'submission-complete',
        error: expect.stringContaining('could not confirm this response'),
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      }),
      'https://sasoup-yr.github.io',
    );

    const offlineRuntime = createRuntime(false);
    expect(offlineRuntime.clickNextButton).toHaveBeenCalledOnce();
    expect(offlineRuntime.showNextButton).toHaveBeenCalledOnce();
    expect(offlineRuntime.dom.status.textContent).toContain('Internet connection unavailable');
    expect(offlineRuntime.dom.status.textContent).toContain('has not recorded this response');
    expect(offlineRuntime.dom.statusAttributes['data-severity']).toBe('error');
    expect(offlineRuntime.dom.status.scrollIntoView).toHaveBeenCalledWith({
      block: 'start',
      inline: 'nearest',
    });
    expect(offlineRuntime.frameWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: QUALTRICS_ADVANCE_FAILED_MESSAGE,
        submissionId: 'submission-complete',
        error: expect.stringContaining('Internet connection unavailable'),
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      }),
      'https://sasoup-yr.github.io',
    );
  });

  it.each([
    {
      caseName: 'a missing definition hash',
      mutate(recordToMutate: StudyResultRecord) {
        delete (recordToMutate.instrument as Partial<StudyResultRecord['instrument']>).definitionHash;
      },
    },
    {
      caseName: 'a malformed definition hash',
      mutate(recordToMutate: StudyResultRecord) {
        recordToMutate.instrument.definitionHash = `sha256:${'A'.repeat(64)}`;
      },
    },
    {
      caseName: 'a missing definition snapshot',
      mutate(recordToMutate: StudyResultRecord) {
        delete (recordToMutate.instrument as Partial<StudyResultRecord['instrument']>).definition;
      },
    },
  ])('rejects a record with $caseName before writing the acceptance marker', ({ mutate }) => {
    const incompleteRecord = structuredClone(createCompleteQualtricsRecord());
    mutate(incompleteRecord);
    const runtime = createQualtricsSubmissionRuntime(incompleteRecord);

    expect(runtime.setJSEmbeddedData).not.toHaveBeenCalledWith('AQP_ACCEPTED', '1');
    expect(runtime.showNextButton).not.toHaveBeenCalled();
    expect(runtime.dom.statusAttributes['data-severity']).toBe('error');
    expect(runtime.frameWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: QUALTRICS_RECEIPT_MESSAGE,
        accepted: false,
        submissionId: 'submission-complete',
      }),
      'https://sasoup-yr.github.io',
    );
  });

  it('does not write the acceptance marker when raw-record staging fails part-way through', () => {
    const runtime = createQualtricsSubmissionRuntime(
      createCompleteQualtricsRecord(),
      (name) => {
        if (name === 'AQP_RAW_05') throw new Error('Injected raw-field staging failure.');
      },
    );

    expect(runtime.setJSEmbeddedData).toHaveBeenCalledWith('AQP_RAW_05', expect.any(String));
    expect(runtime.setJSEmbeddedData).not.toHaveBeenCalledWith('AQP_ACCEPTED', '1');
    expect(runtime.showNextButton).not.toHaveBeenCalled();
    expect(runtime.dom.status.textContent).toContain('Injected raw-field staging failure');
    expect(runtime.dom.status.textContent).toContain('Retry, Change, JSON or CSV');
    expect(runtime.dom.statusAttributes['data-severity']).toBe('error');
    expect(runtime.frameWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: QUALTRICS_RECEIPT_MESSAGE,
        accepted: false,
        submissionId: 'submission-complete',
        error: 'Injected raw-field staging failure.',
      }),
      'https://sasoup-yr.github.io',
    );
  });

  it('preserves the live participant recovery route and blocks native Next when staging fails', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    let onReady: (() => void) | undefined;
    let receiveMessage: ((event: MessageEvent) => void) | undefined;
    const showNextButton = vi.fn();
    const frameWindow = { postMessage: vi.fn() };
    const dom = createBridgeDocument(frameWindow);
    const fakeWindow = {
      CSS: { supports: () => true },
      setTimeout,
      clearTimeout,
      addEventListener(type: string, listener: EventListener) {
        if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
      },
      removeEventListener: vi.fn(),
    };
    const fakeQualtrics = {
      SurveyEngine: {
        addOnReady(callback: () => void) {
          onReady = callback;
        },
        addOnUnload: vi.fn(),
        setJSEmbeddedData: vi.fn(),
      },
    };
    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      dom.documentRef,
      fakeWindow,
    );
    onReady!.call({
      hideNextButton: vi.fn(),
      showNextButton,
      clickNextButton: vi.fn(),
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
        record: { submissionId: 'incomplete' },
      },
    } as unknown as MessageEvent);

    expect(showNextButton).not.toHaveBeenCalled();
    expect(dom.status.textContent).toContain('The response was not staged');
    expect(dom.status.textContent).toContain('Retry, Change, JSON or CSV');
    expect(dom.statusAttributes['data-severity']).toBe('error');
    expect(dom.bodyStyle.overflow).toBe('');
    expect(dom.documentElementStyle.overflow).toBe('');
    expect(dom.liveStyle.position).toBe('relative');
    expect(dom.iframeStyle.height).toBe('70vh');
    expect(frameWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ accepted: false, submissionId: 'incomplete' }),
      'https://sasoup-yr.github.io',
    );
  });

  it('keeps the participant runner hidden and restores navigation when diagnostic staging fails', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    let onReady: (() => void) | undefined;
    let receiveMessage: ((event: MessageEvent) => void) | undefined;
    const showNextButton = vi.fn();
    const frameWindow = { postMessage: vi.fn() };
    const dom = createBridgeDocument(frameWindow);
    const fakeWindow = {
      CSS: { supports: () => true },
      setTimeout: vi.fn(() => 1),
      clearTimeout: vi.fn(),
      addEventListener(type: string, listener: EventListener) {
        if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
      },
      removeEventListener: vi.fn(),
    };
    const fakeQualtrics = {
      SurveyEngine: {
        addOnReady(callback: () => void) {
          onReady = callback;
        },
        addOnUnload: vi.fn(),
        setJSEmbeddedData: vi.fn(() => {
          throw new Error('Embedded Data staging unavailable.');
        }),
      },
    };
    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      dom.documentRef,
      fakeWindow,
    );
    onReady!.call({
      hideNextButton: vi.fn(),
      showNextButton,
      clickNextButton: vi.fn(),
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

    expect(showNextButton).toHaveBeenCalledOnce();
    expect(dom.status.textContent).toContain('Do not collect a response');
    expect(dom.iframeStyle.visibility).toBe('hidden');
    expect(dom.iframe.removeAttribute).not.toHaveBeenCalled();
  });

  it('keeps native navigation available when the Qualtrics iframe is missing', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    let onReady: (() => void) | undefined;
    const showNextButton = vi.fn();
    const hideNextButton = vi.fn();
    const status = { textContent: '' };
    const fakeQualtrics = {
      SurveyEngine: {
        addOnReady(callback: () => void) {
          onReady = callback;
        },
        addOnUnload: vi.fn(),
        setJSEmbeddedData: vi.fn(),
      },
    };
    const fakeDocument = {
      getElementById(id: string) {
        if (id === 'accessible-questionnaire-collection-status') return status;
        return null;
      },
    };
    const fakeWindow = {
      setTimeout,
      clearTimeout,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      fakeDocument,
      fakeWindow,
    );
    onReady!.call({
      hideNextButton,
      showNextButton,
      clickNextButton: vi.fn(),
    });

    expect(hideNextButton).not.toHaveBeenCalled();
    expect(showNextButton).toHaveBeenCalledOnce();
    expect(status.textContent).toContain('package is incomplete');
  });
});
