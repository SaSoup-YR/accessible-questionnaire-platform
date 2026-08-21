// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/rf06-speech-lifecycle';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';

interface FakeRecognitionInstance {
  stopCalls: number;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

async function renderComponent() {
  const component = document.createElement('accessible-nasa-tlx') as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  return component;
}

async function startRatings(component: AccessibleNasaTlx) {
  const start = [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
    button.textContent?.includes('Start the six ratings'),
  );
  start!.click();
  await component.updateComplete;
}

function installHangingRecognition() {
  const instances: FakeRecognitionInstance[] = [];
  class FakeRecognition {
    lang = '';
    continuous = false;
    interimResults = false;
    maxAlternatives = 1;
    onresult: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onend: (() => void) | null = null;
    stopCalls = 0;

    constructor() {
      instances.push(this);
    }

    start() {
      // Deliberately never returns a result/error/end event. This models the
      // persistent Safari-style Listening state found in the frozen audit.
    }

    stop() {
      this.stopCalls += 1;
    }
  }
  window.webkitSpeechRecognition = FakeRecognition as any;
  return instances;
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
  localStorage.clear();
  sessionStorage.clear();
  delete window.webkitSpeechRecognition;
  delete window.SpeechRecognition;
  vi.restoreAllMocks();
});

describe('RF-06 speech listening lifecycle', () => {
  it('creates a delayed Listening mutation and exposes an explicit Stop control while answers remain usable', async () => {
    vi.useFakeTimers();
    const instances = installHangingRecognition();
    const component = await renderComponent();
    await startRatings(component);

    const voiceDetails = component.querySelector<HTMLDetailsElement>('.voice-input')!;
    voiceDetails.open = true;
    const status = component.querySelector<HTMLElement>('.voice-status');
    expect(status).not.toBeNull();
    expect(status?.textContent?.trim()).toBe('');
    const alert = component.querySelector<HTMLElement>('.voice-alert');
    expect(alert).not.toBeNull();
    expect(alert?.getAttribute('role')).toBe('alert');
    expect(alert?.textContent?.trim()).toBe('');

    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;

    expect(component.querySelector('.voice-status')?.textContent?.trim()).toBe('');
    const stop = component.querySelector<HTMLButtonElement>('[data-voice-stop]');
    expect(stop?.textContent?.trim()).toBe('Stop voice input');
    expect(stop?.disabled).toBe(false);
    expect(component.querySelector<HTMLButtonElement>('[data-voice-start]')?.disabled).toBe(true);
    expect(component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')?.disabled).toBe(false);
    expect(component.querySelectorAll<HTMLInputElement>('.rating-option input:checked')).toHaveLength(0);
    expect(instances).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(650);
    await component.updateComplete;
    expect(component.querySelector('.voice-status')?.textContent).toContain('Listening for one answer.');

    stop!.click();
    await component.updateComplete;

    expect(instances[0].stopCalls).toBe(1);
    expect(component.querySelector('.voice-status')?.textContent).toContain('Voice input stopped.');
    expect(component.querySelector('.voice-status')?.textContent).toContain('No answer was changed.');
    expect(component.querySelector('.voice-alert')?.textContent?.trim()).toBe('');
    expect(component.querySelectorAll<HTMLInputElement>('.rating-option input:checked')).toHaveLength(0);
    expect(component.querySelector<HTMLButtonElement>('[data-voice-start]')?.disabled).toBe(false);
    expect(component.querySelector('[data-voice-stop]')).toBeNull();
  });

  it('ends a browser that never fires onend with the AQP watchdog and exposes delayed specific no-speech recovery', async () => {
    vi.useFakeTimers();
    const instances = installHangingRecognition();
    const component = await renderComponent();
    await startRatings(component);

    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    await vi.advanceTimersByTimeAsync(650);
    await component.updateComplete;
    expect(component.querySelector('.voice-status')?.textContent).toContain('Listening for one answer.');

    await vi.advanceTimersByTimeAsync(14_350);
    await component.updateComplete;
    expect(instances[0].stopCalls).toBe(1);
    expect(component.querySelector('.voice-status')?.textContent?.trim()).toBe('');
    expect(component.querySelector('[data-voice-stop]')).toBeNull();

    await vi.advanceTimersByTimeAsync(650);
    await component.updateComplete;

    const message = component.querySelector('.voice-alert')?.textContent ?? '';
    expect(message).toContain('No speech was detected before the listening time limit.');
    expect(message).toContain('Voice input stopped.');
    expect(message).toContain('No answer was changed.');
    expect(component.querySelector('.voice-status')?.textContent?.trim()).toBe('');
    expect(component.querySelectorAll<HTMLInputElement>('.rating-option input:checked')).toHaveLength(0);
    expect(component.querySelector<HTMLButtonElement>('[data-voice-start]')?.disabled).toBe(false);
  });

  it('turns native no-speech end into a separate specific recovery announcement and cancels the watchdog', async () => {
    vi.useFakeTimers();
    const instances = installHangingRecognition();
    const component = await renderComponent();
    await startRatings(component);

    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    const nativeEnd = instances[0].onend;
    expect(nativeEnd).not.toBeNull();

    nativeEnd!();
    await component.updateComplete;
    expect(component.querySelector('.voice-status')?.textContent?.trim()).toBe('');

    await vi.advanceTimersByTimeAsync(650);
    await component.updateComplete;

    const message = component.querySelector('.voice-alert')?.textContent ?? '';
    expect(message).toContain('No speech was detected.');
    expect(message).toContain('Try again, or use a visible answer button.');
    expect(message).toContain('No answer was changed.');
    expect(component.querySelector('.voice-status')?.textContent?.trim()).toBe('');
    expect(component.querySelectorAll<HTMLInputElement>('.rating-option input:checked')).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(20_000);
    await component.updateComplete;
    expect(instances[0].stopCalls).toBe(1);
    expect(component.querySelector('.voice-alert')?.textContent).toContain('No speech was detected.');
  });

  it('normalises a native no-speech error into the same safe A13 recovery state', async () => {
    vi.useFakeTimers();
    const instances = installHangingRecognition();
    const component = await renderComponent();
    await startRatings(component);

    component.querySelector<HTMLButtonElement>('[data-voice-start]')!.click();
    await component.updateComplete;
    const noSpeech = instances[0].onerror;
    expect(noSpeech).not.toBeNull();

    noSpeech!({ error: 'no-speech' });
    await component.updateComplete;
    expect(component.querySelector('.voice-status')?.textContent?.trim()).toBe('');

    await vi.advanceTimersByTimeAsync(650);
    await component.updateComplete;
    const message = component.querySelector('.voice-alert')?.textContent ?? '';
    expect(message).toContain('No speech was detected.');
    expect(message).toContain('No answer was changed.');
    expect(component.querySelector('.voice-status')?.textContent?.trim()).toBe('');
    expect(instances[0].stopCalls).toBe(1);
    expect(component.querySelectorAll<HTMLInputElement>('.rating-option input:checked')).toHaveLength(0);
  });
});
