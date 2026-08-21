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
      setProperty(property: string, value: string) { values[property] = value; },
      getPropertyValue(property: string) { return values[property] ?? ''; },
      getPropertyPriority() { return ''; },
    },
  };
}

function createRuntime() {
  const bridge = readFileSync(
    resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
    'utf8',
  );
  let onReady: (() => void) | undefined;
  let onUnload: (() => void) | undefined;
  let receiveMessage: ((event: MessageEvent) => void) | undefined;
  const timers: Array<{ callback: () => void; delay: number }> = [];
  const frameWindow = { postMessage: vi.fn() };
  const iframeStyle = trackedStyle();
  const liveStyle = trackedStyle();
  const statusStyle = trackedStyle();
  const bodyStyle = trackedStyle();
  const htmlStyle = trackedStyle();
  const statusAttributes: Record<string, string> = {};
  const announcerAttributes: Record<string, string> = {};
  const originalParent = {
    appendChild(node: any) { node.parentNode = originalParent; },
    insertBefore(node: any) { node.parentNode = originalParent; },
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
    setAttribute(name: string, value: string) { statusAttributes[name] = value; },
  };
  const body: any = {
    style: bodyStyle.style,
    children: [] as any[],
    appendChild(node: any) {
      node.parentNode = body;
      if (!body.children.includes(node)) body.children.push(node);
    },
    removeChild(node: any) {
      body.children = body.children.filter((entry: any) => entry !== node);
      node.parentNode = null;
    },
  };
  const announcer: any = {
    textContent: '',
    style: {},
    parentNode: null,
    setAttribute(name: string, value: string) { announcerAttributes[name] = value; },
    remove: vi.fn(function removeAnnouncer() {
      if (announcer.parentNode?.removeChild) announcer.parentNode.removeChild(announcer);
    }),
  };
  const documentRef = {
    body,
    documentElement: { style: htmlStyle.style },
    createElement(tagName: string) {
      if (tagName !== 'div') throw new Error(`Unexpected test element ${tagName}`);
      return announcer;
    },
    getElementById(id: string) {
      if (id === 'accessible-questionnaire-frame') return iframe;
      if (id === 'accessible-questionnaire-collection-status') return status;
      if (id === 'accessible-questionnaire-live-question') return liveQuestion;
      if (id === 'accessible-questionnaire-recorded-summary') return { getAttribute: () => '0' };
      return null;
    },
  };
  const hideNextButton = vi.fn();
  const showNextButton = vi.fn();
  const clickNextButton = vi.fn();
  const setJSEmbeddedData = vi.fn();
  const fakeQualtrics = {
    SurveyEngine: {
      addOnReady(callback: () => void) { onReady = callback; },
      addOnUnload(callback: () => void) { onUnload = callback; },
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

  new Function('Qualtrics', 'document', 'window', bridge)(fakeQualtrics, documentRef, fakeWindow);
  onReady!.call({ hideNextButton, showNextButton, clickNextButton });

  return {
    timers,
    frameWindow,
    iframe,
    status,
    statusAttributes,
    announcer,
    announcerAttributes,
    hideNextButton,
    showNextButton,
    setJSEmbeddedData,
    receiveMessage: (event: MessageEvent) => receiveMessage!(event),
    unload: () => onUnload!(),
  };
}

describe('RF-01 successor Qualtrics connection announcement', () => {
  it('uses one pre-registered body-level polite channel for Connecting while retaining assertive failure', () => {
    const runtime = createRuntime();
    expect(runtime.status.textContent).toBe('');
    expect(runtime.statusAttributes.role).toBe('status');
    expect(runtime.statusAttributes['aria-live']).toBe('off');
    expect(runtime.statusAttributes['aria-atomic']).toBe('true');
    expect(runtime.announcer.textContent).toBe('');
    expect(runtime.announcerAttributes.role).toBe('status');
    expect(runtime.announcerAttributes['aria-live']).toBe('polite');
    expect(runtime.announcerAttributes['aria-atomic']).toBe('true');
    expect(runtime.hideNextButton).toHaveBeenCalledOnce();
    expect(runtime.iframe.removeAttribute).not.toHaveBeenCalledWith('aria-hidden');

    runtime.timers.find(({ delay }) => delay === 250)!.callback();
    expect(runtime.status.textContent).toContain('Connecting questionnaire package');
    expect(runtime.announcer.textContent).toBe(runtime.status.textContent);
    expect(runtime.statusAttributes['aria-live']).toBe('off');

    runtime.timers.find(({ delay }) => delay === 8000)!.callback();
    expect(runtime.status.textContent).toContain('questionnaire connection did not start');
    expect(runtime.statusAttributes.role).toBe('alert');
    expect(runtime.statusAttributes['aria-live']).toBe('assertive');
    expect(runtime.statusAttributes['data-severity']).toBe('error');
    expect(runtime.iframe.removeAttribute).not.toHaveBeenCalledWith('aria-hidden');
    expect(runtime.showNextButton).toHaveBeenCalledOnce();
  });

  it('cancels the pending advisory if the verified child connects first', () => {
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
    expect(runtime.statusAttributes['aria-live']).toBe('off');
    expect(runtime.announcer.textContent).toBe('');
    expect(runtime.iframe.removeAttribute).toHaveBeenCalledWith('aria-hidden');
    expect(runtime.setJSEmbeddedData).toHaveBeenCalledWith('AQP_BRIDGE_READY', '1');

    runtime.timers.find(({ delay }) => delay === 250)!.callback();
    expect(runtime.status.textContent).toContain('questionnaire is connected');
    expect(runtime.status.textContent).not.toContain('Connecting questionnaire package');
    expect(runtime.announcer.textContent).toBe('');
  });

  it('removes the scoped announcer on Qualtrics unload', () => {
    const runtime = createRuntime();
    expect(runtime.announcer.parentNode).not.toBeNull();
    runtime.unload();
    expect(runtime.announcer.remove).toHaveBeenCalledOnce();
    expect(runtime.announcer.parentNode).toBeNull();
  });
});
