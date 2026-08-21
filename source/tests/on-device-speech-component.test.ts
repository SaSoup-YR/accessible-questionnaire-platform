// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/accessible-nasa-tlx';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';

async function settle(component: AccessibleNasaTlx) {
  await Promise.resolve();
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  await component.updateComplete;
}

async function startDefaultRating() {
  const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  const start = [...component.querySelectorAll<HTMLButtonElement>('button')]
    .find((button) => button.textContent?.includes('Start the six ratings'));
  expect(start).toBeTruthy();
  start!.click();
  await component.updateComplete;
  return component;
}

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
  delete window.SpeechRecognition;
  delete window.webkitSpeechRecognition;
  delete window.SpeechRecognitionPhrase;
  window.history.replaceState({}, '', '/');
});

describe('RF-07 on-device speech component route', () => {
  it('uses local en-US after the browser reports local en-GB unavailable', async () => {
    const instances: FakeRecognition[] = [];
    class FakeRecognition {
      static available = vi.fn(async ({ langs }: { langs: string[] }) =>
        langs[0] === 'en-GB' ? 'unavailable' as const : 'available' as const);
      lang = '';
      processLocally = false;
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      constructor() {
        instances.push(this);
      }
      start() {
        expect(this.processLocally).toBe(true);
        expect(this.lang).toBe('en-US');
        const result = Object.assign([{ transcript: 'number fifty' }], { length: 1 });
        this.onresult?.({ results: { 0: result, length: 1 } });
      }
      stop() {}
    }
    window.SpeechRecognition = FakeRecognition as any;

    const component = await startDefaultRating();
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await settle(component);

    expect(FakeRecognition.available.mock.calls.map(([options]) => options.langs[0]))
      .toEqual(['en-GB', 'en-US']);
    expect(instances).toHaveLength(1);
    expect(component.textContent).toContain('Proposed answer');
    expect(component.textContent).toContain('value 50');
    expect(component.querySelector<HTMLInputElement>('input[value="50"]')?.checked).toBe(false);
  });

  it('installs a downloadable model without starting or changing an answer', async () => {
    let installed = false;
    let startCount = 0;
    class FakeRecognition {
      static available = vi.fn(async () =>
        installed ? 'available' as const : 'downloadable' as const);
      static install = vi.fn(async () => {
        installed = true;
        return true;
      });
      lang = '';
      processLocally = false;
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        startCount += 1;
      }
      stop() {}
    }
    window.SpeechRecognition = FakeRecognition as any;

    const component = await startDefaultRating();
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await settle(component);

    expect(FakeRecognition.install).toHaveBeenCalledOnce();
    expect(startCount).toBe(0);
    expect(component.textContent).toContain('on-device English speech model (en-GB) is ready');
    expect(component.querySelectorAll<HTMLInputElement>('.rating-option input:checked')).toHaveLength(0);
  });

  it('retries remotely once when a prepared local recognizer rejects its language', async () => {
    const instances: FakeRecognition[] = [];
    class FakeRecognition {
      static available = vi.fn(async () => 'available' as const);
      lang = '';
      processLocally = false;
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      constructor() {
        instances.push(this);
      }
      start() {
        if (this.processLocally) {
          this.onerror?.({ error: 'language-not-supported' });
          return;
        }
        const result = Object.assign([{ transcript: 'number fifty' }], { length: 1 });
        this.onresult?.({ results: { 0: result, length: 1 } });
      }
      stop() {}
    }
    window.SpeechRecognition = FakeRecognition as any;

    const component = await startDefaultRating();
    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await settle(component);
    await settle(component);

    expect(instances).toHaveLength(2);
    expect(instances[0]).toMatchObject({ lang: 'en-GB', processLocally: true });
    expect(instances[1]).toMatchObject({ lang: 'en-GB', processLocally: false });
    expect(FakeRecognition.available).toHaveBeenCalledOnce();
    expect(component.textContent).toContain('Proposed answer');
    expect(component.querySelector<HTMLInputElement>('input[value="50"]')?.checked).toBe(false);
  });
});
