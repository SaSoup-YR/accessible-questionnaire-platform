// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/rf09-support-setting-feedback';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';

const SUPPORT_ANNOUNCEMENT_DELAY_MS = 650;
const AUDIO_ON_MESSAGE =
  'Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.';

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

function supportStatusRegions(component: AccessibleNasaTlx) {
  return [...component.querySelectorAll<HTMLElement>('[data-rf09-support-announcement]')];
}

function supportAnnouncementText(component: AccessibleNasaTlx) {
  return supportStatusRegions(component)
    .map((region) => region.textContent?.trim() ?? '')
    .filter(Boolean);
}

function globalStatusText(component: AccessibleNasaTlx) {
  return component.querySelector<HTMLElement>('main > p.sr-only[aria-live="polite"]')
    ?.textContent?.trim() ?? '';
}

function compactText(element: Element | null) {
  return element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
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
  it('uses unique visible text-size names and an alternating status after native state settles', async () => {
    vi.useFakeTimers();
    installSpeechSynthesis();
    const component = await renderComponent();
    await startRatings(component);

    const standard = supportInput(component, 'standard-text');
    const large = supportInput(component, 'large-text');
    expect(compactText(standard.closest('label'))).toBe('Standard text');
    expect(compactText(large.closest('label'))).toBe('Large text');
    expect(standard.getAttribute('aria-label')).toBe('Standard text');
    expect(large.getAttribute('aria-label')).toBe('Large text');

    const regions = supportStatusRegions(component);
    expect(regions).toHaveLength(2);
    for (const region of regions) {
      expect(region.getAttribute('role')).toBe('status');
      expect(region.getAttribute('aria-live')).toBe('polite');
      expect(region.getAttribute('aria-atomic')).toBe('true');
    }

    const answer = component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!;
    answer.click();
    await component.updateComplete;
    expect(answer.checked).toBe(true);

    large.focus();
    large.closest('label')!.click();
    await component.updateComplete;

    expect(large.checked).toBe(true);
    expect(document.activeElement).toBe(large);
    expect(answer.checked).toBe(true);
    expect(feedback(component).hidden).toBe(false);
    expect(feedback(component).textContent?.trim()).toBe('Large text selected.');
    expect(globalStatusText(component)).toBe('');
    expect(supportAnnouncementText(component)).toEqual([]);

    await vi.advanceTimersByTimeAsync(SUPPORT_ANNOUNCEMENT_DELAY_MS - 1);
    expect(supportAnnouncementText(component)).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    await component.updateComplete;
    expect(supportAnnouncementText(component)).toEqual(['Large text selected.']);

    standard.focus();
    standard.closest('label')!.click();
    await component.updateComplete;

    expect(standard.checked).toBe(true);
    expect(document.activeElement).toBe(standard);
    expect(answer.checked).toBe(true);
    expect(feedback(component).textContent?.trim()).toBe('Standard text selected.');
    expect(globalStatusText(component)).toBe('');
    expect(supportAnnouncementText(component)).toEqual([]);

    await vi.advanceTimersByTimeAsync(SUPPORT_ANNOUNCEMENT_DELAY_MS);
    await component.updateComplete;
    expect(supportAnnouncementText(component)).toEqual(['Standard text selected.']);
  });

  it('gives delayed recovery status without moving focus or changing an answer', async () => {
    vi.useFakeTimers();
    installSpeechSynthesis();
    const component = await renderComponent();
    await startRatings(component);

    const answer = component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!;
    answer.click();
    await component.updateComplete;

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
    expect(globalStatusText(component)).toBe('');
    expect(supportAnnouncementText(component)).toEqual([]);

    await vi.advanceTimersByTimeAsync(SUPPORT_ANNOUNCEMENT_DELAY_MS);
    await component.updateComplete;
    expect(supportAnnouncementText(component)).toEqual([
      'Interruption recovery is on. Incomplete answers will be stored in this browser.',
    ]);
  });

  it('uses built-in speech for audio-on and one delayed status for audio-off', async () => {
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

    await vi.advanceTimersByTimeAsync(SUPPORT_ANNOUNCEMENT_DELAY_MS);
    expect(supportAnnouncementText(component)).toEqual([]);

    audio.closest('label')!.click();
    await component.updateComplete;

    expect(audio.checked).toBe(false);
    expect(document.activeElement).toBe(audio);
    expect(answer.checked).toBe(true);
    expect(cancel).toHaveBeenCalled();
    expect(feedback(component).textContent?.trim()).toBe(
      'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
    );
    expect(supportAnnouncementText(component)).toEqual([]);

    await vi.advanceTimersByTimeAsync(SUPPORT_ANNOUNCEMENT_DELAY_MS);
    await component.updateComplete;
    expect(supportAnnouncementText(component)).toEqual([
      'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.',
    ]);
  });

  it('does not claim a support-setting change for unrelated answer-format controls', async () => {
    vi.useFakeTimers();
    installSpeechSynthesis();
    const component = await renderComponent();

    const smiley = component.querySelector<HTMLInputElement>('.answer-mode-control input[value="smiley"]')!;
    smiley.click();
    await component.updateComplete;
    await vi.advanceTimersByTimeAsync(SUPPORT_ANNOUNCEMENT_DELAY_MS);

    expect(smiley.checked).toBe(true);
    expect(feedback(component).hidden).toBe(true);
    expect(feedback(component).textContent?.trim()).toBe('');
    expect(supportAnnouncementText(component)).toEqual([]);
  });
});
