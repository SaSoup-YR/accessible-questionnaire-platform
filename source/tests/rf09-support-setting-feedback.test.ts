// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/rf09-support-setting-feedback';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';

const SUPPORT_NOTIFICATION_REQUEST_DELAY_MS = 400;
const BUILT_IN_SPEECH_START_GRACE_MS = 800;
const POLYFILL_LIVE_REGION_DELAY_MS = 250;
const AUDIO_ON_MESSAGE =
  'Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.';

type NotificationRecord = {
  target: Element;
  message: string;
  priority: string | undefined;
};

type SpeechMode = 'started' | 'pending';

async function renderComponent() {
  const component = document.createElement('accessible-nasa-tlx') as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  await Promise.resolve();
  return component;
}

async function startRatings(component: AccessibleNasaTlx) {
  const start = [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
    button.textContent?.includes('Start the six ratings'),
  );
  start!.click();
  await component.updateComplete;
  await Promise.resolve();
}

function supportInput(component: AccessibleNasaTlx, suffix: string) {
  return component.querySelector<HTMLInputElement>(`.support-settings input[id$="-${suffix}"]`)!;
}

function feedback(component: AccessibleNasaTlx) {
  return component.querySelector<HTMLElement>('[data-rf09-support-feedback]')!;
}

function globalStatusText(component: AccessibleNasaTlx) {
  return component.querySelector<HTMLElement>('main > p.sr-only[aria-live="polite"]')
    ?.textContent?.trim() ?? '';
}

function compactText(element: Element | null) {
  return element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function installAriaNotifySpy() {
  const records: NotificationRecord[] = [];
  const prototype = Element.prototype as Element & {
    ariaNotify: (
      message: string,
      options?: { priority?: string },
    ) => void;
  };
  const original = prototype.ariaNotify;
  expect(typeof original).toBe('function');

  vi.spyOn(prototype, 'ariaNotify').mockImplementation(function (
    this: Element,
    message: string,
    options?: { priority?: string },
  ) {
    records.push({ target: this, message, priority: options?.priority });
    original.call(this, message, options);
  });

  return records;
}

function installSpeechSynthesis(mode: SpeechMode = 'started') {
  const spoken: string[] = [];
  const state = {
    speaking: false,
    pending: false,
    paused: false,
  };
  const cancel = vi.fn(() => {
    state.speaking = false;
    state.pending = false;
    state.paused = false;
  });
  class FakeUtterance {
    lang = '';
    rate = 1;
    pitch = 1;
    volume = 1;
    voice: SpeechSynthesisVoice | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(public text: string) {}
  }
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      get speaking() {
        return state.speaking;
      },
      get pending() {
        return state.pending;
      },
      get paused() {
        return state.paused;
      },
      cancel,
      resume: vi.fn(() => {
        state.paused = false;
      }),
      speak: (utterance: FakeUtterance) => {
        spoken.push(utterance.text);
        if (mode === 'started') {
          state.speaking = true;
          state.pending = false;
        } else {
          state.speaking = false;
          state.pending = true;
        }
      },
      getVoices: () => [],
    },
  });
  (globalThis as any).SpeechSynthesisUtterance = FakeUtterance;
  return { spoken, cancel, state };
}

async function finishFallbackAnnouncement() {
  await vi.advanceTimersByTimeAsync(POLYFILL_LIVE_REGION_DELAY_MS);
  await Promise.resolve();
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
  delete (window as any).speechSynthesis;
  delete (globalThis as any).SpeechSynthesisUtterance;
  vi.restoreAllMocks();
});

