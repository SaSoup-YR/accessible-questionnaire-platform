// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../src/accessible-nasa-tlx';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import {
  QUALTRICS_BRIDGE_BUILD,
  QUALTRICS_CHILD_READY_MESSAGE,
  QUALTRICS_PARENT_READY_MESSAGE,
} from '../src/result-sink';
import {
  buildParticipantUrl,
  createStudyConfig,
  loadCompletedResults,
  type ParticipantAdjustmentPolicy,
  type StudyResultRecord,
} from '../src/study';

async function renderConfiguredComponent(
  participantAdjustmentPolicy: ParticipantAdjustmentPolicy = 'locked',
  prefilledParticipantCode?: string,
) {
  const config = createStudyConfig(
    {
      studyId: 'STUDY-01',
      studyTitle: 'Configured NASA-TLX study',
      taskLabel: 'the route-planning task',
      showScoreToParticipant: false,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: true,
        audioGuidance: false,
        recoveryEnabled: true,
        participantAdjustmentPolicy,
        voiceInputAvailable: false,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    },
    { configId: 'config-study-01', createdAt: '2026-07-20T12:00:00.000Z' },
  );
  const url = buildParticipantUrl(window.location.href, config, prefilledParticipantCode);
  window.history.replaceState({}, '', new URL(url).pathname + new URL(url).hash);
  const component = document.createElement('accessible-nasa-tlx') as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  return component;
}

async function completeQuestionnaire(component: AccessibleNasaTlx) {
  const code = component.querySelector<HTMLInputElement>('#participant-code')!;
  code.value = 'P-007';
  code.dispatchEvent(new Event('input', { bubbles: true }));
  await component.updateComplete;
  [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes('Start the six ratings'))!.click();
  await component.updateComplete;
  for (let index = 0; index < 6; index += 1) {
    component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!.click();
    await component.updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes(index === 5 ? 'Continue to comparisons' : 'Next question'),
    )!.click();
    await component.updateComplete;
  }
  expect(component.querySelector('.choice-fieldset')).not.toBeNull();
  expect(component.querySelectorAll('.audio-guidance')).toHaveLength(0);
  for (let index = 0; index < 15; index += 1) {
    component.querySelector<HTMLInputElement>('.choice-card input')!.click();
    await component.updateComplete;
    [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes(index === 14 ? 'Review responses' : 'Next question'),
    )!.click();
    await component.updateComplete;
  }
  expect(component.querySelector('#review-heading')).not.toBeNull();
  expect(component.querySelectorAll('.audio-guidance')).toHaveLength(0);
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/');
  delete (window as any).speechSynthesis;
  delete window.accessibleQuestionnaireResultSink;
  delete window.accessibleNasaTlxResultSink;
  Object.defineProperty(window, 'parent', {
    configurable: true,
    value: window,
  });
  delete (globalThis as any).SpeechSynthesisUtterance;
  vi.restoreAllMocks();
});

