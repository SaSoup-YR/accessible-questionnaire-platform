import { focusAndReveal } from './accessibility-utils';

type RecoveryStage = 'ratings' | 'pairs' | 'review';

type SavedSessionLike = {
  savedAt: number;
  configId: string;
  participantCode: string;
  stage: RecoveryStage;
  ratingIndex: number;
  pairIndex: number;
  pairOrder: Array<{ id: string }>;
  pairResponses: Record<string, unknown>;
  ratings: Record<string, unknown>;
  ratingInputRoutes: Record<string, unknown>;
  pairInputRoutes: Record<string, unknown>;
  supportChanges: unknown[];
  startedAt: string;
  support: {
    answerMode: unknown;
    showSimpleLanguage: boolean;
    largeText: boolean;
    audioGuidance?: boolean;
  };
};

type InternalQuestionnaire = HTMLElement & {
  savedSession: SavedSessionLike | null;
  savedSessionAnnouncementKey: string;
  savedSessionProblem: string;
  stage: RecoveryStage | 'intro' | 'complete';
  editingRatingFromReview: boolean;
  reviewRatingEdit: unknown;
  reviewReturnFocusIndex: number | null;
  ratingIndex: number;
  pairIndex: number;
  pairOrder: Array<{ id: string }>;
  pairResponses: Record<string, unknown>;
  ratings: Record<string, unknown>;
  ratingInputRoutes: Record<string, unknown>;
  pairInputRoutes: Record<string, unknown>;
  supportChanges: unknown[];
  startedAt: string;
  recoveryEnabled: boolean;
  resumeSummaryVisible: boolean;
  interruptionSummaryShown: boolean;
  statusMessage: string;
  audioGuidance: boolean;
  answerMode: unknown;
  showSimpleLanguage: boolean;
  largeText: boolean;
  dimensions: Array<{ id: string; name: string }>;
  canAdjustAllSupport: boolean;
  canAdjustPresentationSupport: boolean;
  updateComplete: Promise<unknown>;
  isConnected: boolean;
  announceSavedSessionOffer(session: SavedSessionLike): void;
  savedSessionOfferSpeech(session: SavedSessionLike): string;
  applyConfiguredSupport(): void;
  requestParentReveal(element: HTMLElement): void;
  speakText(text: string): void;
  focusHeading(speak?: boolean): void;
  currentPositionDescription(): string;
};

type InternalQuestionnaireConstructor = CustomElementConstructor & {
  prototype: InternalQuestionnaire & Record<PropertyKey, unknown>;
};

const installedMarker = Symbol.for('aqp.rf04.saved-session-recovery.installed');
const SAFARI_RECOVERY_REFOCUS_DELAY_MS = 80;

function hasOwn(record: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key);
}

/**
 * Keep the R3 workaround scoped to Safari. Chromium/Firefox routes retain the
 * already-passing single-focus path, while Safari receives one post-render
 * focus transition after the saved-progress status has settled.
 */
export function isSafariUserAgent(userAgent: string) {
  return (
    /Safari\//.test(userAgent) &&
    !/(Chrome|Chromium|CriOS|FxiOS|EdgiOS|OPiOS)\//.test(userAgent)
  );
}

function savedSessionStillMatches(
  component: InternalQuestionnaire,
  session: SavedSessionLike,
) {
  const current = component.savedSession;
  return Boolean(
    component.isConnected &&
    current &&
    current.savedAt === session.savedAt &&
    current.configId === session.configId &&
    current.participantCode === session.participantCode
  );
}

function focusRecoveryResume(
  component: InternalQuestionnaire,
  resume: HTMLButtonElement,
) {
  focusAndReveal(resume, {
    block: 'center',
    forceCoordinateScroll: true,
    onReveal: () => component.requestParentReveal(resume),
  });
}

/**
 * The R3 manual route exposed a Safari/VoiceOver mismatch: the Resume button
 * drew the expected focus ring after reload, but VoiceOver reported that no
 * element had keyboard focus. Re-assert focus once after the delayed recovery
 * status has rendered so Safari receives a fresh native focus transition.
 *
 * Do not steal focus if the participant has already moved somewhere else or
 * resumed the questionnaire during the delay.
 */
function reassertSafariRecoveryFocus(
  component: InternalQuestionnaire,
  session: SavedSessionLike,
) {
  const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
  if (!isSafariUserAgent(userAgent)) return;

  void component.updateComplete.then(() => {
    window.setTimeout(() => {
      if (!savedSessionStillMatches(component, session)) return;

      const resume = component.querySelector<HTMLButtonElement>('#resume-saved-questionnaire');
      if (!resume) return;

      const active = resume.ownerDocument.activeElement;
      const body = resume.ownerDocument.body;
      if (active && active !== resume && active !== body) return;

      // If Safari still owns DOM focus on Resume, blur first so the second focus
      // produces a new accessibility event instead of a no-op focus() call.
      if (active === resume) resume.blur();
      focusRecoveryResume(component, resume);
    }, SAFARI_RECOVERY_REFOCUS_DELAY_MS);
  });
}

