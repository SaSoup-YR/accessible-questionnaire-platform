import { html, nothing } from 'lit';
import { AccessibleNasaTlx } from './accessible-nasa-tlx';
import type { QuestionnaireItem } from './questionnaire-definition';

type VoiceContext = 'rating' | 'pair';

type RecognitionLike = {
  onend: (() => void) | null;
};

type InternalComponent = {
  voiceInputAvailable: boolean;
  voiceState: 'idle' | 'listening' | 'pending' | 'error';
  voiceMessage: string;
  pendingVoiceAnswer: {
    context: VoiceContext;
    transcript: string;
    label: string;
  } | null;
  definition: { language: string };
  recognition: RecognitionLike | null;
  ratingVoicePrompt(item: QuestionnaireItem): string;
  renderVoiceInput(
    context: VoiceContext,
    first: QuestionnaireItem,
    second?: QuestionnaireItem,
  ): unknown;
  startVoiceInput(
    context: VoiceContext,
    first: QuestionnaireItem,
    second?: QuestionnaireItem,
    allowContextualHints?: boolean,
  ): void;
  releaseRecognition(recognition?: RecognitionLike | null): void;
  showVoiceNotice(message: string): void;
  confirmVoiceAnswer(): void;
  clearVoiceAnswer(): void;
  updateComplete: Promise<unknown>;
  querySelector<E extends Element = Element>(selectors: string): E | null;
  __rf06Installed?: boolean;
  __rf06VoiceWatchdogTimerId?: number | null;
};

const VOICE_LISTENING_WATCHDOG_MS = 15_000;
const MANUAL_STOP_MESSAGE =
  'Voice input stopped. No answer was changed. Try again, or use a visible answer button.';
const NATIVE_NO_SPEECH_MESSAGE =
  'No speech was detected. Voice input stopped. Try again, or use a visible answer button. No answer was changed.';
const WATCHDOG_NO_SPEECH_MESSAGE =
  'No speech was detected before the listening time limit. Voice input stopped. Try again, or use a visible answer button. No answer was changed.';

function clearWatchdog(component: InternalComponent) {
  if (component.__rf06VoiceWatchdogTimerId === null || component.__rf06VoiceWatchdogTimerId === undefined) return;
  window.clearTimeout(component.__rf06VoiceWatchdogTimerId);
  component.__rf06VoiceWatchdogTimerId = null;
}

function stopVoiceInput(component: InternalComponent) {
  if (component.voiceState !== 'listening') return;
  component.releaseRecognition();
  component.pendingVoiceAnswer = null;
  component.showVoiceNotice(MANUAL_STOP_MESSAGE);
  void component.updateComplete.then(() => {
    component.querySelector<HTMLButtonElement>('[data-voice-start]')?.focus();
  });
}

/**
 * Installs the bounded RF-06 lifecycle repair on the existing participant
 * component without changing scoring, recognition parsing or questionnaire
 * content. TypeScript `private` members in the component are compile-time
 * access controls, so this revision can wrap the established implementation
 * while the frozen audit remains tied to a small, reviewable diff.
 */
