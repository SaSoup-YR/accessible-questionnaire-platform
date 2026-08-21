import { html } from 'lit';
import { AccessibleNasaTlx } from './accessible-nasa-tlx';

type SupportContext = 'intro' | 'toolbar';
type SupportScope = 'all' | 'presentation-only';
type AnnouncementSlot = 0 | 1;

type InternalComponent = HTMLElement & {
  audioGuidance: boolean;
  statusMessage: string;
  updateComplete: Promise<unknown>;
  renderSupportSettings(context: SupportContext, scope: SupportScope): unknown;
  requestUpdate(): void;
  __rf09SupportStatusMessage?: string;
  __rf09SupportAnnouncementMessage?: string;
  __rf09SupportAnnouncementSlot?: AnnouncementSlot;
  __rf09SupportAnnouncementGeneration?: number;
  __rf09SupportAnnouncementTimerId?: number | null;
};

// The first candidate used a 100 ms body-level role=log mutation. The real
// VoiceOver/Safari re-test exposed only the native selected/checked state. Keep
// the status regions present from the initial render, then wait for the native
// control announcement to settle before updating one alternating role=status
// region. This remains timely while avoiding a collision with the control state.
const SUPPORT_ANNOUNCEMENT_DELAY_MS = 650;
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

const SUPPORT_MESSAGES = new Set([
  LARGE_TEXT_MESSAGE,
  STANDARD_TEXT_MESSAGE,
  RECOVERY_ON_MESSAGE,
  RECOVERY_OFF_MESSAGE,
  AUDIO_ON_MESSAGE,
  AUDIO_OFF_MESSAGE,
]);

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

function originalHandlerAlreadySpeaks(component: InternalComponent, target: HTMLInputElement) {
  // The existing component uses browser speech synthesis for setting feedback
  // whenever automatic audio is on. Do not add a second status-region message
  // in that state. Turning audio off is different: speech has just stopped, so
  // the alternating status region becomes the sole AQP announcement channel.
  if (target.id.endsWith('-audio')) return target.checked;
  return component.audioGuidance;
}

function replaceStaticLabelText(
  input: HTMLInputElement,
  original: string,
  replacement: string,
) {
  const label = input.closest('label');
  if (!label) return;

  const textNode = [...label.childNodes].find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === original,
  );
  if (textNode?.textContent !== undefined) {
    textNode.textContent = textNode.textContent.replace(original, replacement);
  }

  // Keep the unique visible wording and the programmatic voice target exactly
  // aligned. This avoids the observed Voice Access "Which one?" collision with
  // the separate "Standard 21-value scale" control.
  input.setAttribute('aria-label', replacement);
}

function ensureUniqueTextSizeLabels(component: InternalComponent) {
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

function scheduleSupportAnnouncement(
  component: InternalComponent,
  target: HTMLInputElement,
  message: string,
) {
  if (
    component.__rf09SupportAnnouncementTimerId !== null &&
    component.__rf09SupportAnnouncementTimerId !== undefined
  ) {
    window.clearTimeout(component.__rf09SupportAnnouncementTimerId);
    component.__rf09SupportAnnouncementTimerId = null;
  }

  const generation = (component.__rf09SupportAnnouncementGeneration ?? 0) + 1;
  component.__rf09SupportAnnouncementGeneration = generation;
  component.__rf09SupportAnnouncementMessage = '';

  // The established target-level handler has already run. Suppress only its
  // matching support message in the older global live region so this change has
  // one AQP status channel rather than two. Unrelated page status is untouched.
  if (SUPPORT_MESSAGES.has(component.statusMessage)) component.statusMessage = '';
  component.requestUpdate();

  if (originalHandlerAlreadySpeaks(component, target)) return;

  void component.updateComplete.then(() => {
    if (
      !component.isConnected ||
      component.__rf09SupportAnnouncementGeneration !== generation
    ) {
      return;
    }

    component.__rf09SupportAnnouncementTimerId = window.setTimeout(() => {
      component.__rf09SupportAnnouncementTimerId = null;
      if (
        !component.isConnected ||
        component.__rf09SupportAnnouncementGeneration !== generation
      ) {
        return;
      }

      component.__rf09SupportAnnouncementSlot =
        component.__rf09SupportAnnouncementSlot === 0 ? 1 : 0;
      component.__rf09SupportAnnouncementMessage = message;
      component.requestUpdate();
    }, SUPPORT_ANNOUNCEMENT_DELAY_MS);
  });
}

function recordSupportFeedback(
  component: InternalComponent,
  target: HTMLInputElement,
  message: string,
) {
  component.__rf09SupportStatusMessage = message;
  scheduleSupportAnnouncement(component, target, message);
}

function handleSupportChange(component: InternalComponent, event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !component.contains(target)) return;
  const message = messageForSupportChange(target);
  if (!message) return;

  // Lit's target-level @change handler runs before this ancestor listener, so
  // the message is derived from the committed native checked/value state.
  recordSupportFeedback(component, target, message);
}

let installed = false;

/**
 * Adds one visible and one non-duplicating assistive-technology feedback path
 * for text-size, interruption-recovery and automatic-audio changes. Native
 * radio/checkbox semantics and all existing setting/storage logic remain the
 * source of truth; this module only observes the resulting native change event.
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
    const announcementMessage = this.__rf09SupportAnnouncementMessage ?? '';
    const announcementSlot = this.__rf09SupportAnnouncementSlot ?? 0;

    // The original static text is not a Lit dynamic part, so normalise it after
    // each committed render without changing the controls or their event logic.
    void this.updateComplete.then(() => ensureUniqueTextSizeLabels(this));

    return html`
      <div
        class="rf09-support-setting-region"
        @change=${(event: Event) => handleSupportChange(this, event)}
      >
        ${originalRenderSupportSettings.call(this, context, scope)}
        <p
          class="sr-only rf09-support-setting-announcement"
          data-rf09-support-announcement="0"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >${announcementSlot === 0 ? announcementMessage : ''}</p>
        <p
          class="sr-only rf09-support-setting-announcement"
          data-rf09-support-announcement="1"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >${announcementSlot === 1 ? announcementMessage : ''}</p>
        <p
          class="support-setting-feedback"
          data-rf09-support-feedback
          ?hidden=${!visibleMessage}
        >${visibleMessage}</p>
      </div>
    `;
  };
}

installRf09SupportSettingFeedback();