/**
 * Resolve recovery to the first unanswered task rather than trusting the page
 * index saved at the instant of interruption. A selected answer can be stored
 * before the participant presses Next, so the saved index may still point at an
 * already answered item.
 */
export function resolveDirectResumePosition(
  dimensions: Array<{ id: string }>,
  pairOrder: Array<{ id: string }>,
  ratings: Record<string, unknown>,
  pairResponses: Record<string, unknown>,
): { stage: RecoveryStage; ratingIndex?: number; pairIndex?: number } {
  const ratingIndex = dimensions.findIndex(({ id }) => !hasOwn(ratings, id));
  if (ratingIndex >= 0) return { stage: 'ratings', ratingIndex };

  const pairIndex = pairOrder.findIndex(({ id }) => !hasOwn(pairResponses, id));
  if (pairIndex >= 0) return { stage: 'pairs', pairIndex };

  return { stage: 'review' };
}

function restoreSavedSessionDirectly(component: InternalQuestionnaire) {
  const session = component.savedSession;
  if (!session) return;

  component.editingRatingFromReview = false;
  component.reviewRatingEdit = null;
  component.reviewReturnFocusIndex = null;
  component.pairOrder = session.pairOrder;
  component.pairResponses = session.pairResponses;
  component.ratings = session.ratings;
  component.ratingInputRoutes = session.ratingInputRoutes;
  component.pairInputRoutes = session.pairInputRoutes;
  component.supportChanges = session.supportChanges;
  component.startedAt = session.startedAt;

  if (component.canAdjustAllSupport) {
    component.answerMode = session.support.answerMode;
    component.showSimpleLanguage = session.support.showSimpleLanguage;
    component.largeText = session.support.largeText;
    component.audioGuidance = Boolean(session.support.audioGuidance);
  } else {
    component.applyConfiguredSupport();
    if (component.canAdjustPresentationSupport) {
      component.largeText = session.support.largeText;
      component.audioGuidance = Boolean(session.support.audioGuidance);
    }
  }

  const destination = resolveDirectResumePosition(
    component.dimensions,
    component.pairOrder,
    component.ratings,
    component.pairResponses,
  );
  component.stage = destination.stage;
  if (destination.ratingIndex !== undefined) component.ratingIndex = destination.ratingIndex;
  if (destination.pairIndex !== undefined) component.pairIndex = destination.pairIndex;

  component.recoveryEnabled = true;
  component.savedSession = null;
  component.savedSessionProblem = '';
  component.savedSessionAnnouncementKey = '';
  // Preserve the existing contextual return summary, but do not make it a
  // blocking recovery step. The restored task is already the first unanswered
  // task and focus is sent to that task's normal heading below.
  component.resumeSummaryVisible = true;
  component.interruptionSummaryShown = true;
  component.statusMessage = `Saved questionnaire resumed at ${component.currentPositionDescription()}.`;
  component.focusHeading();
}

function handleResumeClick(event: Event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const resume = target.closest('#resume-saved-questionnaire');
  if (!resume) return;
  const component = resume.closest('accessible-nasa-tlx, accessible-questionnaire') as
    | InternalQuestionnaire
    | null;
  if (!component?.savedSession) return;

  // Capture the actual user action before Lit's original click handler. This is
  // intentionally scoped to the one frozen A15 Resume control; all other
  // component events keep their existing behaviour.
  event.preventDefault();
  event.stopImmediatePropagation();
  restoreSavedSessionDirectly(component);
}

/**
 * RF-04 is deliberately installed as a narrowly scoped recovery policy while
 * the participant runner remains a single component. It changes only the two
 * behaviours covered by frozen A14/A15: initial recovery focus and the direct
 * resume destination. Questionnaire content, scoring, result provenance and
 * same-page interruption summaries are untouched.
 */
export function installRf04SavedSessionRecovery() {
  const constructor = customElements.get('accessible-nasa-tlx') as
    | InternalQuestionnaireConstructor
    | undefined;
  if (!constructor) {
    throw new Error('RF-04 recovery policy requires accessible-nasa-tlx to be registered first.');
  }

  const prototype = constructor.prototype;
  if (prototype[installedMarker]) return;

  prototype.announceSavedSessionOffer = function announceSavedSessionOffer(
    this: InternalQuestionnaire,
    session: SavedSessionLike,
  ) {
    const announcementKey = `${session.configId}:${session.participantCode}:${session.savedAt}`;
    if (this.savedSessionAnnouncementKey === announcementKey) return;
    this.savedSessionAnnouncementKey = announcementKey;

    const message = this.savedSessionOfferSpeech(session);
    this.statusMessage = '';
    void this.updateComplete.then(() => {
      if (!savedSessionStillMatches(this, session)) return;

      const resume = this.querySelector<HTMLButtonElement>('#resume-saved-questionnaire');
      if (resume) focusRecoveryResume(this, resume);

      window.setTimeout(() => {
        if (!savedSessionStillMatches(this, session)) return;

        this.statusMessage = message;
        if (this.audioGuidance) this.speakText(message);
        reassertSafariRecoveryFocus(this, session);
      }, 650);
    });
  };

  document.addEventListener('click', handleResumeClick, true);
  prototype[installedMarker] = true;
}
