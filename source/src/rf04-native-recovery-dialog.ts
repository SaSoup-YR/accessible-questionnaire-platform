import { html } from 'lit';
import './rf04-native-recovery-dialog.css';
import { AccessibleNasaTlx } from './accessible-nasa-tlx';

type SavedSessionLike = {
  savedAt: number;
  configId: string;
  participantCode: string;
  ratings: Record<string, number>;
  pairResponses: Record<string, string>;
};

type InternalQuestionnaire = HTMLElement & {
  savedSession: SavedSessionLike | null;
  savedSessionAnnouncementKey: string;
  statusMessage: string;
  audioGuidance: boolean;
  dimensions: readonly unknown[];
  pairs: readonly unknown[];
  updateComplete: Promise<unknown>;
  renderSavedSessionOffer(): unknown;
  savedSessionOfferSpeech(session: SavedSessionLike): string;
  repeatSavedSessionOffer(): void;
  restoreSavedSession(): void;
  eraseSavedSession(): void;
  speakText(text: string): void;
};

type InternalPrototype = InternalQuestionnaire & {
  __rf04NativeRecoveryDialogInstalled?: boolean;
};

const DIALOG_ID = 'saved-session-dialog';
const REOPEN_ID = 'open-saved-session-dialog';
const RESUME_ID = 'resume-saved-questionnaire';

function currentSessionMatches(
  component: InternalQuestionnaire,
  session: SavedSessionLike,
) {
  const current = component.savedSession;
  return Boolean(
    current &&
      current.savedAt === session.savedAt &&
      current.configId === session.configId &&
      current.participantCode === session.participantCode,
  );
}

function focusResume(dialog: HTMLDialogElement) {
  const resume = dialog.querySelector<HTMLButtonElement>(`#${RESUME_ID}`);
  if (!resume) return;
  // The native dialog focusing steps should honour autofocus. Keep one immediate
  // fallback for partially implemented engines; unlike the rejected RF-04
  // successor, this is not a delayed Safari-specific blur/refocus loop.
  if (document.activeElement !== resume) resume.focus({ preventScroll: true });
}

function openSavedSessionDialog(component: InternalQuestionnaire) {
  if (!component.savedSession) return;
  const dialog = component.querySelector<HTMLDialogElement>(`#${DIALOG_ID}`);
  if (!dialog) return;

  if (!dialog.open) {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      // All frozen routes support modal dialog. This semantic fallback keeps the
      // choices available in older embedded engines without claiming modality.
      dialog.setAttribute('open', '');
      dialog.setAttribute('aria-modal', 'true');
    }
  }
  focusResume(dialog);
}

function focusReopenControl(component: InternalQuestionnaire) {
  if (!component.savedSession) return;
  void component.updateComplete.then(() => {
    component.querySelector<HTMLButtonElement>(`#${REOPEN_ID}`)?.focus({
      preventScroll: true,
    });
  });
}

function renderSavedSessionDialog(this: InternalQuestionnaire) {
  const session = this.savedSession;
  if (!session) return null;
  const count =
    Object.keys(session.ratings).length + Object.keys(session.pairResponses).length;
  const total = this.dimensions.length + this.pairs.length;

  return html`
    <section
      class="saved-session-reopen"
      aria-labelledby="saved-session-reopen-heading"
    >
      <h3 id="saved-session-reopen-heading">Saved questionnaire available</h3>
      <p>${count} of ${total} responses are saved in this browser.</p>
      <button
        id=${REOPEN_ID}
        class="secondary-button large-answer-button"
        type="button"
        @click=${() => openSavedSessionDialog(this)}
      >
        Open saved-questionnaire choices
      </button>
    </section>

    <dialog
      id=${DIALOG_ID}
      class="saved-session saved-session-dialog"
      aria-labelledby="saved-session-heading"
      aria-describedby="saved-session-count saved-session-actions"
      @close=${() => focusReopenControl(this)}
    >
      <h2 id="saved-session-heading">Saved questionnaire found</h2>
      <p id="saved-session-count">
        ${count} of ${total} responses are saved in this browser.
      </p>
      <p id="saved-session-actions">
        Resume saved questionnaire. Erase saved answers.
      </p>
      <div class="button-row compact">
        <button
          id=${RESUME_ID}
          class="primary-button large-answer-button"
          type="button"
          autofocus
          aria-describedby="saved-session-count saved-session-actions"
          @click=${this.restoreSavedSession}
        >
          Resume saved questionnaire
        </button>
        <button
          class="secondary-button"
          type="button"
          @click=${this.repeatSavedSessionOffer}
        >
          Hear saved-progress message
        </button>
        <button
          id="erase-saved-questionnaire"
          class="secondary-button"
          type="button"
          @click=${this.eraseSavedSession}
        >
          Erase saved answers
        </button>
      </div>
    </dialog>
  `;
}

function announceSavedSessionDialog(
  this: InternalQuestionnaire,
  session: SavedSessionLike,
) {
  const announcementKey = `${session.configId}:${session.participantCode}:${session.savedAt}`;
  if (this.savedSessionAnnouncementKey === announcementKey) return;
  this.savedSessionAnnouncementKey = announcementKey;

  const message = this.savedSessionOfferSpeech(session);
  // The modal itself and the autofocus Resume control carry the name,
  // description, exact count and choices. Do not also mutate the global polite
  // region, which could create a duplicate VoiceOver announcement.
  this.statusMessage = '';

  void this.updateComplete.then(() => {
    if (!this.isConnected || !currentSessionMatches(this, session)) return;
    openSavedSessionDialog(this);
    // Preserve the participant's prior explicit audio-guidance preference. This
    // optional browser TTS is not used as evidence for screen-reader focus.
    if (this.audioGuidance) this.speakText(message);
  });
}

/**
 * Final bounded RF-04 successor.
 *
 * The previous inline region plus delayed focus calls did not move the real
 * VoiceOver cursor in Safari. This successor changes the interaction structure:
 * a saved session opens as a native modal dialog, making the rest of the page
 * inert and placing the most likely action first with autofocus. It retains the
 * validated direct-resume and erase handlers from the existing RF-04 repair.
 */
export function installRf04NativeRecoveryDialog() {
  const prototype = AccessibleNasaTlx.prototype as unknown as InternalPrototype;
  if (prototype.__rf04NativeRecoveryDialogInstalled) return;
  prototype.__rf04NativeRecoveryDialogInstalled = true;
  prototype.renderSavedSessionOffer = renderSavedSessionDialog;
  (prototype as unknown as { announceSavedSessionOffer: typeof announceSavedSessionDialog })
    .announceSavedSessionOffer = announceSavedSessionDialog;
}