export function installRf06SpeechLifecycle() {
  const prototype = AccessibleNasaTlx.prototype as unknown as InternalComponent;
  if (prototype.__rf06Installed) return;
  prototype.__rf06Installed = true;

  const originalStartVoiceInput = prototype.startVoiceInput;
  const originalReleaseRecognition = prototype.releaseRecognition;

  prototype.renderVoiceInput = function renderVoiceInput(
    this: InternalComponent,
    context: VoiceContext,
    first: QuestionnaireItem,
    second?: QuestionnaireItem,
  ) {
    if (!this.voiceInputAvailable) return nothing;
    const available = Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
    const activeForContext = this.pendingVoiceAnswer?.context === context;
    const prompt =
      context === 'rating'
        ? this.ratingVoicePrompt(first)
        : `Say “${first.name}” or “${second!.name}”.`;

    return html`
      <details class="voice-input" .open=${this.voiceState !== 'idle'}>
        <summary>Answer this question by voice</summary>
        <div class="voice-input-content">
          <p>${prompt}</p>
          <p class="support-boundary">
            Voice input uses English recognition. Say one shown number in English. For an English questionnaire,
            you may instead say one complete visible answer label. When the browser supports contextual speech
            hints, the current visible answers are supplied to improve recognition. Non-English answer labels are
            not recognised. Voice is optional, this prototype does not store audio, and the visible answer buttons
            remain available. While listening, you can stop the attempt at any time.
          </p>
          <div class="button-row compact">
            <button
              class="secondary-button large-answer-button"
              type="button"
              data-voice-start
              ?disabled=${!available || this.voiceState === 'listening'}
              @click=${() => this.startVoiceInput(context, first, second)}
            >
              Start voice input
            </button>
            ${this.voiceState === 'listening'
              ? html`<button
                  class="secondary-button large-answer-button"
                  type="button"
                  data-voice-stop
                  @click=${() => stopVoiceInput(this)}
                >
                  Stop voice input
                </button>`
              : nothing}
          </div>
          ${!available
            ? html`<p role="status">
                Built-in voice recognition is unavailable in this browser. System voice control can still activate
                the visible buttons by name.
              </p>`
            : nothing}
          <p class="voice-status" role="status" aria-live="polite" aria-atomic="true">${this.voiceMessage}</p>
          ${activeForContext && this.pendingVoiceAnswer
            ? html`
                <div class="voice-confirmation">
                  <p>I heard: <strong lang=${this.definition.language} dir="auto">${this.pendingVoiceAnswer.transcript}</strong></p>
                  <p>Proposed answer: <strong lang=${this.definition.language} dir="auto">${this.pendingVoiceAnswer.label}</strong></p>
                  <p>
                    <strong>Check before confirming:</strong> continue only if both lines match what you intended.
                    Speech recognition can omit a word.
                  </p>
                  <div class="button-row compact">
                    <button
                      class="primary-button large-answer-button"
                      type="button"
                      data-voice-confirm
                      @click=${this.confirmVoiceAnswer}
                    >
                      Confirm ${this.pendingVoiceAnswer.label}
                    </button>
                    <button class="secondary-button" type="button" @click=${this.clearVoiceAnswer}>Try again</button>
                  </div>
                </div>
              `
            : nothing}
        </div>
      </details>
    `;
  };

  prototype.releaseRecognition = function releaseRecognition(
    this: InternalComponent,
    recognition = this.recognition,
  ) {
    clearWatchdog(this);
    originalReleaseRecognition.call(this, recognition);
  };

  prototype.startVoiceInput = function startVoiceInput(
    this: InternalComponent,
    context: VoiceContext,
    first: QuestionnaireItem,
    second?: QuestionnaireItem,
    allowContextualHints = true,
  ) {
    clearWatchdog(this);
    originalStartVoiceInput.call(this, context, first, second, allowContextualHints);

    const recognition = this.recognition;
    if (!recognition || this.voiceState !== 'listening') return;

    const originalOnEnd = recognition.onend;
    recognition.onend = () => {
      clearWatchdog(this);
      if (this.recognition !== recognition) return;
      if (this.voiceState !== 'listening') {
        originalOnEnd?.();
        return;
      }
      this.recognition = null;
      this.showVoiceNotice(NATIVE_NO_SPEECH_MESSAGE);
    };

    this.__rf06VoiceWatchdogTimerId = window.setTimeout(() => {
      this.__rf06VoiceWatchdogTimerId = null;
      if (this.recognition !== recognition || this.voiceState !== 'listening') return;
      this.releaseRecognition(recognition);
      this.showVoiceNotice(WATCHDOG_NO_SPEECH_MESSAGE);
    }, VOICE_LISTENING_WATCHDOG_MS);
  };
}

installRf06SpeechLifecycle();
