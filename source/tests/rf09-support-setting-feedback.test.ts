// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/rf09-support-setting-feedback';
import { ensureAccessibilityAnnouncer } from '../src/accessibility-announcer';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';

const AUDIO_ON_MESSAGE =
  'Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.';

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

function supportInput(component: AccessibleNasaTlx, suffix: string) {
  return component.querySelector<HTMLInputElement>(`.support-settings input[id$="-${suffix}"]`)!;
}

function feedback(component: AccessibleNasaTlx) {
  return component.querySelector<HTMLElement>('[data-rf09-support-feedback]')!;
}

function politeLog() {
  return document.querySelector<HTMLElement>('[data-aqp-announcement-priority="polite"]')!;
}

function assertiveLog() {
  return document.querySelector<HTMLElement>('[data-aqp-announcement-priority="assertive"]')!;
}

function installSpeechSynthesis() {
  const spoken: string[] = [];
  const cancel = vi.fn();
  class FakeUtterance {
    lang = '';
    rate = 1;
    voice: SpeechSynthesisVoice | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(public text: string) {}
  }
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      speaking: false,
      pending: false,
      paused: false,
      cancel,
      resume: vi.fn(),
      speak: (utterance: FakeUtterance) => spoken.push(utterance.text),
      getVoices: () => [],
    },
  });
  (globalThis as any).SpeechSynthesisUtterance = FakeUtterance;
  return { spoken, cancel };
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
  localStorage.clear();
  sessionStorage.clear();
  ensureAccessibilityAnnouncer();
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
  it('gives visible and polite feedback for text-size and recovery changes without moving focus or changing an answer', async () => {
    vi.useFakeTimers();
    installSpeechSynthesis();
    const component = await renderComponent();
    await startRatings(component);

    const answer = component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!;
    answer.click();
    await component.updateComplete;
    expect(answer.checked).toBe(true);

    const large = supportInput(component, 'large-text');
    large.focus();
    large.closest('label')!.click();
    await component.updateComplete;

    expect(large.checked).toBe(true);
    expect(document.activeElement).toBe(large);
    expect(answer.checked).toBe(true);
    expect(feedback(component).hidden).toBe(false);
    expect(feedback(component).textContent?.trim()).toBe('Large text selected.');
    expect(politeLog().children).toHaveLength(0);
    expect(assertiveLog().children).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(100);
    expect(politeLog().children).toHaveLength(1);
    expect(politeLog().lastElementChild?.textContent).toBe('Large text selected.');
    expect(assertiveLog().children).toHaveLength(0);

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

    await vi.advanceTimersByTimeAsync(100);
    expect(politeLog().children).toHaveLength(2);
    expect(politeLog().lastElementChild?.textContent).toBe(
      'Interruption recovery is on. Incomplete answers will be stored in this browser.',
    );
    expect(assertiveLog().children).toHaveLength(0);
  });

  it('uses built-in speech for audio-on and one polite message for audio-off while keeping the answer and focus', async () => {
    vi.useFakeTimers();
    const { spoken, cancel } = installSpeechSynthesis();
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
    expect(feedback(component).textContent?.trim()).toBe(AUDIO_ON_MESSAGE);

    await vi.advanceTimersByTimeAsync(100);
    expect(politeLog().children).toHaveLength(0);
    expect(assertiveLog().children).toHaveLength(0);

    audio.closest('label')!.click();
    await component.updateComplete;

    expect(audio.checked).toBe(false);
    expect(document.activeElement).toBe(audio);
    expect(answer.checked).toBe(true);
    expect(cancel).toHaveBeenCalled();
    expect(feedback(component).textContent?.trim()).toBe(
      'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
    );

    await vi.advanceTimersByTimeAsync(100);
    expect(politeLog().children).toHaveLength(1);
    expect(politeLog().lastElementChild?.textContent).toBe(
      'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
    );
    expect(assertiveLog().children).toHaveLength(0);
  });

  it('does not claim a support-setting change for unrelated answer-format controls', async () => {
    vi.useFakeTimers();
    installSpeechSynthesis();
    const component = await renderComponent();

    const smiley = component.querySelector<HTMLInputElement>('.answer-mode-control input[value="smiley"]')!;
    smiley.click();
    await component.updateComplete;
    await vi.advanceTimersByTimeAsync(100);

    expect(smiley.checked).toBe(true);
    expect(feedback(component).hidden).toBe(true);
    expect(feedback(component).textContent?.trim()).toBe('');
    expect(politeLog().children).toHaveLength(0);
    expect(assertiveLog().children).toHaveLength(0);
  });
});
