// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  QUALTRICS_BRIDGE_BUILD,
  QUALTRICS_CHILD_READY_MESSAGE,
} from '../src/result-sink';

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

function createRuntime() {
  const bridge = readFileSync(
    resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
    'utf8',
  );
  let onReady: (() => void) | undefined;
  let receiveMessage: ((event: MessageEvent) => void) | undefined;
  const timers: Array<{ callback: () => void; delay: number }> = [];
  const frameWindow = { postMessage: vi.fn() };
  const iframeStyle = trackedStyle();
  const liveStyle = trackedStyle();
  const statusStyle = trackedStyle();
  const bodyStyle = trackedStyle();
  const htmlStyle = trackedStyle();
  const statusAttributes: Record<string, string> = {};
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
  const status = {
    textContent: '',
    style: statusStyle.style,
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
  const hideNextButton = vi.fn();
  const showNextButton = vi.fn();
  const clickNextButton = vi.fn();
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
  onReady!.call({ hideNextButton, showNextButton, clickNextButton });

  return {
    timers,
    frameWindow,
    iframe,
    status,
    statusAttributes,
    hideNextButton,
    showNextButton,
    clickNextButton,
    setJSEmbeddedData,
    receiveMessage: (event: MessageEvent) => receiveMessage!(event),
  };
}

describe('RF-01 Qualtrics connection semantics', () => {
  it('primes a live status before announcing Connecting and exposes a missing bridge as an alert without enabling the participant runner', () => {
    const runtime = createRuntime();

    expect(runtime.status.textContent).toBe('');
    expect(runtime.statusAttributes.role).toBe('status');
    expect(runtime.statusAttributes['aria-live']).toBe('polite');
    expect(runtime.statusAttributes['aria-atomic']).toBe('true');
    expect(runtime.statusAttributes['data-severity']).toBe('information');
    expect(runtime.hideNextButton).toHaveBeenCalledOnce();
    expect(runtime.showNextButton).not.toHaveBeenCalled();
    expect(runtime.iframe.removeAttribute).not.toHaveBeenCalledWith('aria-hidden');

    runtime.timers.find(({ delay }) => delay === 50)!.callback();

    expect(runtime.status.textContent).toContain('Connecting questionnaire package');
    expect(runtime.statusAttributes.role).toBe('status');
    expect(runtime.statusAttributes['aria-live']).toBe('polite');
    expect(runtime.statusAttributes['aria-atomic']).toBe('true');
    expect(runtime.statusAttributes['data-severity']).toBe('information');

    runtime.timers.find(({ delay }) => delay === 8000)!.callback();

    expect(runtime.status.textContent).toContain('questionnaire connection did not start');
    expect(runtime.status.textContent).not.toContain('questionnaire is connected');
    expect(runtime.statusAttributes.role).toBe('alert');
    expect(runtime.statusAttributes['aria-live']).toBe('assertive');
    expect(runtime.statusAttributes['aria-atomic']).toBe('true');
    expect(runtime.statusAttributes['data-severity']).toBe('error');
    expect(runtime.iframe.removeAttribute).not.toHaveBeenCalledWith('aria-hidden');
    expect(runtime.showNextButton).toHaveBeenCalledOnce();
  });

  it('keeps a verified normal connection on status semantics and prevents a delayed Connecting message from overwriting it', () => {
    const runtime = createRuntime();

    runtime.receiveMessage({
      source: runtime.frameWindow,
      origin: 'https://sasoup-yr.github.io',
      data: {
        type: QUALTRICS_CHILD_READY_MESSAGE,
        protocolVersion: 2,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      },
    } as unknown as MessageEvent);

    expect(runtime.status.textContent).toContain('questionnaire is connected');
    expect(runtime.statusAttributes.role).toBe('status');
    expect(runtime.statusAttributes['aria-live']).toBe('off');
    expect(runtime.statusAttributes['aria-atomic']).toBe('true');
    expect(runtime.statusAttributes['data-severity']).toBe('information');
    expect(runtime.iframe.removeAttribute).toHaveBeenCalledWith('aria-hidden');
    expect(runtime.showNextButton).not.toHaveBeenCalled();
    expect(runtime.setJSEmbeddedData).toHaveBeenCalledWith('AQP_BRIDGE_READY', '1');

    runtime.timers.find(({ delay }) => delay === 50)!.callback();

    expect(runtime.status.textContent).toContain('questionnaire is connected');
    expect(runtime.status.textContent).not.toContain('Connecting questionnaire package');
    expect(runtime.statusAttributes.role).toBe('status');
    expect(runtime.statusAttributes['aria-live']).toBe('off');
  });
});
