import { html, nothing } from 'lit';
import { AccessibleNasaTlx } from './accessible-nasa-tlx';
import type { QuestionnaireItem } from './questionnaire-definition';

type VoiceContext = 'rating' | 'pair';

type RecognitionEventLike = Event & {
  results?: {
    readonly length: number;
    [index: number]: {
      readonly length: number;
      [index: number]: { transcript?: string };
    };
  };
};

type RecognitionErrorLike = Event & { error?: string };

type RecognitionLike = {
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: RecognitionErrorLike) => void) | null;
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
  __rf06ListeningAnnouncementTimerId?: number | null;
  __rf06VoiceNoticeTimerId?: number | null;
  __rf06MessageChannel?: 'status' | 'alert';
};

const VOICE_LISTENING_WATCHDOG_MS = 15_000;
const VOICE_LIVE_REGION_DELAY_MS = 650;
const MANUAL_STOP_MESSAGE =
  'Voice input stopped. No answer was changed. Try again, or use a visible answer button.';
const NATIVE_NO_SPEECH_MESSAGE =
  'No speech was detected. Voice input stopped. Try again, or use a visible answer button. No answer was changed.';
const WATCHDOG_NO_SPEECH_MESSAGE =
  'No speech was detected before the listening time limit. Voice input stopped. Try again, or use a visible answer button. No answer was changed.';

function clearTimer(
  component: InternalComponent,
  key:
    | '__rf06VoiceWatchdogTimerId'
    | '__rf06ListeningAnnouncementTimerId'
    | '__rf06VoiceNoticeTimerId',
) {
  const timerId = component[key];
  if (timerId === null || timerId === undefined) return;
  window.clearTimeout(timerId);
  component[key] = null;
}

function clearLifecycleTimers(component: InternalComponent) {
  clearTimer(component, '__rf06VoiceWatchdogTimerId');
  clearTimer(component, '__rf06ListeningAnnouncementTimerId');
  clearTimer(component, '__rf06VoiceNoticeTimerId');
}


function scheduleListeningAnnouncement(component: InternalComponent, recognition: RecognitionLike) {
  clearTimer(component, '__rf06ListeningAnnouncementTimerId');
  component.__rf06MessageChannel = 'status';
  // Safari/VoiceOver can speak its own microphone-capture notice at the same
  // instant recognition starts. Keep the already-present live region empty,
  // then create a separate content mutation after that browser notice so the
  // AQP Listening state has its own opportunity to be announced.
  component.voiceMessage = '';
  component.__rf06ListeningAnnouncementTimerId = window.setTimeout(() => {
    component.__rf06ListeningAnnouncementTimerId = null;
    if (component.recognition !== recognition || component.voiceState !== 'listening') return;
    component.voiceMessage = 'Listening for one answer.';
  }, VOICE_LIVE_REGION_DELAY_MS);
}

function scheduleNoSpeechNotice(component: InternalComponent, message: string) {
  clearTimer(component, '__rf06VoiceNoticeTimerId');
  component.__rf06MessageChannel = 'alert';
  // Separate the AQP recovery message from Safari's own "stopped capturing
  // sound" announcement. This keeps the error as a genuine later live-region
  // mutation instead of competing with the browser notification.
  component.voiceState = 'error';
  component.voiceMessage = '';
  component.__rf06VoiceNoticeTimerId = window.setTimeout(() => {
    component.__rf06VoiceNoticeTimerId = null;
    if (component.recognition || component.voiceState !== 'error') return;
    component.showVoiceNotice(message);
  }, VOICE_LIVE_REGION_DELAY_MS);
}

function stopVoiceInput(component: InternalComponent) {
  if (component.voiceState !== 'listening') return;
  component.releaseRecognition();
  component.pendingVoiceAnswer = null;
  component.__rf06MessageChannel = 'status';
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
    const voiceMessageIsAlert =
      this.__rf06MessageChannel === 'alert' && Boolean(this.voiceMessage);

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
              ${this.voiceState === 'listening' ? 'Listening…' : 'Start voice input'}
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
          <p class="voice-status" role="status" aria-live="polite" aria-atomic="true">
            ${voiceMessageIsAlert ? '' : this.voiceMessage}
          </p>
          <p class="voice-alert" role="alert" aria-atomic="true">
            ${voiceMessageIsAlert ? this.voiceMessage : ''}
          </p>
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
    clearLifecycleTimers(this);
    originalReleaseRecognition.call(this, recognition);
  };

  prototype.startVoiceInput = function startVoiceInput(
    this: InternalComponent,
    context: VoiceContext,
    first: QuestionnaireItem,
    second?: QuestionnaireItem,
    allowContextualHints = true,
  ) {
    clearLifecycleTimers(this);
    originalStartVoiceInput.call(this, context, first, second, allowContextualHints);

    const recognition = this.recognition;
    if (!recognition || this.voiceState !== 'listening') return;

    scheduleListeningAnnouncement(this, recognition);

    const originalOnError = recognition.onerror;
    recognition.onerror = (event) => {
      if (this.recognition !== recognition) return;
      if (this.voiceState === 'listening' && (event.error === 'no-speech' || event.error === 'aborted')) {
        this.releaseRecognition(recognition);
        scheduleNoSpeechNotice(this, NATIVE_NO_SPEECH_MESSAGE);
        return;
      }
      originalOnError?.(event);
    };

    recognition.onend = () => {
      if (this.recognition !== recognition) return;
      if (this.voiceState !== 'listening') return;
      this.releaseRecognition(recognition);
      scheduleNoSpeechNotice(this, NATIVE_NO_SPEECH_MESSAGE);
    };

    this.__rf06VoiceWatchdogTimerId = window.setTimeout(() => {
      this.__rf06VoiceWatchdogTimerId = null;
      if (this.recognition !== recognition || this.voiceState !== 'listening') return;
      this.releaseRecognition(recognition);
      scheduleNoSpeechNotice(this, WATCHDOG_NO_SPEECH_MESSAGE);
    }, VOICE_LISTENING_WATCHDOG_MS);
  };
}

installRf06SpeechLifecycle();