describe('study-conductor and participant separation', () => {
  it('keeps the participant start control unavailable until the exact Qualtrics bridge connects', async () => {
    const parentOrigin = 'https://ucl-example.eu.qualtrics.com';
    const parentWindow = { postMessage: vi.fn() };
    Object.defineProperty(window, 'parent', {
      configurable: true,
      value: parentWindow,
    });
    const config = createStudyConfig(
      {
        studyId: 'STUDY-Q2',
        studyTitle: 'Configured Qualtrics study',
        taskLabel: 'the route-planning task',
        showScoreToParticipant: false,
        support: {
          showSimpleLanguage: false,
          answerMode: 'standard',
          largeText: false,
          audioGuidance: false,
          recoveryEnabled: true,
          participantAdjustmentPolicy: 'locked',
          voiceInputAvailable: false,
          gazeInputAvailable: false,
        },
        collection: { mode: 'qualtrics', parentOrigin },
      },
      { configId: 'config-q2', createdAt: '2026-07-28T17:00:00.000Z' },
    );
    const url = buildParticipantUrl(window.location.href, config);
    window.history.replaceState({}, '', new URL(url).pathname + new URL(url).hash);
    const component = document.createElement('accessible-nasa-tlx') as AccessibleNasaTlx;
    document.body.append(component);
    await component.updateComplete;

    const start = [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the six ratings'))!;
    expect(start.disabled).toBe(true);
    expect(component.textContent).toContain('Checking secure result collection');

    window.dispatchEvent(new MessageEvent('message', {
      origin: parentOrigin,
      source: parentWindow as unknown as Window,
      data: {
        type: QUALTRICS_PARENT_READY_MESSAGE,
        protocolVersion: 2,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      },
    }));
    await component.updateComplete;

    expect(start.disabled).toBe(false);
    expect(parentWindow.postMessage).toHaveBeenCalledWith(
      {
        type: QUALTRICS_CHILD_READY_MESSAGE,
        protocolVersion: 2,
        bridgeBuild: QUALTRICS_BRIDGE_BUILD,
      },
      parentOrigin,
    );
  });

  it('speaks the configured task on the first participant-page request without pre-cancelling speech', async () => {
    const spoken: FakeUtterance[] = [];
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
        speak: (utterance: FakeUtterance) => spoken.push(utterance),
        getVoices: () => [
          { lang: 'en-GB', name: 'Compact voice', default: false } as SpeechSynthesisVoice,
        ],
      },
    });
    (globalThis as any).SpeechSynthesisUtterance = FakeUtterance;

    const component = await renderConfiguredComponent();
    const summary = [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes('Hear a summary of this step'),
    )!;
    summary.click();
    await component.updateComplete;

    expect(spoken[0].text).toContain('Think about the route-planning task');
    expect(spoken[0].voice).toBeNull();
    expect(spoken[0].rate).toBe(1);
    expect(cancel).not.toHaveBeenCalled();
    expect(component.querySelector('.audio-status')?.textContent).toContain('Playing spoken guidance');
  });

  it('restores the pseudonymous code in the same tab before offering interrupted answers', async () => {
    const component = await renderConfiguredComponent();
    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-007';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    await component.updateComplete;

    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the six ratings'))!
      .click();
    await component.updateComplete;
    component.querySelector<HTMLInputElement>('.rating-option input[value="50"]')!.click();
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Next question'))!
      .click();
    await component.updateComplete;
    component.remove();

    const restored = await renderConfiguredComponent();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await restored.updateComplete;

    expect(restored.querySelector<HTMLInputElement>('#participant-code')?.value).toBe('P-007');
    expect(restored.querySelector('.restored-code-note')?.textContent).toContain(
      'restored for this tab',
    );
    expect(restored.querySelector('.saved-session')?.textContent).toContain('1 of 21');
    expect(document.activeElement).toBe(restored.querySelector('#saved-session-offer'));
    expect(restored.querySelector('#resume-saved-questionnaire')?.getAttribute('aria-describedby')).toBe(
      'saved-session-count saved-session-actions',
    );
  });

  it('applies a locked configuration and requires a pseudonymous participant code', async () => {
    const component = await renderConfiguredComponent();
    expect(component.textContent).toContain('Configured NASA-TLX study');
    expect(component.textContent).toContain('the route-planning task');
    expect(component.querySelector('main')?.classList.contains('large-text')).toBe(true);
    expect(component.querySelector('.support-settings')).toBeNull();
    expect(component.textContent).toContain('Experimental gaze input not included');

    [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes('Start the six ratings'))!.click();
    await component.updateComplete;
    expect(component.querySelector('#error-summary')?.textContent).toContain('pseudonymous participant code');
    expect(component.querySelector('.step-label')).toBeNull();
  });

  it('prefills an editable pseudonymous code from the participant-specific link', async () => {
    const component = await renderConfiguredComponent('locked', 'P-PREFILLED-01');
    const code = component.querySelector<HTMLInputElement>('#participant-code')!;
    expect(code.value).toBe('P-PREFILLED-01');
    expect(code.readOnly).toBe(false);
    expect(component.querySelector<HTMLDetailsElement>('.participant-support-setup')?.open).toBe(false);
    expect(component.querySelectorAll('.audio-guidance')).toHaveLength(1);
    expect(component.querySelector('.process-overview')).toBeNull();
    expect(component.querySelector('.factor-reference')).toBeNull();

    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the six ratings'))!
      .click();
    await component.updateComplete;

    expect(component.querySelector('#error-summary')).toBeNull();
    expect(component.querySelector('.step-label')?.textContent).toContain('Rating 1 of 6');
    expect(component.querySelectorAll('.audio-guidance')).toHaveLength(0);
  });

  it('treats the participant-specific link code as authoritative over stale tab data', async () => {
    sessionStorage.setItem(
      'accessible-questionnaire-v0.8-tab-participant:config-study-01',
      'P-OLD-TAB-01',
    );

    const component = await renderConfiguredComponent('locked', 'P-NEW-LINK-02');
    expect(component.querySelector<HTMLInputElement>('#participant-code')?.value)
      .toBe('P-NEW-LINK-02');
    expect(component.querySelector('.restored-code-note')).toBeNull();

    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Start the six ratings'))!
      .click();
    await component.updateComplete;

    expect(component.querySelector('#error-summary')).toBeNull();
    expect(sessionStorage.getItem(
      'accessible-questionnaire-v0.8-tab-participant:config-study-01',
    )).toBe('P-NEW-LINK-02');
  });

  it('blocks submission and exposes an actionable error when the definition hash is stale', async () => {
    const component = await renderConfiguredComponent('locked', 'P-HASH-01');
    await completeQuestionnaire(component);
    const currentConfig = (component as any).studyConfig;
    (component as any).studyConfig = {
      ...currentConfig,
      definitionHash: `sha256:${'0'.repeat(64)}`,
    };

    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit responses'))!
      .click();
    await component.updateComplete;

    const error = component.querySelector<HTMLElement>('#error-summary');
    expect(error?.textContent).toContain(
      'questionnaire definition does not match the saved study configuration',
    );
    expect(document.activeElement).toBe(error);
    expect(component.querySelector('#complete-heading')).toBeNull();
    expect(loadCompletedResults()).toEqual([]);
  });

  it('allows only presentation preferences when the conductor permits participant personalisation', async () => {
    const component = await renderConfiguredComponent('presentation-only');
    const settings = component.querySelector('.participant-support-setup .support-settings')!;

    expect(settings.textContent).toContain('Text size');
    expect(settings.textContent).toContain('Save progress and show a return summary');
    expect(settings.textContent).not.toContain('Show simpler explanations');
    expect(settings.textContent).not.toContain('Smiley landmarks');
    expect(component.textContent).toContain('answer presentation and simpler-explanation setting remain fixed');
    expect(settings.textContent).toContain('Read new questions and feedback aloud');
  });

  it('starts from prepared defaults, allows optional support choice and exports every participant change', async () => {
    const component = await renderConfiguredComponent('participant-choice');
    const settings = component.querySelector('.participant-support-setup .support-settings')!;
    expect(settings.textContent).not.toContain('Show simpler explanations');
    expect(settings.textContent).toContain('Smiley landmarks');
    expect(component.textContent).toContain('starting settings are already applied');

    const smiley = [...settings.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
      .find((input) => input.value === 'smiley')!;
    smiley.click();
    await component.updateComplete;

    await completeQuestionnaire(component);
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit'))!
      .click();
    await component.updateComplete;

    const [stored] = loadCompletedResults();
    expect(stored.configuration.showSimpleLanguage).toBe(false);
    expect(stored.supportMetadata.simplerExplanationsShownAtSubmission).toBe(false);
    expect(stored.supportMetadata.answerModeAtSubmission).toBe('smiley');
    expect(stored.supportMetadata.supportChanges.map(({ setting }) => setting)).toEqual([
      'answer-mode',
    ]);
    expect(stored.supportMetadata.supportChanges.every(({ stage }) => stage === 'intro')).toBe(true);
  });

  it('stores the complete record locally, emits the host event and hides the score when configured', async () => {
    const component = await renderConfiguredComponent();
    const emitted: StudyResultRecord[] = [];
    component.addEventListener('nasa-tlx-complete', (event) => { emitted.push((event as CustomEvent<StudyResultRecord>).detail); });
    await completeQuestionnaire(component);
    [...component.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.includes('Calculate and submit'))!.click();
    await component.updateComplete;

    const stored = loadCompletedResults();
    expect(stored).toHaveLength(1);
    expect(stored[0].participantCode).toBe('P-007');
    expect(stored[0].responses.pairPresentationOrder).toHaveLength(15);
    expect(stored[0].result.ratings.mental).toBe(50);
    expect(emitted[0].submissionId).toBe(stored[0].submissionId);
    expect(component.querySelector('.save-status')?.textContent).toContain('stored only in this browser');
    expect(component.querySelector('.score')).toBeNull();
    expect(component.textContent).toContain('Download CSV backup');
  });

  it('creates a local backup before asking the approved host to collect the response', async () => {
    const component = await renderConfiguredComponent();
    const submitted: StudyResultRecord[] = [];
    const speak = vi.fn();
    class FakeUtterance {
      lang = '';
      rate = 1;
      pitch = 1;
      volume = 1;
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
        cancel: vi.fn(),
        speak,
      },
    });
    (globalThis as any).SpeechSynthesisUtterance = FakeUtterance;
    window.accessibleNasaTlxResultSink = {
      name: 'UCL approved test platform',
      async submit(record) {
        const [backup] = loadCompletedResults();
        expect(backup?.submissionId).toBe(record.submissionId);
        submitted.push(record);
        return {
          accepted: true,
          submissionId: record.submissionId,
          receiptId: 'receipt-001',
        };
      },
    };

    await completeQuestionnaire(component);
    (component as any).audioGuidance = true;
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit'))!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await component.updateComplete;

    expect(submitted).toHaveLength(1);
    expect(loadCompletedResults()).toHaveLength(1);
    expect(component.querySelector('.save-status')?.textContent).toContain('Submitting response');
    expect(component.querySelector('.save-status')?.textContent).toContain('No action is needed');
    expect(component.querySelector('.save-status')?.textContent).not.toContain('keep this page open');
    expect(component.querySelector('.save-status')?.hasAttribute('role')).toBe(false);
    expect(component.textContent).not.toContain('Scheduled for automatic completion');
    expect(component.textContent).toContain('Download JSON backup');
    expect(component.textContent).toContain('Download CSV backup');
    expect(component.querySelector('.submission-fallback')?.textContent).toContain(
      'If this page does not continue',
    );
    expect(component.querySelector('.submission-fallback')?.textContent).toContain(
      'Wait for the error instructions',
    );
    expect((component as any).currentStepSpeech()).toBe(
      'Submitting response. No action is needed.',
    );
    expect(
      speak.mock.calls.map(([utterance]) => (utterance as FakeUtterance).text),
    ).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Submitting response|keep this page open/i),
      ]),
    );
  });

  it('replaces provisional completion feedback with a visible and spoken failure correction', async () => {
    const component = await renderConfiguredComponent();
    const spoken: string[] = [];
    class FakeUtterance {
      lang = '';
      rate = 1;
      pitch = 1;
      volume = 1;
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
        cancel: vi.fn(),
        speak: (utterance: FakeUtterance) => spoken.push(utterance.text),
      },
    });
    (globalThis as any).SpeechSynthesisUtterance = FakeUtterance;
    window.accessibleNasaTlxResultSink = {
      name: 'UCL Qualtrics',
      async submit(record) {
        return {
          accepted: true,
          submissionId: record.submissionId,
          receiptId: 'receipt-before-offline-failure',
        };
      },
    };

    await completeQuestionnaire(component);
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit'))!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await component.updateComplete;

    (component as any).remoteRecordingUnconfirmed = true;
    (component as any).statusMessage =
      'Internet connection unavailable. Qualtrics has not recorded this response. A complete backup is saved on this device. Reconnect, keep this page open, then select Next to try again. You may download a backup before closing.';
    (component as any).audioGuidance = true;
    (component as any).announceAutomatic((component as any).currentStepSpeech());
    await component.updateComplete;

    expect(component.querySelector('#remote-recording-error')?.textContent).toContain(
      'Qualtrics has not confirmed a recorded response',
    );
    expect(component.querySelector('#remote-recording-error')?.textContent).toContain(
      'Reconnect to the internet',
    );
    expect(component.querySelector('.submission-fallback')?.textContent).toContain(
      'Download JSON backup',
    );
    expect((component as any).currentStepSpeech()).toBe(
      'Internet connection unavailable. Qualtrics has not recorded this response. A complete backup is saved on this device. Reconnect, keep this page open, then select Next to try again. You may download a backup before closing.',
    );
    expect(spoken).toEqual([
      'Internet connection unavailable. Qualtrics has not recorded this response. A complete backup is saved on this device. Reconnect, keep this page open, then select Next to try again. You may download a backup before closing.',
    ]);
  });

  it('makes the completed backup recoverable after the accepted page is closed and reopened', async () => {
    const component = await renderConfiguredComponent();
    window.accessibleNasaTlxResultSink = {
      name: 'UCL approved test platform',
      async submit(record) {
        return {
          accepted: true,
          submissionId: record.submissionId,
          receiptId: 'receipt-before-close',
        };
      },
    };
    await completeQuestionnaire(component);
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit'))!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await component.updateComplete;
    const submissionId = loadCompletedResults()[0].submissionId;

    component.remove();
    const reopened = await renderConfiguredComponent();
    const code = reopened.querySelector<HTMLInputElement>('#participant-code')!;
    code.value = 'P-007';
    code.dispatchEvent(new Event('input', { bubbles: true }));
    await reopened.updateComplete;

    expect(reopened.querySelector('.completed-backup')?.textContent).toContain(submissionId);
    expect(reopened.querySelector('.completed-backup')?.textContent).toContain(
      'does not prove that Qualtrics recorded',
    );
    expect(reopened.querySelector('.completed-backup')?.textContent).toContain(
      'Download recovered JSON',
    );
  });

  it('keeps answers, navigation and backup routes available when the network or host fails', async () => {
    const component = await renderConfiguredComponent();
    window.accessibleNasaTlxResultSink = {
      name: 'Unavailable platform',
      async submit() {
        throw new Error('The platform is unavailable.');
      },
    };

    await completeQuestionnaire(component);
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit'))!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await component.updateComplete;

    expect(component.querySelector('#review-heading')).not.toBeNull();
    expect(component.querySelector('#error-summary')?.textContent).toContain('answers remain on this page');
    expect(document.activeElement).toBe(component.querySelector('#error-summary'));
    expect(loadCompletedResults()).toHaveLength(1);
    expect(component.querySelector('.submission-recovery')?.textContent).toContain(
      'not confirmed this response',
    );
    expect(component.querySelector('.submission-recovery')?.textContent).toContain(
      'Download JSON backup',
    );
    expect(component.querySelector('.submission-recovery')?.textContent).toContain(
      'Download CSV backup',
    );
    expect(
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .some((button) => button.textContent?.includes('Return to ratings')),
    ).toBe(true);
    expect(
      [...component.querySelectorAll<HTMLButtonElement>('button')]
        .some((button) => button.textContent?.includes('Calculate and submit')),
    ).toBe(true);
  });

  it('keeps the in-progress recovery copy and download buttons if localStorage is full', async () => {
    const component = await renderConfiguredComponent();
    window.accessibleNasaTlxResultSink = {
      name: 'UCL approved test platform',
      async submit(record) {
        return {
          accepted: true,
          submissionId: record.submissionId,
          receiptId: 'receipt-storage-full',
        };
      },
    };
    await completeQuestionnaire(component);
    const progressKey = Object.keys(localStorage).find((key) => key.includes('-progress:'));
    expect(progressKey).toBeTruthy();
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });

    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit'))!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await component.updateComplete;

    expect(setItem).toHaveBeenCalled();
    expect(loadCompletedResults()).toEqual([]);
    expect(component.querySelector('.save-status')?.textContent).toContain(
      'could not keep a backup copy',
    );
    expect(component.textContent).toContain('Download JSON backup');
    expect(component.textContent).toContain('Download CSV backup');
    expect(localStorage.getItem(progressKey!)).not.toBeNull();
  });

  it('removes a stale failed-attempt backup when an answer is edited before retry', async () => {
    const component = await renderConfiguredComponent();
    window.accessibleNasaTlxResultSink = {
      name: 'Unavailable platform',
      async submit() {
        throw new Error('Network unavailable.');
      },
    };
    await completeQuestionnaire(component);
    [...component.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.includes('Calculate and submit'))!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await component.updateComplete;

    const staleSubmissionId = loadCompletedResults()[0].submissionId;
    (component as any).selectRating('mental', 75, 'standard-scale');
    await component.updateComplete;

    expect(loadCompletedResults().some(({ submissionId }) => submissionId === staleSubmissionId)).toBe(false);
    expect(component.querySelector('.submission-recovery')).toBeNull();
  });
});