describe('RF-09 support-setting feedback', () => {
  it('uses unique visible text-size names and one normal-priority notification', async () => {
    vi.useFakeTimers();
    installSpeechSynthesis();
    const notifications = installAriaNotifySpy();
    const component = await renderComponent();
    await startRatings(component);

    const standard = supportInput(component, 'standard-text');
    const large = supportInput(component, 'large-text');
    expect(compactText(standard.closest('label'))).toBe('Standard text');
    expect(compactText(large.closest('label'))).toBe('Large text');
    expect(standard.getAttribute('aria-label')).toBe('Standard text');
    expect(large.getAttribute('aria-label')).toBe('Large text');

    const supportFeedback = feedback(component);
    expect(standard.getAttribute('aria-controls')).toBe(supportFeedback.id);
    expect(large.getAttribute('aria-controls')).toBe(supportFeedback.id);

    const answer = component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!;
    answer.click();
    await component.updateComplete;
    expect(answer.checked).toBe(true);
    const legacyStatusBefore = globalStatusText(component);
    expect(legacyStatusBefore).toBe('Mental Demand, 50, selected.');

    large.focus();
    large.closest('label')!.click();
    await component.updateComplete;

    expect(large.checked).toBe(true);
    expect(document.activeElement).toBe(large);
    expect(answer.checked).toBe(true);
    expect(supportFeedback.hidden).toBe(false);
    expect(supportFeedback.textContent?.trim()).toBe('Large text selected.');
    expect(globalStatusText(component)).toBe(legacyStatusBefore);
    expect(notifications).toEqual([]);

    await vi.advanceTimersByTimeAsync(SUPPORT_NOTIFICATION_REQUEST_DELAY_MS - 1);
    expect(notifications).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      target: large,
      message: 'Large text selected.',
      priority: 'normal',
    });
    await finishFallbackAnnouncement();
    expect(
      [...document.body.children].some((element) =>
        element.localName.startsWith('polite-live-region-'),
      ),
    ).toBe(true);

    standard.focus();
    standard.closest('label')!.click();
    await component.updateComplete;

    expect(standard.checked).toBe(true);
    expect(document.activeElement).toBe(standard);
    expect(answer.checked).toBe(true);
    expect(supportFeedback.textContent?.trim()).toBe('Standard text selected.');
    expect(globalStatusText(component)).toBe(legacyStatusBefore);

    await vi.advanceTimersByTimeAsync(SUPPORT_NOTIFICATION_REQUEST_DELAY_MS);
    expect(notifications).toHaveLength(2);
    expect(notifications[1]).toMatchObject({
      target: standard,
      message: 'Standard text selected.',
      priority: 'normal',
    });
    await finishFallbackAnnouncement();
  });

  it('gives recovery feedback without moving focus or changing an answer', async () => {
    vi.useFakeTimers();
    installSpeechSynthesis();
    const notifications = installAriaNotifySpy();
    const component = await renderComponent();
    await startRatings(component);

    const answer = component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!;
    answer.click();
    await component.updateComplete;
    const legacyStatusBefore = globalStatusText(component);

    const recovery = supportInput(component, 'recovery');
    recovery.focus();
    recovery.closest('label')!.click();
    await component.updateComplete;

    expect(recovery.checked).toBe(true);
    expect(document.activeElement).toBe(recovery);
    expect(answer.checked).toBe(true);
    expect(feedback(component).textContent?.trim()).toBe(
      'Interruption recovery is on. Incomplete answers will be stored in this browser.',
    );
    expect(globalStatusText(component)).toBe(legacyStatusBefore);

    await vi.advanceTimersByTimeAsync(SUPPORT_NOTIFICATION_REQUEST_DELAY_MS);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      target: recovery,
      message: 'Interruption recovery is on. Incomplete answers will be stored in this browser.',
      priority: 'normal',
    });
    await finishFallbackAnnouncement();
  });

  it('keeps built-in speech as the sole AQP channel when speech actually starts, then notifies audio-off once', async () => {
    vi.useFakeTimers();
    const { spoken, cancel, state } = installSpeechSynthesis('started');
    const notifications = installAriaNotifySpy();
    const component = await renderComponent();
    await startRatings(component);

    const answer = component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!;
    answer.click();
    await component.updateComplete;

    const audio = supportInput(component, 'audio');
    audio.focus();
    audio.closest('label')!.click();
    await component.updateComplete;

    expect(audio.checked).toBe(true);
    expect(document.activeElement).toBe(audio);
    expect(answer.checked).toBe(true);
    expect(spoken.at(-1)).toBe(AUDIO_ON_MESSAGE);
    expect(state.speaking).toBe(true);
    expect(feedback(component).textContent?.trim()).toBe(AUDIO_ON_MESSAGE);

    await vi.advanceTimersByTimeAsync(
      BUILT_IN_SPEECH_START_GRACE_MS + POLYFILL_LIVE_REGION_DELAY_MS,
    );
    expect(notifications).toEqual([]);

    audio.closest('label')!.click();
    await component.updateComplete;

    expect(audio.checked).toBe(false);
    expect(document.activeElement).toBe(audio);
    expect(answer.checked).toBe(true);
    expect(cancel).toHaveBeenCalled();
    expect(feedback(component).textContent?.trim()).toBe(
      'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
    );

    await vi.advanceTimersByTimeAsync(SUPPORT_NOTIFICATION_REQUEST_DELAY_MS);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      target: audio,
      message: 'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
      priority: 'normal',
    });
    await finishFallbackAnnouncement();
  });

  it('falls back to ariaNotify when built-in speech is queued but never actually starts', async () => {
    vi.useFakeTimers();
    const { spoken, cancel, state } = installSpeechSynthesis('pending');
    const notifications = installAriaNotifySpy();
    const component = await renderComponent();
    await startRatings(component);

    const answer = component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!;
    answer.click();
    await component.updateComplete;

    const audio = supportInput(component, 'audio');
    audio.focus();
    audio.closest('label')!.click();
    await component.updateComplete;

    expect(audio.checked).toBe(true);
    expect(document.activeElement).toBe(audio);
    expect(answer.checked).toBe(true);
    expect(spoken.at(-1)).toBe(AUDIO_ON_MESSAGE);
    expect(state.speaking).toBe(false);
    expect(state.pending).toBe(true);
    expect(feedback(component).textContent?.trim()).toBe(AUDIO_ON_MESSAGE);

    await vi.advanceTimersByTimeAsync(BUILT_IN_SPEECH_START_GRACE_MS - 1);
    expect(notifications).toEqual([]);
    expect(cancel).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(state.pending).toBe(false);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({
      target: audio,
      message: AUDIO_ON_MESSAGE,
      priority: 'normal',
    });
    await finishFallbackAnnouncement();
  });

  it('does not claim a support-setting change for unrelated answer-format controls', async () => {
    vi.useFakeTimers();
    installSpeechSynthesis();
    const notifications = installAriaNotifySpy();
    const component = await renderComponent();

    const smiley = component.querySelector<HTMLInputElement>('.answer-mode-control input[value="smiley"]')!;
    smiley.click();
    await component.updateComplete;
    await vi.advanceTimersByTimeAsync(
      SUPPORT_NOTIFICATION_REQUEST_DELAY_MS + POLYFILL_LIVE_REGION_DELAY_MS,
    );

    expect(smiley.checked).toBe(true);
    expect(feedback(component).hidden).toBe(true);
    expect(feedback(component).textContent?.trim()).toBe('');
    expect(notifications).toEqual([]);
  });
});
