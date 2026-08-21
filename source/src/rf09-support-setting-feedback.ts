import { html } from 'lit';
import './vendor/github-arianotify-polyfill';
import { AccessibleNasaTlx } from './accessible-nasa-tlx';

type SupportContext = 'intro' | 'toolbar';
type SupportScope = 'all' | 'presentation-only';
type NotificationPriority = 'normal' | 'high';

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
  __rf09SupportStatusMessage?: string;
  __rf09NotificationGeneration?: number;
  __rf09NotificationTimerId?: number | null;
};

// When built-in AQP speech is not expected, keep the already-verified polite
// notification timing: request ariaNotify 400 ms after the native state change;
// GitHub's fallback then waits 250 ms before its first live-region mutation.
const SUPPORT_NOTIFICATION_REQUEST_DELAY_MS = 400;

// Safari/VoiceOver manual evidence showed that speechSynthesis.speak() can be
// accepted without producing the AQP audio-on confirmation. Do not treat a
// queued speak() call as proof of audible output. When built-in speech is
// expected, observe the standard SpeechSynthesis.speaking state for a bounded
// 800 ms window. If speech actually starts, keep browser speech as the sole AQP
// channel. If it never starts, cancel any still-pending/paused AQP utterance and
// fall back to one normal-priority ariaNotify message, avoiding a late duplicate.
const BUILT_IN_SPEECH_START_GRACE_MS = 800;
const BUILT_IN_SPEECH_POLL_MS = 50;

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

  const browserSpeechExpected = component.audioGuidance;
  if (!browserSpeechExpected) {
    component.__rf09NotificationTimerId = window.setTimeout(() => {
      component.__rf09NotificationTimerId = null;
      deliverSupportNotification(component, target, message, generation);
    }, SUPPORT_NOTIFICATION_REQUEST_DELAY_MS);
    return;
  }

  let waitedMs = 0;
  const observeBuiltInSpeech = () => {
    component.__rf09NotificationTimerId = null;
    if (
      !component.isConnected ||
      !target.isConnected ||
      component.__rf09NotificationGeneration !== generation
    ) {
      return;
    }

    const synthesis = 'speechSynthesis' in window ? window.speechSynthesis : null;
    if (synthesis?.speaking) {
      // The browser has actually begun the AQP utterance. Suppress the AT
      // fallback so one real setting change still has only one AQP spoken path.
      return;
    }

    waitedMs += BUILT_IN_SPEECH_POLL_MS;
    if (waitedMs < BUILT_IN_SPEECH_START_GRACE_MS) {
      component.__rf09NotificationTimerId = window.setTimeout(
        observeBuiltInSpeech,
        BUILT_IN_SPEECH_POLL_MS,
      );
      return;
    }

    // speak() may leave an utterance queued or paused without ever speaking it.
    // Remove that late candidate before the AT fallback so it cannot begin after
    // ariaNotify and create a duplicate confirmation.
    if (synthesis && (synthesis.pending || synthesis.paused)) synthesis.cancel();
    deliverSupportNotification(component, target, message, generation);
  };

  component.__rf09NotificationTimerId = window.setTimeout(
    observeBuiltInSpeech,
    BUILT_IN_SPEECH_POLL_MS,
  );
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

function handleSupportChange(component: InternalComponent, event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !component.contains(target)) return;
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
 * radio/checkbox semantics and all existing setting/storage logic remain the
 * source of truth; this module observes only the committed native change event.
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

    // Original labels are static Lit text, so normalise them and wire the
    // advisory result relationship after every committed render without
    // replacing the controls or their native event paths.
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
