import { html } from 'lit';
import './vendor/github-arianotify-polyfill';
import { AccessibleNasaTlx } from './accessible-nasa-tlx';

type SupportContext = 'intro' | 'toolbar';
type SupportScope = 'all' | 'presentation-only';
type NotificationPriority = 'normal' | 'high';
type SupportChangeSetting = 'automatic-audio';

type AriaNotifyingInput = HTMLInputElement & {
  ariaNotify?: (
    message: string,
    options?: { priority?: NotificationPriority },
  ) => void;
};

type InternalComponent = HTMLElement & {
  audioGuidance: boolean;
  updateComplete: Promise<unknown>;
  renderSupportSettings(context: SupportContext, scope: SupportScope): unknown;
  requestUpdate(): void;
  recordSupportChange(
    setting: SupportChangeSetting,
    from: boolean,
    to: boolean,
  ): void;
  invalidatePendingSubmission(): void;
  persistProgress(): void;
  stopReading(announce?: boolean): void;
  __rf09SupportStatusMessage?: string;
  __rf09NotificationGeneration?: number;
  __rf09NotificationTimerId?: number | null;
};

// RF-09 setting results use one screen-reader/status channel, independent of
// the optional browser text-to-speech channel. GitHub's production ARIA
// Notification polyfill waits 250 ms after creating its scoped fallback live
// region. Request the notification 400 ms after the native state change so the
// fallback mutation occurs after VoiceOver's immediate checked/selected state
// while remaining timely.
const SUPPORT_NOTIFICATION_REQUEST_DELAY_MS = 400;

const LARGE_TEXT_MESSAGE = 'Large text selected.';
const STANDARD_TEXT_MESSAGE = 'Standard text selected.';
const RECOVERY_ON_MESSAGE =
  'Interruption recovery is on. Incomplete answers will be stored in this browser.';
const RECOVERY_OFF_MESSAGE =
  'Interruption recovery is off. The saved in-progress copy has been removed.';
const AUDIO_ON_MESSAGE =
  'Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.';
const AUDIO_OFF_MESSAGE =
  'Built-in audio guidance is off. New questions and feedback will not be spoken automatically.';

function messageForSupportChange(target: HTMLInputElement) {
  if (!target.closest('.support-settings')) return null;

  if (target.closest('.text-size-control')) {
    if (target.type !== 'radio' || !target.checked) return null;
    return target.value === 'large' ? LARGE_TEXT_MESSAGE : STANDARD_TEXT_MESSAGE;
  }

  if (target.id.endsWith('-recovery') && target.type === 'checkbox') {
    return target.checked ? RECOVERY_ON_MESSAGE : RECOVERY_OFF_MESSAGE;
  }

  if (target.id.endsWith('-audio') && target.type === 'checkbox') {
    return target.checked ? AUDIO_ON_MESSAGE : AUDIO_OFF_MESSAGE;
  }

  return null;
}

function replaceStaticLabelText(
  input: HTMLInputElement,
  original: string,
  replacement: string,
) {
  const label = input.closest('label');
  if (!label) return;

  const textNode = [...label.childNodes].find(
    (node) =>
      node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === original,
  );
  const currentText = textNode?.textContent;
  if (currentText) textNode.textContent = currentText.replace(original, replacement);

  // Windows Voice Access uses visible names and partial matches. Keep the
  // unique visible wording and programmatic name identical so “Standard text”
  // cannot collide with the separate “Standard 21-value scale” control.
  input.setAttribute('aria-label', replacement);
}

function deliverSupportNotification(
  component: InternalComponent,
  target: HTMLInputElement,
  message: string,
  generation: number,
) {
  if (
    !component.isConnected ||
    !target.isConnected ||
    component.__rf09NotificationGeneration !== generation
  ) {
    return;
  }

  const notify = (target as AriaNotifyingInput).ariaNotify;
  if (typeof notify !== 'function') return;
  notify.call(target, message, { priority: 'normal' });
}

function scheduleSupportNotification(
  component: InternalComponent,
  target: HTMLInputElement,
  message: string,
) {
  if (
    component.__rf09NotificationTimerId !== null &&
    component.__rf09NotificationTimerId !== undefined
  ) {
    window.clearTimeout(component.__rf09NotificationTimerId);
    component.__rf09NotificationTimerId = null;
  }

  const generation = (component.__rf09NotificationGeneration ?? 0) + 1;
  component.__rf09NotificationGeneration = generation;
  component.__rf09NotificationTimerId = window.setTimeout(() => {
    component.__rf09NotificationTimerId = null;
    deliverSupportNotification(component, target, message, generation);
  }, SUPPORT_NOTIFICATION_REQUEST_DELAY_MS);
}

