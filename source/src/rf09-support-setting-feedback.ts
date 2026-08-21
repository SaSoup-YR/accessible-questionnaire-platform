import { html } from 'lit';
import { AccessibleNasaTlx } from './accessible-nasa-tlx';
import {
  announceForAssistiveTechnology,
  ensureAccessibilityAnnouncer,
} from './accessibility-announcer';

type SupportContext = 'intro' | 'toolbar';
type SupportScope = 'all' | 'presentation-only';

type InternalComponent = HTMLElement & {
  audioGuidance: boolean;
  connectedCallback(): void;
  disconnectedCallback(): void;
  renderSupportSettings(context: SupportContext, scope: SupportScope): unknown;
  updateComplete: Promise<unknown>;
  requestUpdate(): void;
  __rf09SupportStatusMessage?: string;
  __rf09SupportChangeHandler?: (event: Event) => void;
};

const SUPPORT_ANNOUNCEMENT_DELAY_MS = 100;
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

function originalHandlerAlreadySpeaks(component: InternalComponent, target: HTMLInputElement) {
  // The existing component uses browser speech synthesis for setting feedback
  // whenever automatic audio is on. Do not add a second live-region message in
  // that state: the visible confirmation is still updated, but only one AQP
  // announcement channel is used for the change.
  if (target.id.endsWith('-audio')) return target.checked;
  return component.audioGuidance;
}

function recordSupportFeedback(
  component: InternalComponent,
  target: HTMLInputElement,
  message: string,
) {
  component.__rf09SupportStatusMessage = message;
  component.requestUpdate();

  if (originalHandlerAlreadySpeaks(component, target)) return;

  // Angular CDK and React Aria both use a stable body-level announcer and a
  // non-zero delay/fresh DOM mutation for cross-browser reliability. The AQP
  // announcer already exists before this interaction; append one polite item
  // after the native radio/checkbox state announcement has had time to settle.
  window.setTimeout(() => {
    if (!component.isConnected) return;
    announceForAssistiveTechnology(message, 'polite');
  }, SUPPORT_ANNOUNCEMENT_DELAY_MS);
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
  ensureAccessibilityAnnouncer();

  const prototype = AccessibleNasaTlx.prototype as unknown as InternalComponent;
  const originalConnectedCallback = prototype.connectedCallback;
  const originalDisconnectedCallback = prototype.disconnectedCallback;
  const originalRenderSupportSettings = prototype.renderSupportSettings;

  prototype.connectedCallback = function connectedCallback(this: InternalComponent) {
    originalConnectedCallback.call(this);
    ensureAccessibilityAnnouncer();

    if (this.__rf09SupportChangeHandler) return;
    this.__rf09SupportChangeHandler = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || !this.contains(target)) return;
      const message = messageForSupportChange(target);
      if (!message) return;

      // Lit's target-level @change handler has already run before the event
      // bubbles to the component, so the message is derived from the committed
      // native checked/value state rather than from an intended state.
      recordSupportFeedback(this, target, message);
    };
    this.addEventListener('change', this.__rf09SupportChangeHandler);
  };

  prototype.disconnectedCallback = function disconnectedCallback(this: InternalComponent) {
    if (this.__rf09SupportChangeHandler) {
      this.removeEventListener('change', this.__rf09SupportChangeHandler);
      this.__rf09SupportChangeHandler = undefined;
    }
    originalDisconnectedCallback.call(this);
  };

  prototype.renderSupportSettings = function renderSupportSettings(
    this: InternalComponent,
    context: SupportContext,
    scope: SupportScope,
  ) {
    const message = this.__rf09SupportStatusMessage ?? '';
    return html`
      ${originalRenderSupportSettings.call(this, context, scope)}
      <p
        class="support-setting-feedback"
        data-rf09-support-feedback
        ?hidden=${!message}
      >${message}</p>
    `;
  };
}

installRf09SupportSettingFeedback();
