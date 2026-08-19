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
  restoreSavedSession: () => void;
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
const instanceMarker = Symbol.for('aqp.rf04.saved-session-recovery.instance');

function hasOwn(record: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key);
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

function restoreSavedSessionDirectly(this: InternalQuestionnaire) {
  const session = this.savedSession;
  if (!session) return;

  this.editingRatingFromReview = false;
  this.reviewRatingEdit = null;
  this.reviewReturnFocusIndex = null;
  this.pairOrder = session.pairOrder;
  this.pairResponses = session.pairResponses;
  this.ratings = session.ratings;
  this.ratingInputRoutes = session.ratingInputRoutes;
  this.pairInputRoutes = session.pairInputRoutes;
  this.supportChanges = session.supportChanges;
  this.startedAt = session.startedAt;

  if (this.canAdjustAllSupport) {
    this.answerMode = session.support.answerMode;
    this.showSimpleLanguage = session.support.showSimpleLanguage;
    this.largeText = session.support.largeText;
    this.audioGuidance = Boolean(session.support.audioGuidance);
  } else {
    this.applyConfiguredSupport();
    if (this.canAdjustPresentationSupport) {
      this.largeText = session.support.largeText;
      this.audioGuidance = Boolean(session.support.audioGuidance);
    }
  }

  const destination = resolveDirectResumePosition(
    this.dimensions,
    this.pairOrder,
    this.ratings,
    this.pairResponses,
  );
  this.stage = destination.stage;
  if (destination.ratingIndex !== undefined) this.ratingIndex = destination.ratingIndex;
  if (destination.pairIndex !== undefined) this.pairIndex = destination.pairIndex;

  this.recoveryEnabled = true;
  this.savedSession = null;
  this.savedSessionProblem = '';
  this.savedSessionAnnouncementKey = '';
  this.resumeSummaryVisible = false;
  // A persisted-session reload is distinct from the same-page visibility
  // interruption summary. Do not claim that summary support was shown when
  // direct resume intentionally bypasses it.
  this.interruptionSummaryShown = false;
  this.statusMessage = `Saved questionnaire resumed at ${this.currentPositionDescription()}.`;
  this.focusHeading();
}

function patchRecoveryInstance(component: InternalQuestionnaire) {
  const marked = component as InternalQuestionnaire & Record<PropertyKey, unknown>;
  if (marked[instanceMarker]) return;
  component.restoreSavedSession = restoreSavedSessionDirectly.bind(component);
  marked[instanceMarker] = true;
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
      const current = this.savedSession;
      if (
        !current ||
        current.savedAt !== session.savedAt ||
        current.configId !== session.configId ||
        current.participantCode !== session.participantCode
      ) {
        return;
      }

      const resume = this.querySelector<HTMLButtonElement>('#resume-saved-questionnaire');
      if (resume) {
        focusAndReveal(resume, {
          block: 'center',
          forceCoordinateScroll: true,
          onReveal: () => this.requestParentReveal(resume),
        });
      }

      window.setTimeout(() => {
        const latest = this.savedSession;
        if (
          !this.isConnected ||
          !latest ||
          latest.savedAt !== session.savedAt ||
          latest.configId !== session.configId ||
          latest.participantCode !== session.participantCode
        ) {
          return;
        }

        this.statusMessage = message;
        if (this.audioGuidance) this.speakText(message);
      }, 650);
    });
  };

  const originalConnectedCallback = prototype.connectedCallback;
  prototype.connectedCallback = function connectedCallback(this: InternalQuestionnaire) {
    patchRecoveryInstance(this);
    return originalConnectedCallback.call(this);
  };

  // main.ts installs this policy immediately after the custom element module is
  // evaluated. Patch any element that was upgraded during customElements.define
  // before the first Lit update reaches the saved-session controls.
  document
    .querySelectorAll<HTMLElement>('accessible-nasa-tlx, accessible-questionnaire')
    .forEach((element) => patchRecoveryInstance(element as InternalQuestionnaire));

  prototype[installedMarker] = true;
}