function recordSupportFeedback(
  component: InternalComponent,
  target: HTMLInputElement,
  message: string,
) {
  component.__rf09SupportStatusMessage = message;
  component.requestUpdate();
  scheduleSupportNotification(component, target, message);
}

/**
 * The base component historically spoke the audio-on setting confirmation with
 * SpeechSynthesis. That makes the setting result depend on a second, unrelated
 * output channel and creates an impossible browser-side choice between silent
 * speech and duplicate VoiceOver output. Intercept only this checkbox before
 * the base Lit handler, preserve the base state/persistence semantics, and make
 * the setting result use the same single AT notification path as every other
 * RF-09 setting. Future questions and feedback still use SpeechSynthesis because
 * audioGuidance remains true after this handler returns.
 */
function installAudioSettingInterceptor(
  component: InternalComponent,
  input: HTMLInputElement,
) {
  if (input.dataset.rf09AudioInterceptor === 'true') return;
  input.dataset.rf09AudioInterceptor = 'true';

  input.addEventListener(
    'change',
    (event) => {
      event.stopImmediatePropagation();
      const value = input.checked;
      const previous = component.audioGuidance;

      component.recordSupportChange('automatic-audio', previous, value);
      component.stopReading(false);
      component.audioGuidance = value;
      component.invalidatePendingSubmission();
      component.persistProgress();

      recordSupportFeedback(
        component,
        input,
        value ? AUDIO_ON_MESSAGE : AUDIO_OFF_MESSAGE,
      );
    },
    { capture: true },
  );
}

function prepareSupportControls(component: InternalComponent) {
  for (const region of component.querySelectorAll<HTMLElement>(
    '[data-rf09-support-setting-region]',
  )) {
    const feedback = region.querySelector<HTMLElement>(
      '[data-rf09-support-feedback]',
    );
    if (!feedback?.id) continue;
    for (const input of region.querySelectorAll<HTMLInputElement>(
      '.support-settings input',
    )) {
      input.setAttribute('aria-controls', feedback.id);
      if (input.id.endsWith('-audio') && input.type === 'checkbox') {
        installAudioSettingInterceptor(component, input);
      }
    }
  }

  for (const standard of component.querySelectorAll<HTMLInputElement>(
    '.text-size-control input[type="radio"][value="standard"]',
  )) {
    replaceStaticLabelText(standard, 'Standard', 'Standard text');
  }
  for (const large of component.querySelectorAll<HTMLInputElement>(
    '.text-size-control input[type="radio"][value="large"]',
  )) {
    replaceStaticLabelText(large, 'Large', 'Large text');
  }
}

function handleSupportChange(component: InternalComponent, event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !component.contains(target)) return;

  // Audio changes are handled by the target capture listener above so the old
  // SpeechSynthesis self-confirmation never starts. Do not generate a second
  // result when the event reaches this observer.
  if (target.id.endsWith('-audio') && target.type === 'checkbox') return;

  const message = messageForSupportChange(target);
  if (!message) return;

  // Lit's target-level @change handler runs before this ancestor listener, so
  // wording is derived from the committed native checked/value state rather
  // than from the attempted action.
  recordSupportFeedback(component, target, message);
}

let installed = false;

/**
 * Adds one visible and one non-duplicating assistive-technology feedback path
 * for text-size, interruption-recovery and automatic-audio changes. Native
 * radio/checkbox semantics remain intact. Audio-on/off preserves the base state,
 * persistence and support-change semantics while deliberately separating the
 * setting-result status channel from optional browser text-to-speech.
 */
export function installRf09SupportSettingFeedback() {
  if (installed) return;
  installed = true;

  const prototype = AccessibleNasaTlx.prototype as unknown as InternalComponent;
  const originalRenderSupportSettings = prototype.renderSupportSettings;

  prototype.renderSupportSettings = function renderSupportSettings(
    this: InternalComponent,
    context: SupportContext,
    scope: SupportScope,
  ) {
    const visibleMessage = this.__rf09SupportStatusMessage ?? '';
    const feedbackId = `rf09-${context}-support-feedback`;

    // Original labels are static Lit text. Normalise names, wire advisory
    // relationships and install the bounded audio-setting interceptor after each
    // committed render without replacing the native controls.
    void this.updateComplete.then(() => prepareSupportControls(this));

    return html`
      <div
        class="rf09-support-setting-region"
        data-rf09-support-setting-region=${context}
        @change=${(event: Event) => handleSupportChange(this, event)}
      >
        ${originalRenderSupportSettings.call(this, context, scope)}
        <p
          id=${feedbackId}
          class="support-setting-feedback"
          data-rf09-support-feedback
          ?hidden=${!visibleMessage}
        >${visibleMessage}</p>
      </div>
    `;
  };
}

installRf09SupportSettingFeedback();