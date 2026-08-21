import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { focusAndReveal } from './accessibility-utils';
import {
  DEFAULT_QUESTIONNAIRE_ID,
  buildQuestionnairePairs,
  buildRatingValues,
  getQuestionnaireDefinition,
  resolveQuestionnaireDefinition,
  type ItemId as DimensionId,
  type QuestionnaireDefinition,
  type QuestionnaireItem as TlxDimension,
  type QuestionnairePair as TlxPair,
} from './questionnaire-definition';
import {
  scoreQuestionnaire,
  type PairResponses,
  type QuestionnaireScore,
  type Ratings,
} from './scoring';
import {
  configuredResultSink,
  installStudyResultSink,
  submitToApprovedResultSink,
  type InstalledStudyResultSink,
  type QualtricsBridgeState,
} from './result-sink';
import {
  PROTOTYPE_VERSION,
  createStudyResultRecord,
  downloadTextFile,
  loadCompletedResults,
  progressStorageKey,
  questionnaireDefinitionHash,
  readParticipantCodeFromHash,
  readStudyConfigFromHash,
  removeCompletedResult,
  resultFileBase,
  resultsToCsv,
  saveCompletedResult,
  validParticipantCode,
  type AnswerMode,
  type StudyConfig,
  type StudyResultRecord,
  type SupportChange,
  type SupportChangeSetting,
  type SupportMetadata,
} from './study';
import {
  buildPairSpeechHints,
  buildRatingSpeechHints,
  hasUnsafeSpeechMeaning,
  parsePairAlternatives,
  parseRatingAlternatives,
} from './voice-input';
import {
  preparePreferredSpeechRecognitionRoute,
  type OnDeviceSpeechRecognitionProvider,
  type PreparedSpeechRecognitionRoute,
} from './on-device-speech';
import {
  DwellTracker,
  WEBGAZER_FACE_MESH_URL,
  WEBGAZER_VERSION,
  isSecureGazeContext,
  loadWebGazer,
  type GazePoint,
  type WebGazerLike,
} from './webgazer-adapter';

type Stage = 'intro' | 'ratings' | 'pairs' | 'review' | 'complete';
type RatingInputRoute = 'standard-scale' | 'smiley-landmark' | 'voice' | 'gaze-standard-scale' | 'gaze-smiley-landmark';
type PairInputRoute = 'standard-choice' | 'voice' | 'gaze';
type VoiceState = 'idle' | 'listening' | 'pending' | 'error';
type GazeState = 'off' | 'loading' | 'positioning' | 'calibrating' | 'ready' | 'error';

interface PendingVoiceAnswer {
  context: 'rating' | 'pair';
  transcript: string;
  value: number | DimensionId;
  label: string;
}

interface ReviewRatingEdit {
  itemIndex: number;
  itemId: DimensionId;
  originalValue: number;
  originalInputRoute: RatingInputRoute | undefined;
  pendingValue: number;
  pendingInputRoute: RatingInputRoute | undefined;
}

interface TabParticipantBinding {
  version: 1;
  linkParticipantCode: string | null;
  activeParticipantCode: string;
}

interface SavedSession {
  version: 4;
  instrumentId: string;
  questionnaireDefinition: QuestionnaireDefinition;
  savedAt: number;
  startedAt: string;
  configId: string;
  participantCode: string;
  stage: 'ratings' | 'pairs' | 'review';
  ratingIndex: number;
  pairIndex: number;
  pairOrder: TlxPair[];
  pairResponses: PairResponses;
  ratings: Partial<Ratings>;
  ratingInputRoutes: Partial<Record<DimensionId, RatingInputRoute>>;
  pairInputRoutes: Record<string, PairInputRoute>;
  supportChanges: SupportChange[];
  support: {
    answerMode: AnswerMode;
    showSimpleLanguage: boolean;
    largeText: boolean;
    audioGuidance?: boolean;
  };
}

type LegacySavedSessionV3 = Omit<SavedSession, 'version' | 'instrumentId' | 'questionnaireDefinition'> & {
  version: 3;
};

type SavedSessionV4WithoutDefinition = Omit<SavedSession, 'questionnaireDefinition'>;

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionPhraseLike {
  readonly phrase: string;
  readonly boost: number;
}

interface SpeechRecognitionResultLike {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  processLocally?: boolean;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  phrases?: SpeechRecognitionPhraseLike[];
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = (new () => SpeechRecognitionLike) &
  OnDeviceSpeechRecognitionProvider;
type SpeechRecognitionPhraseConstructor = new (
  phrase: string,
  boost?: number,
) => SpeechRecognitionPhraseLike;

function isEnglishLanguage(language: string) {
  return language.trim().toLocaleLowerCase().split('-')[0] === 'en';
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognitionPhrase?: SpeechRecognitionPhraseConstructor;
  }
}

const CALIBRATION_POINTS = [
  { x: 12, y: 12 },
  { x: 50, y: 12 },
  { x: 88, y: 12 },
  { x: 12, y: 50 },
  { x: 50, y: 50 },
  { x: 88, y: 50 },
  { x: 12, y: 88 },
  { x: 50, y: 88 },
  { x: 88, y: 88 },
] as const;
const CALIBRATION_REPETITIONS = 3;

function shuffledPairs(definition: QuestionnaireDefinition) {
  const order = buildQuestionnairePairs(definition);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }
  return order;
}

@customElement('accessible-nasa-tlx')
export class AccessibleNasaTlx extends LitElement {
  @state() private stage: Stage = 'intro';
  @state() private ratingIndex = 0;
  @state() private pairIndex = 0;
  @state() private pairOrder = shuffledPairs(getQuestionnaireDefinition(DEFAULT_QUESTIONNAIRE_ID)!);
  @state() private pairResponses: PairResponses = {};
  @state() private ratings: Partial<Ratings> = {};
  @state() private ratingInputRoutes: Partial<Record<DimensionId, RatingInputRoute>> = {};
  @state() private pairInputRoutes: Record<string, PairInputRoute> = {};
  @state() private supportChanges: SupportChange[] = [];
  @state() private answerMode: AnswerMode = 'standard';
  @state() private showSimpleLanguage = false;
  @state() private largeText = false;
  @state() private recoveryEnabled = false;
  @state() private resumeSummaryVisible = false;
  @state() private savedSession: SavedSession | null = null;
  @state() private savedSessionProblem = '';
  @state() private recoveredCompletedRecord: StudyResultRecord | null = null;
  @state() private readingAloud = false;
  @state() private readAloudUsed = false;
  @state() private audioGuidance = false;
  @state() private audioStatusMessage = '';
  @state() private interruptionSummaryShown = false;
  @state() private voiceState: VoiceState = 'idle';
  @state() private voiceMessage = '';
  @state() private pendingVoiceAnswer: PendingVoiceAnswer | null = null;
  @state() private errorMessage = '';
  @state() private statusMessage = '';
  @state() private result: QuestionnaireScore | null = null;
  @state() private gazeState: GazeState = 'off';
  @state() private gazeMessage = '';
  @state() private gazeCalibrationIndex = 0;
  @state() private gazeCalibrationRepetition = 0;
  @state() private gazePendingLabel = '';
  @state() private gazeDwellProgress = 0;
  @state() private gazeUsed = false;
  @state() private gazeActionCount = 0;
  @state() private studyConfig: StudyConfig | null = null;
  @state() private configurationError = '';
  @state() private participantCode = '';
  @state() private participantCodeError = '';
  @state() private participantCodeRestoredForTab = false;
  @state() private editingRatingFromReview = false;
  @state() private reviewRatingEdit: ReviewRatingEdit | null = null;
  @state() private startedAt = '';
  @state() private submittedRecord: StudyResultRecord | null = null;
  @state() private completionSavedLocally = false;
  @state() private completionStagedByBridge = false;
  @state() private remoteRecordingUnconfirmed = false;
  @state() private hostSubmissionFailed = false;
  @state() private browserStorageFailed = false;
  @state() private submittingResult = false;
  @state() private hostBridgeState: QualtricsBridgeState | 'not-required' = 'not-required';
  @state() private hostBridgeMessage = '';

  private hiddenAt: number | null = null;
  private recognition: SpeechRecognitionLike | null = null;
  private webgazer: WebGazerLike | null = null;
  private gazeCandidateElement: HTMLElement | null = null;
  private gazePendingElement: HTMLElement | null = null;
  private gazeActivationInProgress = false;
  private speechRequestId = 0;
  private savedSessionAnnouncementKey = '';
  private configurationApplied = false;
  private prefilledParticipantCode = '';
  private invalidParticipantParameter = false;
  private reviewReturnFocusIndex: number | null = null;
  private installedResultSink: InstalledStudyResultSink | null = null;
  private readonly gazeCandidateTracker = new DwellTracker(1000);
  private readonly gazeConfirmationTracker = new DwellTracker(1200);

  connectedCallback() {
    super.connectedCallback();
    this.loadStudyConfiguration();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('hashchange', this.handleParticipantStudyHashChange);
    queueMicrotask(() => {
      this.restoreParticipantCodeForTab();
      this.findSavedSession();
      this.findCompletedBackup();
      if (this.participantCodeRestoredForTab && !this.savedSession && this.recoveredCompletedRecord) {
        void this.updateComplete.then(() => {
          const heading = this.querySelector<HTMLElement>('#completed-backup-heading');
          if (heading) {
            focusAndReveal(heading, {
              block: 'start',
              onReveal: () => this.requestParentReveal(heading),
            });
          }
        });
      }
    });
  }

  disconnectedCallback() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('hashchange', this.handleParticipantStudyHashChange);
    this.installedResultSink?.bridge.disconnect();
    this.installedResultSink = null;
    this.stopReading(false);
    this.releaseRecognition();
    this.stopGazeInputInternal(false);
    super.disconnectedCallback();
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  private loadStudyConfiguration() {
    if (this.configurationApplied) return;
    this.configurationApplied = true;
    const parameters = new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash);
    const config = readStudyConfigFromHash(window.location.hash);
    if (parameters.has('study') && !config) {
      this.configurationError = 'This participant link contains an invalid or incompatible study configuration. Ask the study conductor for a new link.';
      return;
    }
    if (!config) return;
    this.studyConfig = config;
    const participantParameter = parameters.get('participant');
    const participantCode = readParticipantCodeFromHash(window.location.hash);
    if (participantCode) {
      this.prefilledParticipantCode = participantCode;
      this.participantCode = participantCode;
    } else if (participantParameter) {
      this.invalidParticipantParameter = true;
      this.participantCodeError =
        'The participant code in this link is invalid. Enter the approved pseudonymous code manually or ask the study conductor for a new link.';
    }
    this.pairOrder = shuffledPairs(this.definition);
    this.applyConfiguredSupport();
    if (config.collection.mode === 'qualtrics') {
      if (window.parent === window) {
        this.configurationError =
          'This centrally collected questionnaire must be opened from the approved Qualtrics survey link. Ask the study conductor for that link.';
        return;
      }
      if (document.referrer) {
        try {
          if (new URL(document.referrer).origin !== config.collection.parentOrigin) {
            this.configurationError =
              'This questionnaire was embedded by an unexpected website. Ask the study conductor for the approved Qualtrics survey link.';
            return;
          }
        } catch {
          this.configurationError =
            'The embedding website could not be verified. Ask the study conductor for the approved Qualtrics survey link.';
          return;
        }
      }
      this.hostBridgeState = 'connecting';
      this.installedResultSink = installStudyResultSink(
        config,
        window,
        ({ state, message }) => {
          this.hostBridgeState = state;
          this.hostBridgeMessage = message;
        },
        (message) => {
          this.remoteRecordingUnconfirmed = true;
          this.statusMessage = message;
          this.announceAutomatic(this.currentStepSpeech());
          void this.updateComplete.then(() => {
            const error = this.querySelector<HTMLElement>('#remote-recording-error');
            if (error) {
              focusAndReveal(error, {
                block: 'start',
                onReveal: () => this.requestParentReveal(error),
              });
            }
          });
        },
      );
    }
  }

  private applyConfiguredSupport() {
    const support = this.studyConfig?.support;
    if (!support) return;
    this.showSimpleLanguage = support.showSimpleLanguage;
    this.answerMode = support.answerMode;
    this.largeText = support.largeText;
    this.audioGuidance = support.audioGuidance;
    this.recoveryEnabled = support.recoveryEnabled;
  }

  private get definition() {
    const instrumentId = this.studyConfig?.instrumentId ?? DEFAULT_QUESTIONNAIRE_ID;
    return resolveQuestionnaireDefinition(
      instrumentId,
      this.studyConfig?.questionnaireDefinition,
    )!;
  }

  private get dimensions() {
    return this.definition.items;
  }

  private get pairs() {
    return buildQuestionnairePairs(this.definition);
  }

  private get ratingValues() {
    return buildRatingValues(this.definition);
  }

  private get smileyLandmarks() {
    return this.definition.landmarks ?? [];
  }

  private get isResearcherSuppliedDefinition() {
    return Boolean(this.studyConfig?.questionnaireDefinition);
  }

  private get dimensionById() {
    return new Map(this.dimensions.map((item) => [item.id, item]));
  }

  private get canAdjustAllSupport() {
    return !this.studyConfig || this.studyConfig.support.participantAdjustmentPolicy === 'participant-choice';
  }

  private get canAdjustPresentationSupport() {
    return (
      !this.studyConfig ||
      this.studyConfig.support.participantAdjustmentPolicy === 'presentation-only' ||
      this.studyConfig.support.participantAdjustmentPolicy === 'participant-choice'
    );
  }

  private get voiceInputAvailable() {
    return !this.studyConfig || this.studyConfig.support.voiceInputAvailable;
  }

  private get gazeInputAvailable() {
    return !this.studyConfig || this.studyConfig.support.gazeInputAvailable;
  }

  protected render() {
    return html`
      <a class="skip-link" href="#question-panel" @click=${this.handleSkipToCurrentQuestion}
        >Skip to the current question</a
      >
      <main class=${`app-shell${this.largeText ? ' large-text' : ''}`} id="main-content">
        <p class="sr-only" aria-live="polite" aria-atomic="true">${this.statusMessage}</p>
        <header class="app-header">
          <p class="eyebrow">Accessible questionnaire platform · Version ${PROTOTYPE_VERSION}</p>
          <h1 lang=${this.definition.language} dir="auto">${this.definition.name}</h1>
          <p class="subtitle" lang=${this.definition.language} dir="auto">${this.definition.description}</p>
        </header>

        ${this.resumeSummaryVisible ? this.renderResumeSummary() : nothing}
        ${this.stage !== 'intro' && this.stage !== 'complete' ? this.renderProgress() : nothing}
        ${this.stage !== 'intro' && this.stage !== 'complete' ? this.renderInQuestionSupport() : nothing}
        ${this.gazePendingElement ? this.renderGazeConfirmation() : nothing}
        ${this.errorMessage
          ? html`<div class="error-summary" role="alert" tabindex="-1" id="error-summary">
              <h2>There is a problem</h2>
              <p>${this.errorMessage}</p>
            </div>`
          : nothing}

        ${this.renderStage()}
      </main>
      ${this.gazeState === 'positioning' ? this.renderGazePositioning() : nothing}
      ${this.gazeState === 'calibrating' ? this.renderGazeCalibration() : nothing}
    `;
  }

  private renderInQuestionSupport() {
    if (this.studyConfig && !this.canAdjustAllSupport && !this.canAdjustPresentationSupport) {
      return nothing;
    }
    return html`
      ${this.studyConfig
        ? this.canAdjustAllSupport
          ? html`<details class="support-toolbar">
              <summary>Adjust accessibility support (optional)</summary>
              <p>
                The study conductor has already prepared usable starting settings. You may change optional support if it
                helps you complete the questionnaire; every change is recorded separately from your scored answers.
              </p>
              ${this.renderSupportSettings('toolbar', 'all')}
            </details>`
          : this.canAdjustPresentationSupport
          ? html`<details class="support-toolbar">
              <summary>Adjust display, audio or recovery (optional)</summary>
              <p>
                The study answer presentation and simpler-explanation setting remain fixed. You do not need to
                change these optional preferences to continue.
              </p>
              ${this.renderSupportSettings('toolbar', 'presentation-only')}
            </details>`
          : nothing
        : html`<details class="support-toolbar">
            <summary>Adjust accessibility support (optional)</summary>
            ${this.renderSupportSettings('toolbar', 'all')}
          </details>`}
      ${this.renderGazeSetup()}
    `;
  }

  private renderStage() {
    switch (this.stage) {
      case 'intro':
        return this.renderIntro();
      case 'ratings':
        return this.renderRating();
      case 'pairs':
        return this.renderPair();
      case 'review':
        return this.renderReview();
      case 'complete':
        return this.renderComplete();
    }
  }

  private renderIntro() {
    const startLabel =
      this.definition.id === DEFAULT_QUESTIONNAIRE_ID
        ? 'Start the six ratings'
        : `Start the ${this.dimensions.length} items`;
    return html`
      <section class="panel" id="question-panel" aria-labelledby="intro-heading">
        <h2 id="intro-heading">Before you begin</h2>
        ${this.configurationError
          ? html`<div class="error-summary" role="alert"><h3>Study link problem</h3><p>${this.configurationError}</p></div>`
          : nothing}
        ${this.studyConfig?.collection.mode === 'qualtrics' && this.hostBridgeState !== 'connected'
          ? html`<div
              class=${this.hostBridgeState === 'failed' ? 'error-summary' : 'study-context'}
              role=${this.hostBridgeState === 'failed' ? 'alert' : 'status'}
            >
              <h3>${this.hostBridgeState === 'failed'
                ? 'Qualtrics connection problem'
                : 'Checking secure result collection'}</h3>
              <p>${this.hostBridgeMessage}</p>
              <p>The questionnaire cannot start until the matching collection bridge is connected.</p>
            </div>`
          : nothing}
        ${this.renderStudyContext()}
        ${this.savedSession ? this.renderSavedSessionOffer() : nothing}
        ${this.savedSessionProblem
          ? html`<aside class="error-summary" role="status" aria-labelledby="saved-session-problem-heading">
              <h3 id="saved-session-problem-heading">Saved progress could not be restored</h3>
              <p>${this.savedSessionProblem}</p>
            </aside>`
          : nothing}
        ${this.recoveredCompletedRecord ? this.renderCompletedBackupOffer() : nothing}
        <p lang=${this.definition.language} dir="auto">${this.definition.introPrompt}</p>
        <p>
          Answer ${this.dimensions.length} item${this.dimensions.length === 1 ? '' : 's'}${this.pairs.length
            ? ` and ${this.pairs.length} comparison${this.pairs.length === 1 ? '' : 's'}`
            : ''}, review every answer, then submit.
        </p>

        <details class="support-toolbar participant-support-setup">
          <summary>Accessibility and audio options (optional)</summary>
          <p>
            Screen readers can use the page headings, labels and status messages. Built-in audio is a separate option.
          </p>
          ${this.studyConfig ? this.renderConfiguredSupportSummary() : nothing}
          ${this.studyConfig
            ? this.canAdjustAllSupport
              ? this.renderSupportSettings('intro', 'all')
              : this.canAdjustPresentationSupport
                ? this.renderSupportSettings('intro', 'presentation-only')
                : nothing
            : this.renderSupportSettings('intro', 'all')}
          ${this.renderReadAloudControl()}
          ${this.renderGazeSetup()}
          <p class="support-boundary">
            ${this.definition.officialContentNotice} Optional support use is recorded separately from scored answers.
          </p>
        </details>

        <button
          class="primary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label=${startLabel}
          ?disabled=${Boolean(this.configurationError) ||
            (this.studyConfig?.collection.mode === 'qualtrics' && this.hostBridgeState !== 'connected')}
          @click=${this.startQuestionnaire}
        >
          ${startLabel}
        </button>
      </section>
    `;
  }

  private renderStudyContext() {
    if (!this.studyConfig) {
      return html`<aside class="study-context demo-context">
        <h3>Demonstration mode</h3>
        <p>This page is a technical demonstration. It does not upload answers or act as a remote research-data system.</p>
      </aside>`;
    }
    return html`
      <aside class="study-context" aria-labelledby="study-context-heading">
        <h3 id="study-context-heading">${this.studyConfig.studyTitle}</h3>
        <p>Think about: <strong>${this.studyConfig.taskLabel}</strong></p>
        <label class="participant-code-field" for="participant-code">
          <strong>Pseudonymous participant code</strong>
          <span>The link normally fills this in. If it is blank, use the code provided by the study conductor. Do not enter your name or email.</span>
          <input
            id="participant-code"
            name="participant-code"
            type="text"
            maxlength="32"
            autocomplete="off"
            spellcheck="false"
            .value=${this.participantCode}
            aria-describedby="participant-code-help"
            aria-invalid=${this.participantCodeError ? 'true' : 'false'}
            @input=${this.setParticipantCode}
          />
        </label>
        <p id="participant-code-help" class=${this.participantCodeError ? 'field-error' : 'support-boundary'}>
          ${this.participantCodeError ||
          (this.recoveryEnabled
            ? 'You may correct the code. If this page reloads in the same tab, the code is restored so interrupted answers can be found.'
            : 'Letters, numbers, hyphens and underscores only; maximum 32 characters.')}
        </p>
        ${this.participantCodeRestoredForTab
          ? html`<p class="restored-code-note" role="status">
              Participant code restored for this tab. It will be forgotten when this tab is closed.
            </p>`
          : nothing}
      </aside>
    `;
  }

  private renderConfiguredSupportSummary() {
    const support = this.studyConfig?.support;
    if (!support) return nothing;
    return html`
      <aside class="configured-support" aria-labelledby="configured-support-heading">
        <h3 id="configured-support-heading">Support prepared by the study conductor</h3>
        <p>You do not need to configure the questionnaire before starting.</p>
        <ul>
          ${this.definition.supports.simplerExplanations
            ? html`<li>${support.showSimpleLanguage ? 'Simpler explanations shown' : 'Optional simpler help hidden'}</li>`
            : html`<li>Official item wording only; no reworded item support is enabled for this instrument</li>`}
          <li>
            ${support.answerMode === 'smiley'
              ? 'Smiley landmark rating view'
              : `Standard ${this.ratingValues.length}-value rating scale`}
          </li>
          <li>${support.largeText ? 'Large text' : 'Standard text size'}</li>
          <li>${support.recoveryEnabled ? 'Interruption recovery on' : 'Interruption recovery off'}</li>
          <li>${support.voiceInputAvailable ? 'Confirmed voice input available' : 'Built-in voice input not included'}</li>
          <li>${support.gazeInputAvailable ? 'Experimental gaze input available' : 'Experimental gaze input not included'}</li>
        </ul>
        <p>
          ${support.participantAdjustmentPolicy === 'participant-choice'
            ? 'The starting settings are already applied. You may optionally change any support control shown below. Each change is recorded separately from your answers.'
            : support.participantAdjustmentPolicy === 'presentation-only'
              ? 'You may optionally change text size, automatic spoken guidance or interruption recovery. The answer presentation and simpler-explanation setting remain fixed.'
              : 'The prepared settings remain fixed for this study. You can still use any answer route that the study conductor made available.'}
        </p>
      </aside>
    `;
  }

  private renderSupportSettings(context: 'intro' | 'toolbar', scope: 'all' | 'presentation-only') {
    const prefix = `support-${context}`;
    const audioAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    return html`
      <fieldset class="support-settings">
        <legend>${scope === 'all' ? 'Accessibility support options' : 'Display and recovery preferences'}</legend>

        ${scope === 'all' && this.definition.supports.simplerExplanations
          ? html`<label class="toggle-card" for=${`${prefix}-simple`}>
            <input
              id=${`${prefix}-simple`}
              type="checkbox"
              .checked=${this.showSimpleLanguage}
              @change=${(event: Event) => this.setSimpleLanguage(event)}
            />
            <span>
              <strong>Show simpler explanations</strong>
              <small>
                ${this.isResearcherSuppliedDefinition
                  ? 'The questionnaire item remains visible once, without being duplicated inside the help.'
                  : 'The official item remains visible once, without being duplicated inside the help.'}
              </small>
            </span>
          </label>`
          : nothing}

        ${scope === 'all' && this.definition.supports.smileyLandmarks
          ? html`<fieldset class="answer-mode-control">
            <legend>Rating answer format</legend>
            <label for=${`${prefix}-standard-answer`}>
              <input
                id=${`${prefix}-standard-answer`}
                type="radio"
                name=${`${prefix}-answer-mode`}
                value="standard"
                .checked=${this.answerMode === 'standard'}
                @change=${() => this.setAnswerMode('standard')}
              />
              <span>
                <strong>Standard ${this.ratingValues.length}-value scale</strong>
                <small>Official ${this.definition.shortName} response values.</small>
              </span>
              ${this.answerMode === 'standard'
                ? html`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`
                : nothing}
            </label>
            <label for=${`${prefix}-smiley-answer`}>
              <input
                id=${`${prefix}-smiley-answer`}
                type="radio"
                name=${`${prefix}-answer-mode`}
                value="smiley"
                .checked=${this.answerMode === 'smiley'}
                @change=${() => this.setAnswerMode('smiley')}
              />
              <span>
                <strong>Smiley landmarks</strong>
                <small>Experimental five-value view; the precise scale is available only on request.</small>
              </span>
              ${this.answerMode === 'smiley'
                ? html`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`
                : nothing}
            </label>
          </fieldset>`
          : nothing}

        <fieldset class="text-size-control">
          <legend>Text size</legend>
          <label for=${`${prefix}-standard-text`}>
            <input
              id=${`${prefix}-standard-text`}
              type="radio"
              name=${`${prefix}-text-size`}
              value="standard"
              .checked=${!this.largeText}
              @change=${() => this.setLargeText(false)}
            />
            Standard
          </label>
          <label for=${`${prefix}-large-text`}>
            <input
              id=${`${prefix}-large-text`}
              type="radio"
              name=${`${prefix}-text-size`}
              value="large"
              .checked=${this.largeText}
              @change=${() => this.setLargeText(true)}
            />
            Large
          </label>
        </fieldset>

        <label class="toggle-card" for=${`${prefix}-audio`}>
          <input
            id=${`${prefix}-audio`}
            type="checkbox"
            .checked=${this.audioGuidance}
            ?disabled=${!audioAvailable}
            @change=${this.setAudioGuidance}
          />
          <span>
            <strong>Read new questions and feedback aloud</strong>
            <small>${audioAvailable
              ? 'Default off. Leave this off when a screen reader is already speaking.'
              : 'Built-in audio is unavailable in this browser.'}</small>
          </span>
        </label>

        <label class="toggle-card" for=${`${prefix}-recovery`}>
          <input
            id=${`${prefix}-recovery`}
            type="checkbox"
            .checked=${this.recoveryEnabled}
            @change=${(event: Event) => this.setRecovery(event)}
          />
          <span>
            <strong>Save progress and show a return summary</strong>
            <small>Stores incomplete answers only in this browser so an interruption or reload can be recovered.</small>
          </span>
        </label>
      </fieldset>
    `;
  }

  private renderReadAloudControl() {
    const available = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    return html`
      <div class="quick-support audio-guidance" role="group" aria-label="Built-in audio guidance">
        <div>
          <strong>Built-in audio guidance (produces sound)</strong>
          <p>
            This is separate from screen-reader compatibility. Leave automatic audio off when using NVDA or VoiceOver
            to avoid two voices speaking at once.
          </p>
        </div>
        <button
          class="secondary-button large-answer-button"
          type="button"
          ?disabled=${!available}
          @click=${this.toggleReadAloud}
        >
          ${this.readingAloud ? 'Stop speech' : 'Hear a summary of this step'}
        </button>
        ${this.audioStatusMessage
          ? html`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`
          : nothing}
        <small>Automatic spoken guidance is ${this.audioGuidance ? 'on' : 'off'}.</small>
        <small>
          ${available
            ? 'Uses the browser speech-synthesis voice; no audio is recorded.'
            : 'Built-in audio is unavailable in this browser. External screen readers can still use the semantic page.'}
        </small>
      </div>
    `;
  }

  private renderCompletionReadAloudControl() {
    const available = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    return html`
      <div class="quick-support audio-guidance completion-audio" role="group" aria-label="Result audio guidance">
        <button
          class="secondary-button large-answer-button"
          type="button"
          ?disabled=${!available}
          @click=${this.toggleReadAloud}
        >
          ${this.readingAloud ? 'Stop speech' : 'Hear the result summary'}
        </button>
        ${this.audioStatusMessage
          ? html`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`
          : nothing}
        <small>
          ${available
            ? 'Uses the browser speech-synthesis voice; no audio is recorded.'
            : 'Built-in audio is unavailable in this browser. External screen readers can still read the result.'}
        </small>
      </div>
    `;
  }

  private renderGazeSetup() {
    if (!this.gazeInputAvailable) return nothing;
    const secureContext = isSecureGazeContext(window.location);
    const active =
      this.gazeState === 'loading' ||
      this.gazeState === 'positioning' ||
      this.gazeState === 'calibrating' ||
      this.gazeState === 'ready';
    return html`
      <details class="gaze-setup" .open=${this.gazeState !== 'off'}>
        <summary>Gaze-assisted answering with WebGazer (experimental)</summary>
        <div class="gaze-setup-content">
          <p>
            Uses the webcam to estimate where you look. After calibration, look at a large answer or navigation control
            for one second to propose it, then look at the separate Confirm control for 1.2 seconds. Looking alone never submits immediately.
          </p>
          <ul>
            <li>Requires webcam permission and an HTTPS website or localhost; it is not available from the downloaded file.</li>
            <li>Video is processed in this browser and is not stored by this questionnaire.</li>
            <li>WebGazer ${WEBGAZER_VERSION} is loaded only after you start this feature; its code and face model come from jsDelivr.</li>
            <li>The camera preview is shown only while you position your face. It is hidden before calibration and answering.</li>
            <li>Webcam gaze estimation can be inaccurate and needs recalibration. Standard, keyboard and voice controls remain available.</li>
          </ul>
          ${!secureContext
            ? html`<p class="gaze-warning" role="status">
                Gaze input requires the future HTTPS-hosted demo. Continue using the other answer routes in this downloaded file.
              </p>`
            : nothing}
          <div class="button-row compact">
            ${active
              ? html`<button class="secondary-button large-answer-button" type="button" @click=${this.stopGazeInput}>
                  Stop gaze and camera
                </button>`
              : html`<button
                  class="secondary-button large-answer-button"
                  type="button"
                  ?disabled=${!secureContext}
                  @click=${this.startGazeInput}
                >
                  ${this.gazeState === 'error' ? 'Try gaze setup again' : 'Start camera and calibration'}
                </button>`}
            ${this.gazeState === 'ready'
              ? html`<button class="secondary-button" type="button" @click=${this.restartGazeCalibration}>
                  Recalibrate
                </button>`
              : nothing}
          </div>
          ${this.gazeMessage ? html`<p class="gaze-status" role="status">${this.gazeMessage}</p>` : nothing}
        </div>
      </details>
    `;
  }

  private renderGazePositioning() {
    return html`
      <div class="gaze-positioning" role="dialog" aria-modal="true" aria-labelledby="gaze-positioning-heading">
        <section class="gaze-positioning-card">
          <h2 id="gaze-positioning-heading" tabindex="-1">Position your camera</h2>
          <p>
            Centre your face in the preview and keep the device steady. This preview is for positioning only and will
            disappear before calibration.
          </p>
          <div
            class="gaze-camera-preview-slot"
            role="img"
            aria-label="Live camera positioning preview"
          ></div>
          <p class="gaze-positioning-tip">
            Make sure your whole face is visible, the lighting is even and your eyes are not covered. On a phone or
            tablet, place the device on a stable support if possible.
          </p>
          <div class="button-row gaze-positioning-actions">
            <button class="primary-button large-answer-button" type="button" @click=${this.beginGazeCalibration}>
              Continue to calibration
            </button>
            <button class="secondary-button large-answer-button" type="button" @click=${this.stopGazeInput}>
              Cancel gaze setup
            </button>
          </div>
        </section>
      </div>
    `;
  }

  private renderGazeCalibration() {
    const point = CALIBRATION_POINTS[this.gazeCalibrationIndex];
    const completed = this.gazeCalibrationIndex * CALIBRATION_REPETITIONS + this.gazeCalibrationRepetition;
    const total = CALIBRATION_POINTS.length * CALIBRATION_REPETITIONS;
    return html`
      <div class="gaze-calibration" role="dialog" aria-modal="true" aria-labelledby="gaze-calibration-heading">
        <div class="gaze-calibration-instructions">
          <h2 id="gaze-calibration-heading">Gaze calibration</h2>
          <p>Keep your head steady. Look at the numbered target, then click it or press Enter/Space three times.</p>
          <p><strong>${completed} of ${total}</strong> calibration samples completed.</p>
          <button class="secondary-button" type="button" @click=${this.stopGazeInput}>Cancel gaze setup</button>
        </div>
        <div class="gaze-calibration-field">
          <button
            class="calibration-point"
            type="button"
            style=${`left: clamp(3rem, ${point.x}%, calc(100% - 3rem)); top: clamp(3rem, ${point.y}%, calc(100% - 3rem))`}
            aria-label=${`Calibration point ${this.gazeCalibrationIndex + 1} of ${CALIBRATION_POINTS.length}, sample ${this.gazeCalibrationRepetition + 1} of ${CALIBRATION_REPETITIONS}`}
            @click=${this.recordCalibrationPoint}
          >
            ${this.gazeCalibrationIndex + 1}
            <span>${this.gazeCalibrationRepetition + 1}/${CALIBRATION_REPETITIONS}</span>
          </button>
        </div>
      </div>
    `;
  }

  private renderGazeConfirmation() {
    return html`
      <aside class="gaze-confirmation" aria-labelledby="gaze-confirmation-heading">
        <h2 id="gaze-confirmation-heading">Gaze proposal</h2>
        <p>You looked at: <strong>${this.gazePendingLabel}</strong></p>
        <p>Look at Confirm for 1.2 seconds, or cancel. This second step prevents an ordinary glance from becoming an answer.</p>
        <div class="gaze-confirmation-actions">
          <button
            class="primary-button large-answer-button gaze-confirm-target"
            type="button"
            data-gaze-confirm
            style=${`--gaze-progress: ${this.gazeDwellProgress * 100}%`}
            @click=${this.confirmGazeProposal}
          >
            Confirm ${this.gazePendingLabel}
          </button>
          <button
            class="secondary-button large-answer-button gaze-cancel-target"
            type="button"
            data-gaze-cancel
            style=${`--gaze-progress: ${this.gazeDwellProgress * 100}%`}
            @click=${this.cancelGazeProposal}
          >
            Cancel gaze proposal
          </button>
        </div>
      </aside>
    `;
  }

  private renderProgress() {
    const completed = Object.keys(this.ratings).length + Object.keys(this.pairResponses).length;
    const total = this.dimensions.length + this.pairOrder.length;
    const section = this.stage === 'ratings' ? 'Ratings' : this.stage === 'pairs' ? 'Comparisons' : 'Review';
    return html`
      <nav class="progress-card" aria-label="Questionnaire progress">
        <p><strong>${section}:</strong> ${completed} of ${total} responses completed</p>
        <progress max=${total} value=${completed}>${completed} of ${total}</progress>
      </nav>
    `;
  }

  private renderRating() {
    const dimension = this.dimensions[this.ratingIndex];
    const selected = this.editingRatingFromReview && this.reviewRatingEdit?.itemId === dimension.id
      ? this.reviewRatingEdit.pendingValue
      : this.ratings[dimension.id];
    return html`
      <section class="panel" id="question-panel" aria-labelledby="rating-heading">
        <p class="step-label">Rating ${this.ratingIndex + 1} of ${this.dimensions.length}</p>
        <h2 id="rating-heading" lang=${this.definition.language} dir="auto">${dimension.name}</h2>
        <p class="official-definition">
          <strong>${this.isResearcherSuppliedDefinition
            ? 'Questionnaire item'
            : this.pairs.length
            ? 'Official definition'
            : 'Official item'}:</strong>
          <span lang=${this.definition.language} dir="auto">${dimension.prompt}</span>
        </p>

        ${!this.definition.supports.simplerExplanations
          ? nothing
          : this.showSimpleLanguage
          ? html`<aside class="simple-language-panel" aria-label="Simpler explanation">
              <p class="support-label">Simpler explanation</p>
              <p>${dimension.simpleExplanation}</p>
              <p class="support-boundary">
                Use the declared response scale when choosing your response.
              </p>
            </aside>`
          : html`<details
              class="optional-explanation"
              @toggle=${(event: Event) =>
                this.speakOpenedHelp(event, `Simpler explanation for ${dimension.name}. ${dimension.simpleExplanation}`)}
            >
              <summary>Show a simpler explanation</summary>
              <div class="explanation-block">
                <p>${dimension.simpleExplanation}</p>
                <p class="support-boundary">
                  This help does not replace the questionnaire item.
                </p>
              </div>
            </details>`}

        ${this.answerMode === 'smiley' && this.definition.supports.smileyLandmarks
          ? html`
              ${this.renderSmileyResponse(dimension, selected)}
              <details class="precision-scale">
                <summary>Choose a more precise value on the full scale</summary>
                ${this.renderFullRatingScale(dimension, selected)}
              </details>
            `
          : this.renderFullRatingScale(dimension, selected)}

        ${this.renderVoiceInput('rating', dimension)}
        ${this.renderNavigation(this.ratingIndex > 0, 'rating')}
      </section>
    `;
  }

  private renderFullRatingScale(dimension: TlxDimension, selected: number | undefined) {
    const semanticDifferential = this.definition.scale.type === 'semantic-differential';
    const hasFullyLabelledOptions = Boolean(dimension.responseLabels);
    return html`
      <fieldset class="rating-fieldset">
        <legend>
          ${semanticDifferential
            ? html`Choose one position for
                <span lang=${this.definition.language} dir="auto">${dimension.name}</span>, from
                <span lang=${this.definition.language} dir="auto">${dimension.lowAnchor}</span> to
                <span lang=${this.definition.language} dir="auto">${dimension.highAnchor}</span>`
            : html`Choose one answer for
                <span lang=${this.definition.language} dir="auto">${dimension.name}</span>:
                ${this.definition.scale.minimum} is
                <span lang=${this.definition.language} dir="auto">${dimension.lowAnchor}</span>;
                ${this.definition.scale.maximum} is
                <span lang=${this.definition.language} dir="auto">${dimension.highAnchor}</span>`}
        </legend>
        <div class="rating-anchors" aria-hidden="true">
          <span>${semanticDifferential ? nothing : `${this.definition.scale.minimum} — `}<span lang=${this.definition.language} dir="auto">${dimension.lowAnchor}</span></span>
          <span>${semanticDifferential ? nothing : `${this.definition.scale.maximum} — `}<span lang=${this.definition.language} dir="auto">${dimension.highAnchor}</span></span>
        </div>
        <div class=${`rating-grid${semanticDifferential
          ? ' semantic-differential-grid'
          : hasFullyLabelledOptions
          ? ' fully-labelled-rating-grid'
          : ''}`}>
          ${this.ratingValues.map((value) => {
            const inputId = `rating-${dimension.id}-${value}`;
            const optionLabel = this.ratingOptionLabel(dimension, value);
            const visibleResponseLabel = this.visibleResponseLabel(dimension, value);
            return html`
              <label
                class="rating-option"
                for=${inputId}
                data-gaze-target
                data-gaze-label=${optionLabel}
              >
                <input
                  id=${inputId}
                  type="radio"
                  name=${`rating-${dimension.id}`}
                  value=${value}
                  .required=${value === this.definition.scale.minimum}
                  .checked=${selected === value}
                  aria-label=${optionLabel}
                  @change=${() => this.selectRating(dimension.id, value, 'standard-scale')}
                />
                <span class="rating-option-content">
                  ${semanticDifferential
                    ? html`<span class="semantic-position-dot" aria-hidden="true"></span>`
                    : html`<strong>${value}</strong>`}
                  ${visibleResponseLabel
                    ? html`<small lang=${this.definition.language} dir="auto">${visibleResponseLabel}</small>`
                    : nothing}
                </span>
                ${selected === value
                  ? html`<span class="selected-marker selected-check" aria-hidden="true">✓</span>`
                  : nothing}
              </label>
            `;
          })}
        </div>
      </fieldset>
    `;
  }

  private renderSmileyResponse(dimension: TlxDimension, selected: number | undefined) {
    return html`
      <fieldset class="smiley-response">
        <legend>Rate ${dimension.name} with a smiley landmark</legend>
        <p id=${`smiley-help-${dimension.id}`}>
          Each face is one official value. Facial expression may imply good or bad, so this route is experimental.
        </p>
        <div class="smiley-grid">
          ${this.smileyLandmarks.map(({ value, cue }) => {
            const inputId = `smiley-${dimension.id}-${value}`;
            return html`
              <label
                class="smiley-option"
                for=${inputId}
                data-gaze-target
                data-gaze-label=${`${value} for ${dimension.name}`}
              >
                <input
                  id=${inputId}
                  type="radio"
                  name=${`smiley-${dimension.id}`}
                  value=${value}
                  .required=${value === this.smileyLandmarks[0]?.value}
                  .checked=${selected === value}
                  aria-label=${`${value}, ${this.landmarkLabel(dimension, value)}, for ${dimension.name}`}
                  aria-describedby=${`smiley-help-${dimension.id}`}
                  @change=${() => this.selectRating(dimension.id, value, 'smiley-landmark')}
                />
                <span class="smiley-option-content">
                  <span class="smiley-face" aria-hidden="true">${cue}</span>
                  <strong>${value}</strong>
                  <small>${this.landmarkLabel(dimension, value)}</small>
                  ${selected === value
                    ? html`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`
                    : nothing}
                </span>
              </label>
            `;
          })}
        </div>
      </fieldset>
    `;
  }

  private renderPair() {
    const pair = this.pairOrder[this.pairIndex];
    const left = this.dimensionById.get(pair.left)!;
    const right = this.dimensionById.get(pair.right)!;
    const selected = this.pairResponses[pair.id];
    return html`
      <section class="panel" id="question-panel" aria-labelledby="pair-heading">
        <p class="step-label">Comparison ${this.pairIndex + 1} of ${this.pairOrder.length}</p>
        <h2 id="pair-heading">${this.definition.pairwise!.prompt}</h2>
        <p class="pair-instruction">
          ${this.definition.pairwise!.instruction}
        </p>

        ${this.renderPairHelp(left, right)}
        <fieldset class="choice-fieldset">
          <legend>Choose one factor</legend>
          ${this.renderPairChoice(pair.id, left, selected === left.id)}
          ${this.renderPairChoice(pair.id, right, selected === right.id)}
        </fieldset>

        ${this.renderVoiceInput('pair', left, right)}
        ${this.renderNavigation(true, 'pair')}
      </section>
    `;
  }

  private renderPairChoice(pairId: string, dimension: TlxDimension, checked: boolean) {
    const inputId = `${pairId}-${dimension.id}`;
    return html`
      <label
        class="choice-card"
        for=${inputId}
        data-gaze-target
        data-gaze-label=${dimension.name}
      >
        <input
          id=${inputId}
          type="radio"
          name=${pairId}
          value=${dimension.id}
          required
          .checked=${checked}
          @change=${() => this.selectPair(pairId, dimension.id, 'standard-choice')}
        />
        <span>
          <strong>${dimension.name}</strong>
          ${this.showSimpleLanguage ? html`<small>${dimension.shortMeaning}</small>` : nothing}
        </span>
        ${checked
          ? html`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`
          : nothing}
      </label>
    `;
  }

  private renderPairHelp(left: TlxDimension, right: TlxDimension) {
    if (!this.definition.supports.simplerExplanations) return nothing;
    if (this.showSimpleLanguage) {
      return html`<p class="simple-pair-prompt">In simpler words: ${this.definition.pairwise!.simplePrompt}</p>`;
    }
    return html`
      <details
        class="optional-explanation pair-help"
        @toggle=${(event: Event) =>
          this.speakOpenedHelp(
            event,
            `Simpler explanations. ${left.name}: ${left.simpleExplanation} ${right.name}: ${right.simpleExplanation}`,
          )}
      >
        <summary>Need help with these factor names?</summary>
        <div class="explanation-grid">
          ${[left, right].map(
            (dimension) => html`
              <div class="explanation-block">
                <h3>${dimension.name}</h3>
                <p>${dimension.simpleExplanation}</p>
              </div>
            `,
          )}
        </div>
      </details>
    `;
  }

  private renderVoiceInput(context: 'rating' | 'pair', first: TlxDimension, second?: TlxDimension) {
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
            remain available.
          </p>
          <button
            class="secondary-button large-answer-button"
            type="button"
            data-voice-start
            ?disabled=${!available || this.voiceState === 'listening'}
            @click=${() => this.startVoiceInput(context, first, second)}
          >
            ${this.voiceState === 'listening' ? 'Listening…' : 'Start voice input'}
          </button>
          ${!available
            ? html`<p role="status">
                Built-in voice recognition is unavailable in this browser. System voice control can still activate
                the visible buttons by name.
              </p>`
            : nothing}
          ${this.voiceMessage
            ? html`<p role="status" aria-live="polite" aria-atomic="true">${this.voiceMessage}</p>`
            : nothing}
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
  }

  private renderNavigation(canGoBack: boolean, context: 'rating' | 'pair') {
    const finalRating = context === 'rating' && this.ratingIndex === this.dimensions.length - 1;
    const finalPair = context === 'pair' && this.pairIndex === this.pairOrder.length - 1;
    const nextLabel =
      context === 'rating' && this.editingRatingFromReview
        ? 'Save change and return to review'
      : finalRating
        ? this.pairOrder.length ? 'Continue to comparisons' : 'Review responses'
        : finalPair ? 'Review responses' : 'Next question';
    const previousLabel = context === 'rating' && this.editingRatingFromReview
      ? 'Cancel change and return to review'
      : 'Previous question';
    return html`
      <div class="button-row">
        <button
          class="secondary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label=${previousLabel}
          ?disabled=${!canGoBack && !this.editingRatingFromReview}
          @click=${this.goBack}
        >
          ${previousLabel}
        </button>
        <button
          class="primary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label=${nextLabel}
          @click=${() => this.goNext(context)}
        >
          ${nextLabel}
        </button>
      </div>
    `;
  }

  private renderReview() {
    return html`
      <section class="panel" id="question-panel" aria-labelledby="review-heading">
        <h2 id="review-heading">Review your responses</h2>
        <p>Check every response before calculating the ${this.definition.scoring.scoreName.toLowerCase()}.</p>

        ${(this.hostSubmissionFailed || this.browserStorageFailed) && this.submittedRecord
          ? html`
              <section class="submission-recovery" aria-labelledby="submission-recovery-heading">
                <h3 id="submission-recovery-heading">
                  ${this.browserStorageFailed
                    ? 'The browser could not save the completed record'
                    : 'The study platform has not confirmed this response'}
                </h3>
                <p>
                  ${this.browserStorageFailed
                    ? 'The study platform has not been contacted. Your answers remain reviewable on this page. Retry saving, change an answer, or download a backup before leaving.'
                    : 'Your answers remain reviewable on this page. Retry submission, change an answer, or download a backup before leaving.'}
                </p>
                ${this.completionSavedLocally
                  ? html`<p>A complete backup is also stored in this browser on this device.</p>`
                  : html`<p>
                      This browser could not store a completed backup. Download JSON or CSV before leaving this page.
                    </p>`}
                <div class="button-row compact">
                  <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                    Download JSON backup
                  </button>
                  <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                    Download CSV backup
                  </button>
                </div>
              </section>
            `
          : nothing}

        <h3>Item responses</h3>
        <div class="review-ratings">
          ${this.dimensions.map(
            (dimension, index) => html`
              <section
                class="review-rating-card"
                id=${`review-item-${index + 1}`}
                role="group"
                tabindex="-1"
                aria-labelledby=${`review-item-label-${index + 1}`}
                aria-describedby=${`review-item-answer-${index + 1}`}
              >
                <h4 class="review-rating-label" id=${`review-item-label-${index + 1}`}>
                  <strong>${dimension.name}</strong>
                  <span class="review-item-prompt" lang=${this.definition.language} dir="auto">
                    ${dimension.prompt}
                  </span>
                </h4>
                <div class="review-rating-answer">
                  <p id=${`review-item-answer-${index + 1}`}>
                    <strong>Selected answer: ${this.reviewRatingLabel(dimension)}</strong>
                    ${this.renderReviewRatingScaleContext(dimension)}
                  </p>
                  <small>Input route: ${this.ratingRouteLabel(dimension.id)}</small>
                  <button
                    class="secondary-button large-answer-button"
                    type="button"
                    data-gaze-target
                    data-gaze-label=${`Change item ${index + 1} answer`}
                    aria-label=${`Change item ${index + 1} answer. ${dimension.name}. Current answer: ${this.reviewRatingAccessibleLabel(dimension)}`}
                    @click=${() => this.editRatingFromReview(index)}
                  >
                    Change item ${index + 1} answer
                  </button>
                </div>
              </section>
            `,
          )}
        </div>

        ${this.pairOrder.length
          ? html`<h3>Pairwise comparisons</h3>
              <ol class="review-list">
                ${this.pairOrder.map((pair) => {
                  const left = this.dimensionById.get(pair.left)!;
                  const right = this.dimensionById.get(pair.right)!;
                  const selected = this.dimensionById.get(this.pairResponses[pair.id])!;
                  return html`<li>${left.name} or ${right.name}: <strong>${selected.name}</strong></li>`;
                })}
              </ol>`
          : nothing}

        <div class="button-row review-actions">
          <button
            class="secondary-button large-answer-button"
            type="button"
            data-gaze-target
            data-gaze-label="Return to ratings"
            @click=${this.returnToRatings}
          >
            Return to ratings
          </button>
          ${this.pairOrder.length
            ? html`<button
                class="secondary-button large-answer-button"
                type="button"
                data-gaze-target
                data-gaze-label="Return to comparisons"
                @click=${this.returnToPairs}
              >
                Return to comparisons
              </button>`
            : nothing}
          <button
            class="primary-button large-answer-button"
            type="button"
            data-gaze-target
            data-gaze-label=${this.browserStorageFailed
              ? 'Retry saving and submitting responses'
              : this.hostSubmissionFailed
              ? 'Retry submission'
              : 'Calculate and submit responses'}
            ?disabled=${this.submittingResult}
            @click=${this.submitResponses}
          >
            ${this.submittingResult
              ? 'Submitting responses…'
              : this.browserStorageFailed
              ? 'Retry saving and submitting responses'
              : this.hostSubmissionFailed
              ? 'Retry submission'
              : 'Calculate and submit responses'}
          </button>
        </div>
      </section>
    `;
  }

  private renderComplete() {
    if (!this.result || !this.submittedRecord) return nothing;
    const showScore = !this.studyConfig || this.studyConfig.showScoreToParticipant;
    return html`
      <section class="panel confirmation" id="question-panel" aria-labelledby="complete-heading">
        <h2 id="complete-heading">${
          this.studyConfig && this.completionStagedByBridge && !this.remoteRecordingUnconfirmed
            ? 'Submitting response'
            : this.studyConfig
            ? 'Result prepared'
            : 'Responses calculated'
        }</h2>
        ${showScore
          ? html`<p class="score">
              ${this.result.scoreName}:
              <strong>${this.result.primaryScore.toFixed(2)}</strong>
              out of ${this.result.scoreMaximum}
            </p>`
          : html`<p>Your responses have been prepared. The study configuration does not display the calculated score on the participant page.</p>`}
        ${this.studyConfig
          ? this.remoteRecordingUnconfirmed
            ? html`<div
                class="error-summary"
                id="remote-recording-error"
                role="alert"
                tabindex="-1"
              >
                <h3>Qualtrics did not confirm this response</h3>
                <p>
                  The completed answers are still available in the backup on this device, but the
                  Qualtrics completion page did not open. Reconnect to the internet, keep or download
                  one backup, and use the restored Qualtrics Next button to try the submission again.
                </p>
                <p>Tell the study conductor if the Qualtrics completion page still does not appear.</p>
              </div>`
            : this.completionStagedByBridge
            ? html`<div class="save-status">
                <h3>Waiting for Qualtrics</h3>
                <p>The survey page received the response data. Keep this page open while Qualtrics continues.</p>
                ${this.completionSavedLocally
                  ? nothing
                  : html`<p>
                      This browser could not keep a backup copy. If the Qualtrics completion page does not
                      appear, use the JSON or CSV backup button below before closing the page.
                    </p>`}
              </div>`
            : this.completionSavedLocally
            ? html`<div class="save-status" role="status">
                <h3>Saved on this device</h3>
                <p>
                  The completed record is stored only in this browser. It has not been sent to GitHub or to a server.
                  The study conductor must export it from the study setup page before browser data are cleared.
                </p>
              </div>`
            : html`<div class="error-summary" role="alert">
                <h3>The browser could not save the completed record</h3>
                <p>Use the JSON or CSV backup button below and give the file to the study conductor through the approved study procedure.</p>
              </div>`
          : html`<p>No response, audio or webcam video has been uploaded. Demonstration results are not retained after this page is closed.</p>`}
        <p>Support and input-route metadata remain separate from the questionnaire score.</p>
        ${!this.studyConfig || !this.completionStagedByBridge || this.remoteRecordingUnconfirmed
          ? this.renderCompletionReadAloudControl()
          : nothing}
        ${!this.studyConfig
          ? html`<details>
              <summary>Show the complete result record</summary>
              <pre>${JSON.stringify(this.submittedRecord, null, 2)}</pre>
            </details>`
          : nothing}
        ${this.studyConfig && this.completionStagedByBridge
          ? html`<aside class="submission-fallback" aria-labelledby="submission-fallback-heading">
              <h3 id="submission-fallback-heading">If this page does not continue</h3>
              <p>
                Wait for the error instructions. If an error appears, keep this page open or use one backup
                button before closing it.
              </p>
              <div class="button-row compact">
                <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                  Download JSON backup
                </button>
                <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                  Download CSV backup
                </button>
              </div>
            </aside>`
          : html`<div class="button-row compact">
              <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                Download JSON backup
              </button>
              <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                Download CSV backup
              </button>
              ${!this.studyConfig
                ? html`<button class="secondary-button large-answer-button" type="button" @click=${this.restart}>Start again</button>`
                : nothing}
            </div>`}
        ${this.studyConfig
          ? this.completionStagedByBridge && !this.remoteRecordingUnconfirmed
            ? nothing
            : html`<p>
              <strong>Participant:</strong>
              ${this.remoteRecordingUnconfirmed
                ? 'reconnect to the internet and use the restored Qualtrics Next button. Keep or download a backup until the Qualtrics completion page appears.'
                : 'please return the device or completion notice to the study conductor.'}
            </p>`
          : nothing}
      </section>
    `;
  }

  private announceSavedSessionOffer(session: SavedSession) {
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

      const savedSessionOffer = this.querySelector<HTMLElement>('#saved-session-offer');
      if (savedSessionOffer) {
        focusAndReveal(savedSessionOffer, {
          block: 'center',
          forceCoordinateScroll: true,
          onReveal: () => this.requestParentReveal(savedSessionOffer),
        });
      }

      window.setTimeout(() => {
        const current = this.savedSession;
        if (
          !this.isConnected ||
          !current ||
          current.savedAt !== session.savedAt ||
          current.configId !== session.configId ||
          current.participantCode !== session.participantCode
        ) {
          return;
        }

        // Updating the existing empty live region after rendering gives external
        // screen readers a genuine content change to announce. Built-in audio is
        // attempted only when it was already enabled in the saved session.
        this.statusMessage = message;
        if (this.audioGuidance) this.speakText(message);
      }, 650);
    });
  }

  private repeatSavedSessionOffer = () => {
    if (!this.savedSession) return;
    this.readAloudUsed = true;
    this.speakText(this.savedSessionOfferSpeech(this.savedSession));
  };

  private savedSessionOfferSpeech(session: SavedSession) {
    const count = Object.keys(session.ratings).length + Object.keys(session.pairResponses).length;
    return `Saved questionnaire found. ${count} of ${this.dimensions.length + this.pairs.length} responses are saved in this browser. Resume saved questionnaire. Erase saved answers.`;
  }

  private renderSavedSessionOffer() {
    if (!this.savedSession) return nothing;
    const count = Object.keys(this.savedSession.ratings).length + Object.keys(this.savedSession.pairResponses).length;
    return html`
      <aside
        id="saved-session-offer"
        class="saved-session"
        role="region"
        tabindex="-1"
        aria-labelledby="saved-session-heading"
        aria-describedby="saved-session-count saved-session-actions"
      >
        <h3 id="saved-session-heading">Saved questionnaire found</h3>
        <p id="saved-session-count">
          ${count} of ${this.dimensions.length + this.pairs.length} responses are saved in this browser.
        </p>
        <p id="saved-session-actions">
          Resume saved questionnaire. Erase saved answers.
        </p>
        <div class="button-row compact">
          <button
            id="resume-saved-questionnaire"
            class="primary-button large-answer-button"
            type="button"
            aria-describedby="saved-session-count saved-session-actions"
            @click=${this.restoreSavedSession}
          >
            Resume saved questionnaire
          </button>
          <button class="secondary-button" type="button" @click=${this.repeatSavedSessionOffer}>
            Hear saved-progress message
          </button>
          <button class="secondary-button" type="button" @click=${this.eraseSavedSession}>Erase saved answers</button>
        </div>
      </aside>
    `;
  }

  private renderCompletedBackupOffer() {
    const record = this.recoveredCompletedRecord;
    if (!record) return nothing;
    return html`
      <aside class="saved-session completed-backup" aria-labelledby="completed-backup-heading">
        <h3 id="completed-backup-heading" tabindex="-1">A completed backup was found on this device</h3>
        <p>
          Submission <strong>${record.submissionId}</strong> was prepared for this participant code.
          This local copy does not prove that Qualtrics recorded the response.
        </p>
        <p>
          Do not repeat the questionnaire unless the study conductor asks you to. Keep or download
          this backup so the response can be checked safely.
        </p>
        <div class="button-row compact">
          <button
            class="primary-button large-answer-button"
            type="button"
            @click=${() => this.downloadRecordJson(record)}
          >
            Download recovered JSON
          </button>
          <button
            class="secondary-button large-answer-button"
            type="button"
            @click=${() => this.downloadRecordCsv(record)}
          >
            Download recovered CSV
          </button>
        </div>
      </aside>
    `;
  }

  private renderResumeSummary() {
    return html`
      <aside class="resume-summary" aria-labelledby="resume-heading">
        <h2 id="resume-heading" tabindex="-1">Welcome back — here is where you stopped</h2>
        <dl class="resume-details">
          <div><dt>Completed</dt><dd>${this.completedCount()} of ${this.dimensions.length + this.pairs.length} responses</dd></div>
          <div><dt>Last saved response</dt><dd>${this.lastSavedDescription()}</dd></div>
          <div><dt>Current position</dt><dd>${this.currentPositionDescription()}</dd></div>
          <div><dt>Next action</dt><dd>${this.nextActionDescription()}</dd></div>
        </dl>
        <p>Your current answers are saved in this browser.</p>
        <div class="button-row compact">
          <button class="primary-button large-answer-button" type="button" @click=${this.dismissResumeSummary}>
            Continue from here
          </button>
          <button class="secondary-button" type="button" @click=${this.restart}>
            Erase answers and start again
          </button>
        </div>
      </aside>
    `;
  }

  private setSimpleLanguage(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).checked;
    this.recordSupportChange('simpler-explanations', this.showSimpleLanguage, value);
    this.showSimpleLanguage = value;
    this.invalidatePendingSubmission();
    this.persistProgress();
    this.announceAutomatic(
      value
        ? this.currentSimpleExplanationSpeech()
        : this.isResearcherSuppliedDefinition
        ? 'Simpler explanations are off. The questionnaire item wording remains available.'
        : 'Simpler explanations are off. The official questionnaire wording remains available.',
    );
  }

  private recordSupportChange(
    setting: SupportChangeSetting,
    from: SupportChange['from'],
    to: SupportChange['to'],
  ) {
    if (!this.studyConfig || from === to || this.stage === 'complete') return;
    this.supportChanges = [
      ...this.supportChanges,
      {
        setting,
        from,
        to,
        stage: this.stage,
        changedAt: new Date().toISOString(),
      },
    ];
  }

  private setParticipantCode = (event: Event) => {
    this.participantCode = (event.currentTarget as HTMLInputElement).value.trim();
    this.invalidParticipantParameter = false;
    this.participantCodeRestoredForTab = false;
    this.participantCodeError =
      this.participantCode && !validParticipantCode(this.participantCode)
        ? 'Use 1–32 letters, numbers, hyphens or underscores, starting with a letter or number.'
        : '';
    this.savedSession = null;
    this.savedSessionProblem = '';
    this.recoveredCompletedRecord = null;
    if (validParticipantCode(this.participantCode)) {
      this.rememberParticipantCodeForTab();
      this.findSavedSession();
      this.findCompletedBackup();
    } else {
      this.forgetParticipantCodeForTab();
    }
  };

  private setAnswerMode(mode: AnswerMode) {
    if (mode === 'smiley' && !this.definition.supports.smileyLandmarks) return;
    this.recordSupportChange('answer-mode', this.answerMode, mode);
    this.answerMode = mode;
    this.invalidatePendingSubmission();
    this.persistProgress();
    this.announceAutomatic(
      mode === 'smiley'
        ? 'Smiley landmark answer format selected. Each rating offers five labelled values, with the full precise scale available on request.'
        : `Standard answer format selected. Each rating uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}.`,
    );
  }

  private setLargeText(value: boolean) {
    this.recordSupportChange('text-size', this.largeText ? 'large' : 'standard', value ? 'large' : 'standard');
    this.largeText = value;
    this.invalidatePendingSubmission();
    this.persistProgress();
    this.announceAutomatic(`${value ? 'Large' : 'Standard'} text selected.`);
  }

  private setRecovery(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).checked;
    this.recordSupportChange('interruption-recovery', this.recoveryEnabled, value);
    this.recoveryEnabled = value;
    this.invalidatePendingSubmission();
    if (this.recoveryEnabled) {
      this.rememberParticipantCodeForTab();
      this.persistProgress();
    } else {
      this.forgetParticipantCodeForTab();
      this.clearSavedProgress();
    }
    this.announceAutomatic(
      value
        ? 'Interruption recovery is on. Incomplete answers will be stored in this browser.'
        : 'Interruption recovery is off. The saved in-progress copy has been removed.',
    );
  }

  private setAudioGuidance = (event: Event) => {
    const value = (event.currentTarget as HTMLInputElement).checked;
    this.recordSupportChange('automatic-audio', this.audioGuidance, value);
    this.audioGuidance = value;
    this.invalidatePendingSubmission();
    if (this.audioGuidance) {
      this.speakText(
        'Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.',
      );
    }
    else this.stopReading();
    this.persistProgress();
  };

  private landmarkLabel(dimension: TlxDimension, value: number) {
    const position = this.smileyLandmarks.find((landmark) => landmark.value === value)?.position;
    if (position === 'low') return dimension.lowAnchor;
    if (position === 'closer-low') return `Closer to ${dimension.lowAnchor}`;
    if (position === 'middle') return 'Middle';
    if (position === 'closer-high') return `Closer to ${dimension.highAnchor}`;
    if (position === 'high') return dimension.highAnchor;
    return String(value);
  }

  private ratingValueLabel(dimension: TlxDimension, value: number) {
    const declaredLabel = dimension.responseLabels?.[String(value)];
    if (declaredLabel && declaredLabel !== String(value)) return declaredLabel;
    if (value === this.definition.scale.minimum) return dimension.lowAnchor;
    if (value === this.definition.scale.maximum) return dimension.highAnchor;
    return null;
  }

  /**
   * The endpoints are already presented visually in the aria-hidden anchor row
   * and announced once in the fieldset legend. Imported survey exports often
   * repeat those exact strings as the first and last response labels. Suppress
   * only those duplicated endpoint labels; labels for middle positions remain
   * visible because they carry additional response meaning.
   */
  private visibleResponseLabel(dimension: TlxDimension, value: number) {
    const declared = dimension.responseLabels?.[String(value)];
    if (!declared || declared === String(value)) return null;
    const endpoint = value === this.definition.scale.minimum
      ? dimension.lowAnchor
      : value === this.definition.scale.maximum
        ? dimension.highAnchor
        : null;
    const normalise = (label: string) => label.replace(/\s+/g, ' ').trim();
    return endpoint && normalise(declared) === normalise(endpoint)
      ? null
      : declared;
  }

  private ratingOptionLabel(dimension: TlxDimension, value: number) {
    if (this.definition.scale.type === 'semantic-differential') {
      const position = this.ratingValues.indexOf(value) + 1;
      const endpoint = this.ratingValueLabel(dimension, value);
      return endpoint
        ? `Position ${position} of ${this.ratingValues.length}, ${endpoint}, for ${dimension.name}`
        : `Position ${position} of ${this.ratingValues.length}, between ${dimension.lowAnchor} and ${dimension.highAnchor}, for ${dimension.name}`;
    }
    const label = this.ratingValueLabel(dimension, value);
    return label
      ? `${value}, ${label}, for ${dimension.name}`
      : `${value} for ${dimension.name}`;
  }

  private ratingVoicePrompt(dimension: TlxDimension) {
    if (this.answerMode !== 'smiley') {
      const exampleValue = this.ratingValues[Math.min(3, this.ratingValues.length - 1)];
      const numericPrompt =
        `For the clearest recognition, say “number ${exampleValue}”, using any value shown from ` +
        `${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ` +
        `${this.definition.scale.step}. Other numbers are not rounded or guessed.`;
      const labelledValues = this.ratingValues.flatMap((value) => {
        const label = dimension.responseLabels?.[String(value)];
        return label ? [`${value}, ${label}`] : [];
      });
      if (labelledValues.length > 0 && isEnglishLanguage(this.definition.language)) {
        return `${numericPrompt} You may instead say one complete visible answer label.`;
      }
      return this.definition.scale.type === 'magnitude'
        ? numericPrompt
        : `${numericPrompt} You may instead say the exact visible endpoint label: ${dimension.lowAnchor} or ${dimension.highAnchor}.`;
    }
    const labels = this.smileyLandmarks.map(({ value }) => this.landmarkLabel(dimension, value));
    const values = this.smileyLandmarks.map(({ value }) => value);
    return `For the most reliable voice input, say one shown value: ${values.slice(0, -1).join(', ')}, or ${values.at(-1)}. You may instead say one visible label: ${labels.slice(0, -1).join(', ')}, or ${labels.at(-1)}. On a phone, use the number if a short label such as Low is not recognised.`;
  }

  private ratingVoiceAnswerLabel(dimension: TlxDimension, value: number) {
    const visibleAsLandmark =
      this.answerMode === 'smiley' &&
      this.smileyLandmarks.some((landmark) => landmark.value === value);
    const label = this.ratingValueLabel(dimension, value);
    return visibleAsLandmark
      ? `${this.landmarkLabel(dimension, value)}, value ${value}, for ${dimension.name}`
      : label
      ? `${label}, value ${value}, for ${dimension.name}`
      : `${value} for ${dimension.name}`;
  }

  private ratingRouteLabel(dimension: DimensionId) {
    const route = this.ratingInputRoutes[dimension];
    if (route === 'smiley-landmark') return 'smiley landmark';
    if (route === 'voice') return 'voice, confirmed';
    if (route === 'gaze-standard-scale') return 'gaze, standard scale, confirmed';
    if (route === 'gaze-smiley-landmark') return 'gaze, smiley landmark, confirmed';
    return 'full scale';
  }

  private reviewRatingLabel(dimension: TlxDimension) {
    const value = this.ratings[dimension.id];
    if (value === undefined) return 'No answer';
    const label = this.ratingValueLabel(dimension, value);
    if (this.definition.scale.type === 'semantic-differential') {
      const position = `Position ${this.ratingValues.indexOf(value) + 1} of ${this.ratingValues.length}`;
      return label ? `${position} — ${label}` : position;
    }
    if (label) return `${value} — ${label}`;
    return String(value);
  }

  /**
   * A validated instrument may declare only its endpoint anchors. In that case
   * an interior response has no authoritative label: inventing one would change
   * the questionnaire content, while showing only a number would make the review
   * record depend on remembered scale context. Expose the declared endpoints
   * instead, and omit this extra context when the selected value already has an
   * authoritative label.
   */
  private reviewRatingScaleContextText(dimension: TlxDimension) {
    const value = this.ratings[dimension.id];
    if (value === undefined || this.ratingValueLabel(dimension, value)) return null;
    if (this.definition.scale.type === 'semantic-differential') {
      return `Scale endpoints: ${dimension.lowAnchor} to ${dimension.highAnchor}`;
    }
    return `Scale: ${this.definition.scale.minimum} — ${dimension.lowAnchor} to ${this.definition.scale.maximum} — ${dimension.highAnchor}`;
  }

  private renderReviewRatingScaleContext(dimension: TlxDimension) {
    const context = this.reviewRatingScaleContextText(dimension);
    if (!context) return nothing;
    if (this.definition.scale.type === 'semantic-differential') {
      return html`<span class="review-scale-context">
        Scale endpoints:
        <span lang=${this.definition.language} dir="auto">${dimension.lowAnchor}</span>
        to
        <span lang=${this.definition.language} dir="auto">${dimension.highAnchor}</span>
      </span>`;
    }
    return html`<span class="review-scale-context">
      Scale: ${this.definition.scale.minimum} —
      <span lang=${this.definition.language} dir="auto">${dimension.lowAnchor}</span>
      to ${this.definition.scale.maximum} —
      <span lang=${this.definition.language} dir="auto">${dimension.highAnchor}</span>
    </span>`;
  }

  private reviewRatingAccessibleLabel(dimension: TlxDimension) {
    const answer = this.reviewRatingLabel(dimension);
    const context = this.reviewRatingScaleContextText(dimension);
    return context ? `${answer}. ${context}` : answer;
  }

  private selectRating(dimension: DimensionId, value: number, route: RatingInputRoute) {
    if (route !== 'voice' && this.voiceState !== 'idle') this.clearVoiceAnswer();
    const effectiveRoute = this.gazeActivationInProgress
      ? route === 'smiley-landmark'
        ? 'gaze-smiley-landmark'
        : 'gaze-standard-scale'
      : route;
    if (this.editingRatingFromReview) {
      const edit = this.reviewRatingEdit;
      if (!edit || edit.itemId !== dimension || edit.itemIndex !== this.ratingIndex) {
        this.showError('This review edit is no longer valid. Return to the review and open the answer again.');
        return;
      }
      // A review edit is transactional. Keep the proposed value and route out of
      // the canonical response, saved progress and score until the participant
      // explicitly chooses Save.
      this.reviewRatingEdit = {
        ...edit,
        pendingValue: value,
        pendingInputRoute: effectiveRoute,
      };
    } else {
      this.invalidatePendingSubmission();
      this.ratings = { ...this.ratings, [dimension]: value };
      this.ratingInputRoutes = { ...this.ratingInputRoutes, [dimension]: effectiveRoute };
    }
    this.clearError();
    const currentDimension = this.dimensionById.get(dimension)!;
    const visibleAsLandmark =
      this.answerMode === 'smiley' &&
      this.smileyLandmarks.some((landmark) => landmark.value === value);
    const endpoint = this.ratingValueLabel(currentDimension, value);
    this.statusMessage = visibleAsLandmark
      ? `${currentDimension.name}, ${this.landmarkLabel(currentDimension, value)}, value ${value}, selected.`
      : endpoint
      ? `${currentDimension.name}, ${endpoint}, value ${value}, selected.`
      : `${currentDimension.name}, ${value}, selected.`;
    this.announceAutomatic(this.statusMessage);
    if (!this.editingRatingFromReview) this.persistProgress();
  }

  private selectPair(pairId: string, dimension: DimensionId, route: PairInputRoute) {
    if (route !== 'voice' && this.voiceState !== 'idle') this.clearVoiceAnswer();
    this.invalidatePendingSubmission();
    const effectiveRoute = this.gazeActivationInProgress ? 'gaze' : route;
    this.pairResponses = { ...this.pairResponses, [pairId]: dimension };
    this.pairInputRoutes = { ...this.pairInputRoutes, [pairId]: effectiveRoute };
    this.clearError();
    this.statusMessage = `${this.dimensionById.get(dimension)!.name} selected.`;
    this.announceAutomatic(this.statusMessage);
    this.persistProgress();
  }

  private startQuestionnaire = () => {
    if (this.configurationError) {
      this.showError(this.configurationError);
      return;
    }
    if (
      this.studyConfig?.collection.mode === 'qualtrics' &&
      this.hostBridgeState !== 'connected'
    ) {
      this.showError(
        this.hostBridgeMessage ||
        'The secure Qualtrics result connection is not ready. Do not start this questionnaire.',
      );
      return;
    }
    if (this.studyConfig) {
      this.participantCode = this.participantCode.trim();
      if (!validParticipantCode(this.participantCode)) {
        this.participantCodeError = 'Enter the valid pseudonymous participant code supplied by the study conductor.';
        this.showError(this.participantCodeError);
        return;
      }
      // A participant-specific link is authoritative. Replace any tab-scoped
      // code left by an older link before saving progress for this run.
      this.rememberParticipantCodeForTab();
    }
    this.startedAt = new Date().toISOString();
    this.stage = 'ratings';
    this.ratingIndex = 0;
    this.editingRatingFromReview = false;
    this.reviewRatingEdit = null;
    this.reviewReturnFocusIndex = null;
    this.clearError();
    this.persistProgress();
    this.focusHeading();
  };

  private goNext(context: 'rating' | 'pair') {
    this.stopReading();
    this.clearVoiceAnswer();
    if (context === 'rating') {
      const dimension = this.dimensions[this.ratingIndex];
      const reviewEdit = this.editingRatingFromReview ? this.reviewRatingEdit : null;
      const selectedValue = reviewEdit?.itemId === dimension.id
        ? reviewEdit.pendingValue
        : this.ratings[dimension.id];
      if (selectedValue === undefined) {
        this.showError(`Choose a rating for ${dimension.name} before continuing.`);
        return;
      }
      if (this.editingRatingFromReview) {
        if (!reviewEdit || reviewEdit.itemId !== dimension.id || reviewEdit.itemIndex !== this.ratingIndex) {
          this.showError('This review edit is no longer valid. Return to the review and open the answer again.');
          return;
        }
        const returnIndex = this.reviewReturnFocusIndex ?? this.ratingIndex;
        const changed =
          reviewEdit.pendingValue !== reviewEdit.originalValue ||
          reviewEdit.pendingInputRoute !== reviewEdit.originalInputRoute;
        if (changed) {
          this.invalidatePendingSubmission();
          this.ratings = { ...this.ratings, [dimension.id]: reviewEdit.pendingValue };
          const routes = { ...this.ratingInputRoutes };
          if (reviewEdit.pendingInputRoute === undefined) delete routes[dimension.id];
          else routes[dimension.id] = reviewEdit.pendingInputRoute;
          this.ratingInputRoutes = routes;
        }
        this.editingRatingFromReview = false;
        this.reviewRatingEdit = null;
        this.stage = 'review';
        this.clearError();
        this.persistProgress();
        this.focusReviewItem(
          returnIndex,
          changed
            ? `${this.dimensions[returnIndex].name} answer updated.`
            : `${this.dimensions[returnIndex].name} answer unchanged.`,
        );
        return;
      }
      if (this.ratingIndex < this.dimensions.length - 1) this.ratingIndex += 1;
      else {
        if (this.pairOrder.length) {
          this.stage = 'pairs';
          this.pairIndex = 0;
        } else {
          this.stage = 'review';
        }
      }
    } else {
      const pair = this.pairOrder[this.pairIndex];
      if (!this.pairResponses[pair.id]) {
        this.showError('Choose which factor contributed more to workload before continuing.');
        return;
      }
      if (this.pairIndex < this.pairOrder.length - 1) this.pairIndex += 1;
      else this.stage = 'review';
    }
    this.clearError();
    this.persistProgress();
    this.focusHeading();
  }

  private goBack = () => {
    this.stopReading();
    this.clearVoiceAnswer();
    if (this.stage === 'ratings' && this.editingRatingFromReview) {
      const returnIndex = this.reviewReturnFocusIndex ?? this.ratingIndex;
      this.editingRatingFromReview = false;
      this.reviewRatingEdit = null;
      this.stage = 'review';
      this.clearError();
      this.persistProgress();
      this.focusReviewItem(
        returnIndex,
        `${this.dimensions[returnIndex].name} edit cancelled. Original answer kept.`,
      );
      return;
    }
    else if (this.stage === 'ratings' && this.ratingIndex > 0) this.ratingIndex -= 1;
    else if (this.stage === 'pairs') {
      if (this.pairIndex > 0) this.pairIndex -= 1;
      else {
        this.stage = 'ratings';
        this.ratingIndex = this.dimensions.length - 1;
      }
    }
    this.clearError();
    this.persistProgress();
    this.focusHeading();
  };

  private returnToRatings = () => {
    this.editingRatingFromReview = false;
    this.reviewRatingEdit = null;
    this.reviewReturnFocusIndex = null;
    this.stage = 'ratings';
    this.ratingIndex = this.dimensions.length - 1;
    this.persistProgress();
    this.focusHeading();
  };

  private returnToPairs = () => {
    this.editingRatingFromReview = false;
    this.reviewRatingEdit = null;
    this.reviewReturnFocusIndex = null;
    this.stage = 'pairs';
    this.pairIndex = this.pairOrder.length - 1;
    this.persistProgress();
    this.focusHeading();
  };

  private editRatingFromReview(index: number) {
    const dimension = this.dimensions[index];
    const originalValue = this.ratings[dimension.id];
    if (originalValue === undefined) {
      this.showError(`${dimension.name} has no saved answer to edit.`);
      return;
    }
    this.editingRatingFromReview = true;
    this.reviewRatingEdit = {
      itemIndex: index,
      itemId: dimension.id,
      originalValue,
      originalInputRoute: this.ratingInputRoutes[dimension.id],
      pendingValue: originalValue,
      pendingInputRoute: this.ratingInputRoutes[dimension.id],
    };
    this.reviewReturnFocusIndex = index;
    this.stage = 'ratings';
    this.ratingIndex = index;
    // Do not persist the temporary edit screen. If the tab reloads before Save,
    // recovery must reopen the last committed review rather than turning this
    // one-item edit into the normal sequential rating route.
    this.focusHeading();
  }

  private focusReviewItem(index: number, message: string) {
    void this.updateComplete.then(() => {
      const reviewItem = this.querySelector<HTMLElement>(`#review-item-${index + 1}`);
      this.reviewReturnFocusIndex = null;
      if (!reviewItem) {
        this.focusHeading();
        return;
      }
      focusAndReveal(reviewItem, {
        block: 'center',
        onReveal: () => this.requestParentReveal(reviewItem),
      });
      this.statusMessage = `${message} ${this.reviewRatingAccessibleLabel(this.dimensions[index])}`;
      this.announceAutomatic(this.statusMessage);
    });
  }

  private effectiveStudyConfig(): StudyConfig {
    if (this.studyConfig) return this.studyConfig;
    return {
      schemaVersion: 4,
      configId: 'demo-config',
      createdAt: this.startedAt || new Date().toISOString(),
      prototypeVersion: PROTOTYPE_VERSION,
      instrumentId: this.definition.id,
      definitionHash: questionnaireDefinitionHash(this.definition),
      studyId: 'DEMO',
      studyTitle: 'Technical demonstration',
      taskLabel: 'a task completed before the questionnaire',
      showScoreToParticipant: true,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: false,
        participantAdjustmentPolicy: 'presentation-only',
        voiceInputAvailable: true,
        gazeInputAvailable: true,
      },
      collection: { mode: 'local' },
    };
  }

  private currentSupportMetadata(): SupportMetadata {
    return {
      simplerExplanationsShownAtSubmission: this.showSimpleLanguage,
      largeTextUsedAtSubmission: this.largeText,
      answerModeAtSubmission: this.answerMode,
      recoveryEnabledAtSubmission: this.recoveryEnabled,
      interruptionSummaryShown: this.interruptionSummaryShown,
      readAloudUsed: this.readAloudUsed,
      automaticAudioGuidanceEnabledAtSubmission: this.audioGuidance,
      gazeUsed: this.gazeUsed,
      gazeActionCount: this.gazeActionCount,
      gazeEngine: this.gazeUsed ? `WebGazer ${WEBGAZER_VERSION}` : null,
      ratingInputRoutes: this.ratingInputRoutes,
      pairInputRoutes: this.pairInputRoutes,
      supportChanges: [...this.supportChanges],
    };
  }

  private submitResponses = async () => {
    if (this.submittingResult) return;
    try {
      if (!this.result || !this.submittedRecord) {
        this.result = scoreQuestionnaire(
          this.definition,
          this.ratings as Ratings,
          this.pairResponses,
        );
        this.submittedRecord = createStudyResultRecord({
          config: this.effectiveStudyConfig(),
          participantCode: this.studyConfig ? this.participantCode : 'DEMO',
          startedAt: this.startedAt || new Date().toISOString(),
          pairPresentationOrder: this.pairOrder.map(({ id }) => id),
          pairwiseChoices: this.pairResponses,
          result: this.result,
          supportMetadata: this.currentSupportMetadata(),
        });
      }
      const sink = this.studyConfig ? configuredResultSink() : null;
      // Create the recoverable copy before contacting the host. A Qualtrics receipt
      // confirms only that the parent page staged the values; the response is not
      // durable until that page is submitted.
      this.completionSavedLocally = this.studyConfig
        ? saveCompletedResult(this.submittedRecord)
        : false;
      this.completionStagedByBridge = false;
      this.remoteRecordingUnconfirmed = false;
      this.hostSubmissionFailed = false;
      this.browserStorageFailed = false;
      if (this.studyConfig && !this.completionSavedLocally) {
        this.browserStorageFailed = true;
        this.showError(
          'The browser could not save the completed record. The study platform has not been contacted. Your answers remain reviewable. Retry saving, change an answer, or download a JSON or CSV backup before leaving this page.',
        );
        return;
      }
      if (sink) {
        this.submittingResult = true;
        this.statusMessage = `Submitting responses to ${sink.name}.`;
        try {
          await submitToApprovedResultSink(this.submittedRecord, sink);
          this.completionStagedByBridge = true;
        } catch (error) {
          this.hostSubmissionFailed = true;
          this.browserStorageFailed = false;
          const detail = error instanceof Error ? error.message : 'The study platform did not accept the response.';
          this.showError(
            `${detail} Your answers remain on this page. Retry submission, return to an answer, or use a backup button below.`,
          );
          return;
        } finally {
          this.submittingResult = false;
        }
      }
      this.dispatchEvent(new CustomEvent<StudyResultRecord>('questionnaire-complete', {
        detail: this.submittedRecord,
        bubbles: true,
        composed: true,
      }));
      // Compatibility event for existing host integrations during the Version
      // 0.7 to 0.8 migration. It carries the same versioned generic record.
      this.dispatchEvent(new CustomEvent<StudyResultRecord>('nasa-tlx-complete', {
        detail: this.submittedRecord,
        bubbles: true,
        composed: true,
      }));
      this.stage = 'complete';
      // Only discard the in-progress recovery copy once the completed record exists
      // somewhere else. A blocked or full localStorage makes saveCompletedResult return
      // false, and erasing the recovery copy then would leave no way back after a reload.
      if (!this.studyConfig || this.completionSavedLocally) this.clearSavedProgress();
      this.stopGazeInputInternal(false);
      this.clearError();
      // A staged Qualtrics hand-off is a short automatic transition. It is not durable confirmation. Do not
      // move focus or start speech that competes with the native page change.
      // The failure callback focuses and announces its actionable alert if the
      // page does not advance.
      if (!this.completionStagedByBridge) this.focusHeading();
    } catch (error) {
      this.submittingResult = false;
      this.showError(error instanceof Error ? error.message : 'Responses could not be calculated.');
    }
  };

  private downloadResultJson = () => {
    if (!this.submittedRecord) return;
    this.downloadRecordJson(this.submittedRecord);
  };

  private downloadRecordJson(record: StudyResultRecord) {
    downloadTextFile(
      `${resultFileBase(record)}.json`,
      JSON.stringify(record, null, 2),
      'application/json',
    );
  }

  private downloadResultCsv = () => {
    if (!this.submittedRecord) return;
    this.downloadRecordCsv(this.submittedRecord);
  };

  private downloadRecordCsv(record: StudyResultRecord) {
    downloadTextFile(
      `${resultFileBase(record)}.csv`,
      `\uFEFF${resultsToCsv([record])}`,
      'text/csv',
    );
  }

  private restart = () => {
    this.stopReading(false);
    this.stopGazeInputInternal(false);
    this.releaseRecognition();
    this.clearSavedProgress();
    this.forgetParticipantCodeForTab();
    this.stage = 'intro';
    this.ratingIndex = 0;
    this.editingRatingFromReview = false;
    this.reviewRatingEdit = null;
    this.reviewReturnFocusIndex = null;
    this.pairIndex = 0;
    this.pairOrder = shuffledPairs(this.definition);
    this.pairResponses = {};
    this.ratings = {};
    this.ratingInputRoutes = {};
    this.pairInputRoutes = {};
    this.supportChanges = [];
    this.resumeSummaryVisible = false;
    this.savedSession = null;
    this.recoveredCompletedRecord = null;
    this.result = null;
    this.submittedRecord = null;
    this.completionSavedLocally = false;
    this.completionStagedByBridge = false;
    this.remoteRecordingUnconfirmed = false;
    this.hostSubmissionFailed = false;
    this.browserStorageFailed = false;
    this.submittingResult = false;
    this.startedAt = '';
    this.participantCodeError = '';
    this.participantCodeRestoredForTab = false;
    if (this.studyConfig) this.participantCode = this.prefilledParticipantCode;
    this.errorMessage = '';
    this.voiceState = 'idle';
    this.pendingVoiceAnswer = null;
    this.audioGuidance = false;
    this.audioStatusMessage = '';
    this.gazeUsed = false;
    this.gazeActionCount = 0;
    this.applyConfiguredSupport();
    this.statusMessage = 'A new questionnaire has started.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  private invalidatePendingSubmission() {
    if (
      this.submittedRecord &&
      this.completionSavedLocally &&
      !this.completionStagedByBridge
    ) {
      removeCompletedResult(this.submittedRecord.submissionId);
    }
    this.result = null;
    this.submittedRecord = null;
    this.completionSavedLocally = false;
    this.completionStagedByBridge = false;
    this.remoteRecordingUnconfirmed = false;
    this.hostSubmissionFailed = false;
    this.browserStorageFailed = false;
  }

  private toggleReadAloud = () => {
    if (this.readingAloud) {
      this.stopReading(true);
      return;
    }
    this.speakText(this.currentStepSpeech());
  };

  private announceAutomatic(text: string) {
    if (this.audioGuidance && text.trim()) this.speakText(text);
  }

  private speakOpenedHelp(event: Event, text: string) {
    if ((event.currentTarget as HTMLDetailsElement).open) {
      this.announceAutomatic(text);
    }
  }

  private speakText(text: string) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      this.audioStatusMessage = 'Built-in audio is unavailable in this browser. External screen readers can still read the page.';
      return;
    }
    const synthesis = window.speechSynthesis;
    const replaceExistingSpeech = this.readingAloud || synthesis.speaking || synthesis.pending || synthesis.paused;
    const requestId = ++this.speechRequestId;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    // Do not select the first English voice returned by getVoices(). Voice order,
    // quality and gender vary by browser and operating system, and the first match
    // can be a compact or low-quality mobile voice. Leaving voice unset lets the
    // device use its configured English system voice for the requested language.
    utterance.onend = () => {
      if (requestId !== this.speechRequestId) return;
      this.readingAloud = false;
      this.audioStatusMessage = 'Spoken guidance finished.';
    };
    utterance.onerror = (event) => {
      if (requestId !== this.speechRequestId) return;
      this.readingAloud = false;
      const error = event.error ? ` (${event.error})` : '';
      this.audioStatusMessage = `No audio was played because the browser reported a speech error${error}. Check the device volume and try the button again.`;
    };

    const startSpeech = () => {
      if (requestId !== this.speechRequestId) return;
      try {
        synthesis.speak(utterance);
        this.readingAloud = true;
        this.readAloudUsed = true;
        this.audioStatusMessage = 'Playing spoken guidance.';
      } catch {
        this.readingAloud = false;
        this.audioStatusMessage = 'Built-in audio could not start in this browser. Check the device volume and try the button again.';
      }
    };

    // Some browsers fail the first utterance when cancel() or resume() is called
    // before speech has ever started. Only clear a queue that actually exists.
    if (replaceExistingSpeech) {
      synthesis.cancel();
      window.setTimeout(startSpeech, 0);
    } else {
      startSpeech();
    }
  }

  private stopReading(announce = false) {
    this.speechRequestId += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    this.readingAloud = false;
    if (announce) this.audioStatusMessage = 'Spoken guidance stopped.';
  }

  private currentStepSpeech() {
    if (this.stage === 'intro') {
      const task = this.studyConfig
        ? `Think about ${this.studyConfig.taskLabel}.`
        : '';
      const answerFormat = this.answerMode === 'smiley'
        ? 'The rating format uses five labelled smiley landmarks. A precise scale is available on request.'
        : `The rating format uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum}.`;
      const comparisons = this.pairs.length
        ? ` Then make ${this.pairs.length} pairwise comparisons.`
        : '';
      return `Before you begin. ${this.definition.introPrompt} ${task} Answer ${this.dimensions.length} items. ${answerFormat}${comparisons} Finally review and submit.`;
    }
    if (this.stage === 'ratings') {
      const dimension = this.dimensions[this.ratingIndex];
      const support =
        this.showSimpleLanguage && dimension.simpleExplanation
          ? ` Simpler explanation: ${dimension.simpleExplanation}`
          : '';
      const answerPrompt = this.answerMode === 'smiley'
        ? `Choose a smiley landmark: ${this.smileyLandmarks
            .map(({ value }) => `${this.landmarkLabel(dimension, value)}, value ${value}`)
            .join('; ')}. A more precise value is available on the full scale.`
        : `Rate from ${this.definition.scale.minimum}, ${dimension.lowAnchor}, to ${this.definition.scale.maximum}, ${dimension.highAnchor}, in steps of ${this.definition.scale.step}.`;
      return `Rating ${this.ratingIndex + 1} of ${this.dimensions.length}. ${dimension.name}. Official item: ${dimension.prompt}.${support} ${answerPrompt}`;
    }
    if (this.stage === 'pairs') {
      const pair = this.pairOrder[this.pairIndex];
      const left = this.dimensionById.get(pair.left)!;
      const right = this.dimensionById.get(pair.right)!;
      const support = this.showSimpleLanguage
        ? ` In simpler words, ${this.definition.pairwise!.simplePrompt} ${left.name}: ${left.shortMeaning}. ${right.name}: ${right.shortMeaning}.`
        : '';
      return `Comparison ${this.pairIndex + 1} of ${this.pairOrder.length}. ${this.definition.pairwise!.prompt} ${this.definition.pairwise!.instruction} Choose ${left.name} or ${right.name}.${support}`;
    }
    if (this.stage === 'review') {
      return `Review ${this.dimensions.length} item responses${this.pairs.length ? ` and ${this.pairs.length} comparisons` : ''} before submitting.`;
    }
    if (this.studyConfig && this.remoteRecordingUnconfirmed) {
      return this.statusMessage.trim() ||
        'Qualtrics could not confirm this response. Reconnect to the internet, then select Next to try again. Keep this page open or download one backup before closing it.';
    }
    if (this.studyConfig && this.completionStagedByBridge) {
      return 'Waiting for Qualtrics. Keep this page open.';
    }
    if (!this.result) return 'Responses calculated.';
    const score = !this.studyConfig || this.studyConfig.showScoreToParticipant
      ? ` ${this.result.scoreName}: ${this.result.primaryScore.toFixed(2)} out of ${this.result.scoreMaximum}.`
      : '';
    return `Responses calculated.${score} JSON and CSV backup buttons are available on this page.`;
  }

  private currentSimpleExplanationSpeech() {
    if (this.stage === 'ratings') {
      const dimension = this.dimensions[this.ratingIndex];
      return dimension.simpleExplanation
        ? `Simpler explanation for ${dimension.name}. ${dimension.simpleExplanation} Use the ${
            this.isResearcherSuppliedDefinition ? 'declared' : 'official'
          } scale when choosing your response.`
        : 'This questionnaire definition does not provide reworded item text.';
    }
    if (this.stage === 'pairs') {
      const pair = this.pairOrder[this.pairIndex];
      const left = this.dimensionById.get(pair.left)!;
      const right = this.dimensionById.get(pair.right)!;
      return `In simpler words, ${this.definition.pairwise!.simplePrompt} ${left.name}: ${left.shortMeaning}. ${right.name}: ${right.shortMeaning}.`;
    }
    return 'Simpler explanations are on. Official questionnaire wording remains visible.';
  }

  private resumeSummarySpeech() {
    return `Welcome back. ${this.completedCount()} of ${this.dimensions.length + this.pairs.length} responses completed. Last saved response: ${this.lastSavedDescription()}. Current position: ${this.currentPositionDescription()}. Next action: ${this.nextActionDescription()}`;
  }

  private startGazeInput = async () => {
    if (!isSecureGazeContext(window.location)) {
      this.gazeState = 'error';
      this.gazeMessage = 'Gaze input requires an HTTPS-hosted page or localhost.';
      this.announceAutomatic(this.gazeMessage);
      return;
    }
    this.gazeState = 'loading';
    this.gazeMessage = 'Loading the pinned WebGazer library. Webcam permission will be requested next.';
    try {
      const webgazer = await loadWebGazer();
      if (!webgazer.detectCompatibility()) throw new Error('This browser does not expose a compatible webcam API.');
      this.webgazer = webgazer;
      webgazer.params.faceMeshSolutionPath = WEBGAZER_FACE_MESH_URL;
      webgazer.saveDataAcrossSessions(false);
      await webgazer.clearData();
      webgazer.showVideoPreview(true);
      webgazer.showFaceOverlay(true);
      webgazer.showFaceFeedbackBox(true);
      webgazer.showPredictionPoints(false);
      webgazer.setGazeListener((point) => this.handleGazePoint(point));
      await webgazer.begin();
      // Explicit calibration samples are recorded below. Removing WebGazer's
      // global click listener prevents a single click from being learned twice
      // and keeps keyboard-triggered samples at the visible target centre.
      webgazer.removeMouseEventListeners();
      await this.showGazePositioningStep('Camera started. Position your face, then continue to calibration.');
    } catch (error) {
      this.gazeState = 'error';
      this.gazeMessage = error instanceof Error
        ? `Gaze setup did not start: ${error.message}`
        : 'Gaze setup did not start. Use another answer route.';
      this.announceAutomatic(this.gazeMessage);
      this.releaseGazeResources();
    }
  };

  private restartGazeCalibration = async () => {
    if (!this.webgazer) return;
    this.cancelGazeProposal();
    await this.webgazer.clearData();
    await this.showGazePositioningStep('Recalibration started. Check your position before continuing.');
  };

  private async showGazePositioningStep(message: string) {
    if (!this.webgazer) return;
    this.restoreWebGazerPreviewContainer();
    this.webgazer.showPredictionPoints(false);
    this.webgazer.showVideoPreview(true);
    this.webgazer.showFaceOverlay(true);
    this.webgazer.showFaceFeedbackBox(true);
    this.gazeState = 'positioning';
    this.gazeMessage = message;
    this.announceAutomatic(this.gazeMessage);
    await this.updateComplete;
    this.mountWebGazerPreview();
    this.querySelector<HTMLElement>('#gaze-positioning-heading')?.focus();
  }

  private mountWebGazerPreview() {
    const slot = this.querySelector<HTMLElement>('.gaze-camera-preview-slot');
    const preview = document.querySelector<HTMLElement>('#webgazerVideoContainer');
    if (!slot || !preview) return;
    preview.setAttribute('aria-hidden', 'true');
    slot.append(preview);
  }

  private restoreWebGazerPreviewContainer() {
    const preview = document.querySelector<HTMLElement>('#webgazerVideoContainer');
    if (preview && preview.parentElement !== document.body) document.body.append(preview);
  }

  private beginGazeCalibration = () => {
    if (!this.webgazer) return;
    this.restoreWebGazerPreviewContainer();
    this.webgazer.showVideoPreview(false);
    this.webgazer.showFaceOverlay(false);
    this.webgazer.showFaceFeedbackBox(false);
    this.webgazer.showPredictionPoints(false);
    this.gazeCalibrationIndex = 0;
    this.gazeCalibrationRepetition = 0;
    this.gazeState = 'calibrating';
    this.gazeMessage = 'Camera preview hidden. Complete all 27 calibration samples.';
    this.announceAutomatic(this.gazeMessage);
    void this.updateComplete.then(() => this.querySelector<HTMLButtonElement>('.calibration-point')?.focus());
  };

  private recordCalibrationPoint = (event: MouseEvent) => {
    if (!this.webgazer || this.gazeState !== 'calibrating') return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.webgazer.recordScreenPosition(rect.left + rect.width / 2, rect.top + rect.height / 2, 'click');
    if (this.gazeCalibrationRepetition < CALIBRATION_REPETITIONS - 1) {
      this.gazeCalibrationRepetition += 1;
      return;
    }
    if (this.gazeCalibrationIndex < CALIBRATION_POINTS.length - 1) {
      this.gazeCalibrationIndex += 1;
      this.gazeCalibrationRepetition = 0;
      return;
    }
    this.gazeCalibrationRepetition = CALIBRATION_REPETITIONS;
    this.gazeState = 'ready';
    this.gazeUsed = true;
    this.gazeMessage = 'Calibration complete. A red gaze dot is visible. Look at a large answer or navigation control for one second.';
    this.webgazer.showVideoPreview(false);
    this.webgazer.showFaceOverlay(false);
    this.webgazer.showFaceFeedbackBox(false);
    this.webgazer.showPredictionPoints(true);
    this.statusMessage = 'Gaze-assisted answering is ready.';
    this.announceAutomatic(this.statusMessage);
  };

  private handleGazePoint(point: GazePoint | null) {
    if (this.gazeState !== 'ready' || !point) {
      this.resetGazeHover();
      return;
    }
    const hits = this.elementsAtGazePoint(point);
    if (this.gazePendingElement) {
      const action =
        hits
          .map((hit) => hit.closest<HTMLElement>('[data-gaze-confirm], [data-gaze-cancel]'))
          .find((candidate): candidate is HTMLElement => candidate !== null) ?? null;
      const actionKey = action?.hasAttribute('data-gaze-confirm')
        ? 'confirm'
        : action?.hasAttribute('data-gaze-cancel')
          ? 'cancel'
          : null;
      const update = this.gazeConfirmationTracker.update(actionKey, performance.now());
      this.gazeDwellProgress = update.progress;
      if (update.activated && actionKey === 'confirm') this.confirmGazeProposal();
      if (update.activated && actionKey === 'cancel') this.cancelGazeProposal();
      return;
    }

    const target =
      hits
        .map((hit) => hit.closest<HTMLElement>('[data-gaze-target]'))
        .find((candidate): candidate is HTMLElement => candidate !== null) ?? null;
    const eligible = target && !target.matches(':disabled') ? target : null;
    if (eligible !== this.gazeCandidateElement) {
      this.resetGazeHover();
      this.gazeCandidateElement = eligible;
    }
    const key = eligible?.dataset.gazeLabel ?? eligible?.textContent?.trim() ?? null;
    const update = this.gazeCandidateTracker.update(key, performance.now());
    this.setGazeHover(eligible, update.progress);
    if (eligible && update.activated) {
      this.gazePendingElement = eligible;
      this.gazePendingLabel = key ?? 'selected control';
      this.gazeDwellProgress = 0;
      this.resetGazeHover();
      this.statusMessage = `${this.gazePendingLabel} proposed by gaze. Confirm or cancel.`;
      this.announceAutomatic(this.statusMessage);
    }
  }

  private elementsAtGazePoint(point: GazePoint) {
    if (typeof document.elementsFromPoint === 'function') {
      return document.elementsFromPoint(point.x, point.y).filter((element): element is HTMLElement => element instanceof HTMLElement);
    }
    const hit = document.elementFromPoint(point.x, point.y);
    return hit instanceof HTMLElement ? [hit] : [];
  }

  private setGazeHover(target: HTMLElement | null, progress: number) {
    this.gazeCandidateElement = target;
    this.gazeDwellProgress = progress;
    if (!target) return;
    target.classList.add('gaze-hover');
    target.style.setProperty('--gaze-progress', `${progress * 100}%`);
  }

  private resetGazeHover() {
    this.gazeCandidateTracker.reset();
    if (this.gazeCandidateElement) {
      this.gazeCandidateElement.classList.remove('gaze-hover');
      this.gazeCandidateElement.style.removeProperty('--gaze-progress');
    }
    this.gazeCandidateElement = null;
    if (!this.gazePendingElement) this.gazeDwellProgress = 0;
  }

  private confirmGazeProposal = () => {
    const target = this.gazePendingElement;
    if (!target) return;
    const label = this.gazePendingLabel;
    this.gazePendingElement = null;
    this.gazePendingLabel = '';
    this.gazeDwellProgress = 0;
    this.gazeConfirmationTracker.reset();
    this.gazeActivationInProgress = true;
    try {
      target.click();
      this.gazeActionCount += 1;
      this.gazeUsed = true;
      this.statusMessage = `${label} activated by confirmed gaze.`;
    } finally {
      this.gazeActivationInProgress = false;
    }
  };

  private cancelGazeProposal = () => {
    this.gazePendingElement = null;
    this.gazePendingLabel = '';
    this.gazeDwellProgress = 0;
    this.gazeConfirmationTracker.reset();
    this.statusMessage = 'Gaze proposal cancelled.';
  };

  private stopGazeInput = () => {
    this.stopGazeInputInternal(true);
  };

  private stopGazeInputInternal(announce: boolean) {
    const wasActive = this.gazeState !== 'off' || this.webgazer !== null;
    this.cancelGazeProposal();
    this.resetGazeHover();
    this.restoreWebGazerPreviewContainer();
    this.releaseGazeResources();
    this.gazeState = 'off';
    this.gazeMessage = 'Gaze input and camera stopped.';
    if (announce && wasActive) this.announceAutomatic(this.gazeMessage);
  }

  private releaseGazeResources() {
    const webgazer = this.webgazer;
    if (!webgazer) return;
    this.restoreWebGazerPreviewContainer();
    try { webgazer.clearGazeListener(); } catch { /* Already stopped. */ }
    try { webgazer.removeMouseEventListeners(); } catch { /* Already stopped. */ }
    try { webgazer.stopVideo(); } catch { /* Camera may not have opened. */ }
    try { webgazer.end(); } catch { /* DOM preview may not exist. */ }
    void Promise.resolve(webgazer.clearData()).catch(() => undefined);
    this.webgazer = null;
  }

  private async startVoiceInput(
    context: 'rating' | 'pair',
    first: TlxDimension,
    second?: TlxDimension,
    allowContextualHints = true,
    allowOnDevice = true,
  ) {
    this.stopReading();
    const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) return;
    this.releaseRecognition();
    this.pendingVoiceAnswer = null;
    this.voiceMessage = 'Preparing voice input.';
    this.voiceState = 'listening';
    const recognition = new Constructor();
    this.recognition = recognition;

    // The new local-language methods are specified on the unprefixed
    // constructor. A prefixed-only implementation keeps the established remote
    // route rather than being treated as local-capable.
    const onDeviceProvider = Constructor === window.SpeechRecognition
      ? Constructor
      : undefined;
    let route: PreparedSpeechRecognitionRoute;
    if (
      allowOnDevice &&
      onDeviceProvider?.available &&
      'processLocally' in recognition
    ) {
      route = await preparePreferredSpeechRecognitionRoute(
        onDeviceProvider,
        recognition,
        true,
      );
    } else {
      // Preserve the established synchronous path for prefixed browsers and
      // existing recognizers without the new static local-language API. This
      // avoids changing focus, status and event timing on unaffected routes.
      recognition.lang = 'en-GB';
      if ('processLocally' in recognition) recognition.processLocally = false;
      route = {
        action: 'start',
        mode: 'remote',
        lang: 'en-GB',
        message: 'Listening for one answer using the browser speech service.',
      };
    }
    if (this.recognition !== recognition) return;
    if (route.action === 'wait') {
      this.releaseRecognition(recognition);
      this.showVoiceNotice(route.message);
      return;
    }
    this.voiceMessage = route.message;
    const localRoute = route.mode === 'local';

    recognition.continuous = false;
    recognition.interimResults = false;
    const contextualHintsApplied = allowContextualHints
      ? this.configureVoiceHints(recognition, context, first, second)
      : false;
    // Ask for ranked alternatives so a valid answer can be recovered when the
    // service's first transcript is unusable. Unsafe negation in any returned
    // alternative vetoes the complete result. Otherwise the first ranked safe
    // visible answer is proposed and still requires explicit confirmation.
    recognition.maxAlternatives = 5;
    recognition.onresult = (event) => {
      if (this.recognition !== recognition) return;
      const result = event.results[0];
      const transcripts: string[] = [];
      for (let index = 0; result && index < result.length; index += 1) {
        const transcript = result[index]?.transcript?.trim();
        if (transcript) transcripts.push(transcript);
      }
      if (context === 'rating') {
        const proposal = parseRatingAlternatives(
          transcripts,
          first,
          this.ratingValues,
          this.smileyLandmarks,
        );
        const allowedProposal = isEnglishLanguage(this.definition.language)
          ? proposal
          : proposal && /\p{Number}|\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/iu.test(proposal.transcript)
            ? proposal
            : null;
        if (allowedProposal) {
          this.releaseRecognition(recognition);
          const label = this.ratingVoiceAnswerLabel(first, allowedProposal.value);
          this.pendingVoiceAnswer = {
            context,
            transcript: allowedProposal.transcript,
            value: allowedProposal.value,
            label,
          };
          this.voiceState = 'pending';
          this.voiceMessage =
            `Proposed answer: ${label}. Confirm only if the heard words and proposed answer match ` +
            'what you intended; otherwise try again.';
          this.announceAutomatic(this.voiceMessage);
          void this.updateComplete.then(() =>
            this.querySelector<HTMLButtonElement>('[data-voice-confirm]')?.focus(),
          );
          return;
        }
      } else {
        const proposal = parsePairAlternatives(transcripts, [first, second!]);
        if (proposal) {
          this.releaseRecognition(recognition);
          const label = this.dimensionById.get(proposal.value)!.name;
          this.pendingVoiceAnswer = {
            context,
            transcript: proposal.transcript,
            value: proposal.value,
            label,
          };
          this.voiceState = 'pending';
          this.voiceMessage =
            `Proposed answer: ${label}. Confirm only if the heard words and proposed answer match ` +
            'what you intended; otherwise try again.';
          this.announceAutomatic(this.voiceMessage);
          void this.updateComplete.then(() =>
            this.querySelector<HTMLButtonElement>('[data-voice-confirm]')?.focus(),
          );
          return;
        }
      }
      this.releaseRecognition(recognition);
      const informativeTranscript =
        transcripts.find((transcript) => hasUnsafeSpeechMeaning(transcript)) ?? transcripts[0];
      const heard = informativeTranscript
        ? ` I heard “${informativeTranscript}”.`
        : '';
      this.showVoiceNotice(
        context === 'rating'
          ? `No answer was selected.${heard} Try a short command such as “number four”, or use a visible answer button.`
          : `No answer was selected.${heard} Say ${first.name} or ${second!.name}, or use a visible answer button.`,
      );
    };
    recognition.onerror = (event) => {
      if (this.recognition !== recognition) return;
      this.releaseRecognition(recognition);
      // Some browsers expose SpeechRecognitionPhrase and the `phrases`
      // property but reject contextual biasing only when recognition starts.
      // Retry once without the experimental hints so their failure cannot
      // remove the established speech route.
      if (event.error === 'phrases-not-supported' && contextualHintsApplied) {
        void this.startVoiceInput(
          context,
          first,
          second,
          false,
          allowOnDevice,
        );
        return;
      }
      // A browser may report a pack as available and still reject local start.
      // Retry exactly once through the established remote en-GB route rather
      // than looping or weakening the parser.
      if (event.error === 'language-not-supported' && localRoute && allowOnDevice) {
        void this.startVoiceInput(
          context,
          first,
          second,
          allowContextualHints,
          false,
        );
        return;
      }
      this.showVoiceNotice(this.voiceRecognitionErrorMessage(event.error));
    };
    recognition.onend = () => {
      if (this.recognition !== recognition) return;
      this.recognition = null;
      if (this.voiceState === 'listening') {
        this.showVoiceNotice('No answer was selected. Try again, or use a visible answer button.');
      }
    };
    try {
      recognition.start();
    } catch {
      this.releaseRecognition(recognition);
      this.showVoiceNotice('Voice input is unavailable in this browser context. Use a visible answer button.');
    }
  }

  private configureVoiceHints(
    recognition: SpeechRecognitionLike,
    context: 'rating' | 'pair',
    first: TlxDimension,
    second?: TlxDimension,
  ): boolean {
    const Phrase = window.SpeechRecognitionPhrase;
    if (!Phrase || !('phrases' in recognition)) return false;
    const hints = context === 'rating'
      ? buildRatingSpeechHints(
          first,
          this.ratingValues,
          this.smileyLandmarks,
          isEnglishLanguage(this.definition.language),
        )
      : buildPairSpeechHints([first, second!]);
    try {
      // A moderate boost improves the vocabulary without forcing unrelated
      // speech into an answer. This API is experimental, so failure must leave
      // the standard recognition route fully usable.
      recognition.phrases = hints.slice(0, 120).map((hint) => new Phrase(hint, 4));
      return true;
    } catch {
      // Unsupported or partially implemented contextual biasing: continue with
      // ordinary Web Speech recognition.
      return false;
    }
  }

  private voiceRecognitionErrorMessage(error: string | undefined) {
    switch (error) {
      case 'not-allowed':
      case 'service-not-allowed':
        return 'Microphone or speech-service permission was not granted. Allow microphone access, or use the visible answer buttons.';
      case 'language-not-supported':
      case 'language-unavailable':
        return 'English voice input is unavailable in this browser. Use a visible answer button.';
      case 'no-speech':
        return 'No speech was detected. Try again after the microphone starts listening, or use the visible answer buttons.';
      case 'audio-capture':
        return 'No working microphone was available. Check the selected microphone, or use the visible answer buttons.';
      case 'network':
        return 'The browser speech service could not connect. Check the network, try again, or use the visible answer buttons.';
      case 'aborted':
        return 'Voice input stopped before a result was returned. Try again, or use the visible answer buttons.';
      case 'phrases-not-supported':
        return 'Voice input is unavailable in this browser. Try again, or use a visible answer button.';
      default:
        return `Voice input is unavailable${error ? ` (${error})` : ''}. Try again, or use a visible answer button.`;
    }
  }

  private showVoiceNotice(message: string) {
    this.voiceState = 'error';
    this.voiceMessage = message;
    this.announceAutomatic(message);
  }

  private confirmVoiceAnswer = () => {
    const pending = this.pendingVoiceAnswer;
    if (!pending) return;
    let confirmedControlId = '';
    if (pending.context === 'rating') {
      const dimension = this.dimensions[this.ratingIndex];
      const value = pending.value as number;
      this.selectRating(dimension.id, value, 'voice');
      const visibleAsLandmark = this.answerMode === 'smiley' && this.smileyLandmarks.some((landmark) => landmark.value === value);
      confirmedControlId = visibleAsLandmark
        ? `smiley-${dimension.id}-${value}`
        : `rating-${dimension.id}-${value}`;
    } else {
      const pair = this.pairOrder[this.pairIndex];
      const dimension = pending.value as DimensionId;
      this.selectPair(pair.id, dimension, 'voice');
      confirmedControlId = `${pair.id}-${dimension}`;
    }
    this.voiceState = 'idle';
    this.voiceMessage = '';
    this.pendingVoiceAnswer = null;
    void this.updateComplete.then(() => this.querySelector<HTMLInputElement>(`#${confirmedControlId}`)?.focus());
  };

  private clearVoiceAnswer = () => {
    this.releaseRecognition();
    this.voiceState = 'idle';
    this.voiceMessage = '';
    this.pendingVoiceAnswer = null;
  };

  private releaseRecognition(recognition = this.recognition) {
    if (!recognition) return;
    if (this.recognition === recognition) this.recognition = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      recognition.stop();
    } catch {
      // Browsers may report InvalidStateError when a one-shot recogniser has already ended.
    }
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.hiddenAt = Date.now();
      return;
    }
    if (this.hiddenAt && this.recoveryEnabled && this.isInProgress()) {
      this.resumeSummaryVisible = true;
      this.interruptionSummaryShown = true;
      this.statusMessage = 'Welcome back. A summary of your saved position is available.';
      void this.updateComplete.then(() => {
        this.querySelector<HTMLElement>('#resume-heading')?.focus();
        this.announceAutomatic(this.resumeSummarySpeech());
      });
    }
    this.hiddenAt = null;
  };

  private handleParticipantStudyHashChange = () => {
    const parameters = new URLSearchParams(
      window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash,
    );
    if (!parameters.has('study')) return;
    // Participant links encode the complete configuration and identity in the
    // fragment. A full reload gives valid and invalid replacement links the
    // same clean initialisation path and cannot retain the previous run state.
    this.reloadForParticipantStudyLink();
  };

  private reloadForParticipantStudyLink() {
    window.location.reload();
  }

  private handleSkipToCurrentQuestion = (event: MouseEvent) => {
    // Native fragment navigation would replace the application hash that holds
    // the study configuration and participant identity. Preserve that hash and
    // provide the same keyboard destination programmatically instead.
    event.preventDefault();
    void this.updateComplete.then(() => {
      const panel = this.querySelector<HTMLElement>('#question-panel');
      if (!panel) return;
      const target = panel.querySelector<HTMLElement>('h2') ?? panel;
      if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
      focusAndReveal(target, {
        block: 'start',
        onReveal: () => this.requestParentReveal(target),
      });
    });
  };

  private dismissResumeSummary = () => {
    this.resumeSummaryVisible = false;
    this.statusMessage = `Continuing at ${this.currentPositionDescription()}.`;
    this.focusHeading();
  };

  private currentProgressStorageKey() {
    const code = this.studyConfig ? this.participantCode : 'DEMO';
    if (!validParticipantCode(code)) return null;
    return progressStorageKey(this.studyConfig?.configId ?? 'demo-config', code);
  }

  private currentTabParticipantCodeKey() {
    if (!this.studyConfig) return null;
    return `accessible-questionnaire-v0.8-tab-participant:${this.studyConfig.configId}`;
  }

  private currentTabParticipantBindingKey() {
    if (!this.studyConfig) return null;
    return `accessible-questionnaire-v0.8-tab-participant-binding:${this.studyConfig.configId}`;
  }

  private rememberParticipantCodeForTab(committed = false) {
    const storageKey = this.currentTabParticipantCodeKey();
    if (!storageKey || !this.recoveryEnabled || !validParticipantCode(this.participantCode)) return;
    try {
      sessionStorage.setItem(storageKey, this.participantCode);
      if (committed) {
        const bindingKey = this.currentTabParticipantBindingKey();
        if (bindingKey) {
          const binding: TabParticipantBinding = {
            version: 1,
            linkParticipantCode: this.prefilledParticipantCode || null,
            activeParticipantCode: this.participantCode,
          };
          sessionStorage.setItem(bindingKey, JSON.stringify(binding));
        }
      }
    } catch {
      // Tab-scoped storage is an optional convenience. Local progress recovery and
      // the participant-code field remain available if the browser blocks it.
    }
  }

  private forgetParticipantCodeForTab() {
    const storageKey = this.currentTabParticipantCodeKey();
    if (!storageKey) return;
    try {
      sessionStorage.removeItem(storageKey);
      const bindingKey = this.currentTabParticipantBindingKey();
      if (bindingKey) sessionStorage.removeItem(bindingKey);
    } catch {
      // The browser may block tab-scoped storage.
    }
  }

  private restoreParticipantCodeForTab() {
    const storageKey = this.currentTabParticipantCodeKey();
    if (!storageKey || !this.recoveryEnabled || this.invalidParticipantParameter) return;
    try {
      const bindingKey = this.currentTabParticipantBindingKey();
      const rawBinding = bindingKey ? sessionStorage.getItem(bindingKey) : null;
      if (rawBinding) {
        try {
          const binding = JSON.parse(rawBinding) as Partial<TabParticipantBinding>;
          const currentLinkParticipantCode = this.prefilledParticipantCode || null;
          const validBinding =
            binding.version === 1 &&
            (binding.linkParticipantCode === null ||
              (typeof binding.linkParticipantCode === 'string' &&
                validParticipantCode(binding.linkParticipantCode))) &&
            typeof binding.activeParticipantCode === 'string' &&
            validParticipantCode(binding.activeParticipantCode);
          if (
            validBinding &&
            typeof binding.activeParticipantCode === 'string' &&
            binding.linkParticipantCode === currentLinkParticipantCode
          ) {
            if (this.participantCode !== binding.activeParticipantCode) {
              this.participantCode = binding.activeParticipantCode;
              this.participantCodeRestoredForTab = true;
              this.statusMessage = 'Participant code restored for this tab. Checking for interrupted answers.';
            }
            return;
          }
        } catch {
          // Ignore a damaged optional binding and use the safe fallback below.
        }
      }
      // A different valid participant-specific link always starts a new identity
      // context, even if this tab still contains a binding from an older link.
      if (validParticipantCode(this.participantCode)) return;
      const savedCode = sessionStorage.getItem(storageKey);
      if (!savedCode || !validParticipantCode(savedCode)) return;
      this.participantCode = savedCode;
      this.participantCodeRestoredForTab = true;
      this.statusMessage = 'Participant code restored for this tab. Checking for interrupted answers.';
    } catch {
      // Re-entering the pseudonymous code remains the safe fallback.
    }
  }

  private persistProgress() {
    if (!this.recoveryEnabled || !this.isInProgress()) return;
    const storageKey = this.currentProgressStorageKey();
    if (!storageKey) return;
    const session: SavedSession = {
      version: 4,
      instrumentId: this.definition.id,
      questionnaireDefinition: this.definition,
      savedAt: Date.now(),
      startedAt: this.startedAt || new Date().toISOString(),
      configId: this.studyConfig?.configId ?? 'demo-config',
      participantCode: this.studyConfig ? this.participantCode : 'DEMO',
      stage: this.stage as SavedSession['stage'],
      ratingIndex: this.ratingIndex,
      pairIndex: this.pairIndex,
      pairOrder: this.pairOrder,
      pairResponses: this.pairResponses,
      ratings: this.ratings,
      ratingInputRoutes: this.ratingInputRoutes,
      pairInputRoutes: this.pairInputRoutes,
      supportChanges: this.supportChanges,
      support: {
        answerMode: this.answerMode,
        showSimpleLanguage: this.showSimpleLanguage,
        largeText: this.largeText,
        audioGuidance: this.audioGuidance,
      },
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(session));
      // Bind a manual correction to this exact participant link only after the
      // corrected identity has successfully saved an in-progress session.
      this.rememberParticipantCodeForTab(true);
    } catch {
      this.statusMessage = 'Progress could not be saved by this browser.';
      this.announceAutomatic(this.statusMessage);
    }
  }

  private applySavedRecoveryPresentation(session: SavedSession) {
    if (!this.canAdjustPresentationSupport) return;
    this.largeText = session.support.largeText;
    this.audioGuidance = Boolean(session.support.audioGuidance);
  }

  private findSavedSession() {
    const storageKey = this.currentProgressStorageKey();
    if (!storageKey) return;
    this.savedSessionProblem = '';
    let legacyStorageKey: string | null = null;
    try {
      let raw = localStorage.getItem(storageKey);
      if (!raw && this.definition.id === DEFAULT_QUESTIONNAIRE_ID) {
        const code = this.studyConfig ? this.participantCode : 'DEMO';
        if (validParticipantCode(code)) {
          legacyStorageKey = `accessible-nasa-tlx-v0.7-progress:${this.studyConfig?.configId ?? 'demo-config'}:${code}`;
          raw = localStorage.getItem(legacyStorageKey);
        }
      }
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      const session = this.normaliseSavedSession(parsed);
      if (this.validSavedSession(session)) {
        if (legacyStorageKey) {
          // Version 0.7 used the same strictly validated progress shape but did
          // not record the instrument ID. It can only represent weighted
          // NASA-TLX, so migrate it to the current, instrument-aware key.
          localStorage.setItem(storageKey, JSON.stringify(session));
          localStorage.removeItem(legacyStorageKey);
        } else if (
          parsed &&
          typeof parsed === 'object' &&
          !('questionnaireDefinition' in parsed)
        ) {
          // Early Version 4 built-in sessions pre-date the immutable definition
          // snapshot. They can be upgraded only because the built-in instrument
          // ID resolves to the versioned definition shipped with this release.
          try {
            localStorage.setItem(storageKey, JSON.stringify(session));
          } catch {
            // The validated in-memory copy can still be resumed. Leave the
            // original browser record untouched if persistence is unavailable.
          }
        }
        this.savedSession = session;
        this.savedSessionProblem = '';
        this.applySavedRecoveryPresentation(session);
        this.announceSavedSessionOffer(session);
      } else if (legacyStorageKey) {
        this.savedSessionProblem =
          'An older saved copy does not match this questionnaire and was not changed or deleted. Start this questionnaire again below.';
      } else {
        this.savedSessionProblem =
          'The saved copy does not match this questionnaire and was not used. Start this questionnaire again below.';
        this.clearSavedProgress();
      }
    } catch {
      // Do not destroy a legacy recovery copy if migration or parsing fails.
      // A current-version invalid copy remains safe to discard as before.
      if (legacyStorageKey) {
        this.savedSessionProblem =
          'An older saved copy could not be read and was not changed or deleted. Start this questionnaire again below.';
      } else {
        this.savedSessionProblem =
          'The saved copy could not be read and was not used. Start this questionnaire again below.';
        this.clearSavedProgress();
      }
    }
  }

  private normaliseSavedSession(value: unknown): SavedSession | null {
    if (!value || typeof value !== 'object') return null;
    const session = value as SavedSession | SavedSessionV4WithoutDefinition | LegacySavedSessionV3;
    if (session.version === 4) {
      if ('questionnaireDefinition' in session) return session;
      const builtIn = getQuestionnaireDefinition(session.instrumentId);
      if (!builtIn || builtIn.id !== this.definition.id) return null;
      return { ...session, questionnaireDefinition: builtIn };
    }
    if (session.version !== 3 || this.definition.id !== DEFAULT_QUESTIONNAIRE_ID) return null;
    return {
      ...session,
      version: 4,
      instrumentId: DEFAULT_QUESTIONNAIRE_ID,
      questionnaireDefinition: this.definition,
    };
  }

  private findCompletedBackup() {
    if (!this.studyConfig || !validParticipantCode(this.participantCode)) return;
    const matching = loadCompletedResults().filter(
      (record) =>
        record.study.configId === this.studyConfig!.configId &&
        record.participantCode === this.participantCode,
    );
    this.recoveredCompletedRecord = matching.at(-1) ?? null;
  }

  private validSavedSession(session: SavedSession | null): session is SavedSession {
    if (
      session?.version !== 4 ||
      session.instrumentId !== this.definition.id ||
      JSON.stringify(session.questionnaireDefinition) !== JSON.stringify(this.definition) ||
      session.configId !== (this.studyConfig?.configId ?? 'demo-config') ||
      session.participantCode !== (this.studyConfig ? this.participantCode : 'DEMO') ||
      !Number.isFinite(session.savedAt) ||
      typeof session.startedAt !== 'string' ||
      !['ratings', 'pairs', 'review'].includes(session.stage) ||
      !Number.isInteger(session.ratingIndex) ||
      session.ratingIndex < 0 ||
      session.ratingIndex >= this.dimensions.length ||
      !Number.isInteger(session.pairIndex) ||
      session.pairIndex < 0 ||
      session.pairIndex >= Math.max(1, this.pairs.length) ||
      (session.stage === 'pairs' && this.pairs.length === 0) ||
      !Array.isArray(session.pairOrder) ||
      !Array.isArray(session.supportChanges) ||
      !session.ratings || typeof session.ratings !== 'object' ||
      !session.pairResponses || typeof session.pairResponses !== 'object' ||
      !session.ratingInputRoutes || typeof session.ratingInputRoutes !== 'object' ||
      !session.pairInputRoutes || typeof session.pairInputRoutes !== 'object' ||
      !session.support || typeof session.support !== 'object' ||
      !['standard', 'smiley'].includes(session.support.answerMode) ||
      typeof session.support.showSimpleLanguage !== 'boolean' ||
      typeof session.support.largeText !== 'boolean' ||
      (session.support.audioGuidance !== undefined &&
        typeof session.support.audioGuidance !== 'boolean')
    ) return false;

    const itemIds = new Set(this.dimensions.map(({ id }) => id));
    const allowedValues = new Set(this.ratingValues);
    if (Object.entries(session.ratings).some(
      ([id, value]) =>
        !itemIds.has(id) || typeof value !== 'number' || !allowedValues.has(value),
    )) return false;
    if (Object.entries(session.ratingInputRoutes).some(
      ([id, route]) =>
        !itemIds.has(id) ||
        typeof route !== 'string' ||
        !['standard-scale', 'smiley-landmark', 'voice', 'gaze-standard-scale', 'gaze-smiley-landmark']
          .includes(route),
    )) return false;

    const pairById = new Map(this.pairs.map((pair) => [pair.id, pair]));
    const presentedPairIds = new Set<string>();
    for (const pair of session.pairOrder) {
      const expected = pairById.get(pair?.id);
      if (
        !expected ||
        expected.left !== pair.left ||
        expected.right !== pair.right ||
        presentedPairIds.has(pair.id)
      ) return false;
      presentedPairIds.add(pair.id);
    }
    if (presentedPairIds.size !== pairById.size) return false;
    if (Object.entries(session.pairResponses).some(([pairId, selected]) => {
      const pair = pairById.get(pairId);
      return !pair || (selected !== pair.left && selected !== pair.right);
    })) return false;
    if (Object.entries(session.pairInputRoutes).some(
      ([pairId, route]) =>
        !pairById.has(pairId) ||
        typeof route !== 'string' ||
        !['standard-choice', 'voice', 'gaze'].includes(route),
    )) return false;

    return true;
  }

  private restoreSavedSession = () => {
    const session = this.savedSession;
    if (!session) return;
    this.stage = session.stage;
    this.editingRatingFromReview = false;
    this.reviewRatingEdit = null;
    this.reviewReturnFocusIndex = null;
    this.ratingIndex = session.ratingIndex;
    this.pairIndex = session.pairIndex;
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
    this.recoveryEnabled = true;
    this.savedSession = null;
    this.savedSessionProblem = '';
    this.savedSessionAnnouncementKey = '';
    this.resumeSummaryVisible = true;
    this.interruptionSummaryShown = true;
    void this.updateComplete.then(() => {
      this.querySelector<HTMLElement>('#resume-heading')?.focus();
      this.announceAutomatic(this.resumeSummarySpeech());
    });
  };

  private eraseSavedSession = () => {
    this.clearSavedProgress();
    this.savedSession = null;
    this.savedSessionProblem = '';
    this.savedSessionAnnouncementKey = '';
    this.statusMessage = 'Saved answers erased.';
  };

  private clearSavedProgress() {
    const storageKey = this.currentProgressStorageKey();
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Storage may be unavailable in a restricted browser context.
    }
  }

  private isInProgress(): boolean {
    return this.stage === 'ratings' || this.stage === 'pairs' || this.stage === 'review';
  }

  private completedCount() {
    return Object.keys(this.ratings).length + Object.keys(this.pairResponses).length;
  }

  private lastSavedDescription() {
    if (this.stage === 'ratings') {
      const index = this.ratings[this.dimensions[this.ratingIndex].id] !== undefined ? this.ratingIndex : this.ratingIndex - 1;
      return index >= 0 ? `${this.dimensions[index].name} rating` : 'No response yet';
    }
    if (this.stage === 'pairs') {
      if (this.pairResponses[this.pairOrder[this.pairIndex].id]) return `Comparison ${this.pairIndex + 1}`;
      if (this.pairIndex > 0) return `Comparison ${this.pairIndex}`;
      return `${this.dimensions.at(-1)?.name ?? 'Final item'} rating`;
    }
    return this.pairs.length
      ? `Comparison ${this.pairs.length}`
      : `${this.dimensions.at(-1)?.name ?? 'Final item'} rating`;
  }

  private currentPositionDescription() {
    if (this.stage === 'ratings') return `Rating ${this.ratingIndex + 1} of ${this.dimensions.length}: ${this.dimensions[this.ratingIndex].name}`;
    if (this.stage === 'pairs') return `Comparison ${this.pairIndex + 1} of ${this.pairOrder.length}`;
    if (this.stage === 'review') return 'Review responses';
    return 'Questionnaire introduction';
  }

  private nextActionDescription() {
    if (this.stage === 'ratings') return `Choose or check the ${this.dimensions[this.ratingIndex].name} rating, then select Next.`;
    if (this.stage === 'pairs') {
      const pair = this.pairOrder[this.pairIndex];
      return `Choose ${this.dimensionById.get(pair.left)!.name} or ${this.dimensionById.get(pair.right)!.name}, then select Next.`;
    }
    return 'Check the saved answers, then submit or return to a question.';
  }

  private showError(message: string) {
    this.errorMessage = message;
    void this.updateComplete.then(() => {
      const summary = this.querySelector<HTMLElement>('#error-summary');
      if (!summary) return;
      focusAndReveal(summary, {
        block: 'start',
        forceCoordinateScroll: true,
        onReveal: () => this.requestParentReveal(summary),
      });
      // Reveal the error before optional speech begins so visual position,
      // keyboard focus and audio feedback describe the same state.
      this.announceAutomatic(`There is a problem. ${message}`);
    });
  }

  private requestParentReveal(_element: HTMLElement) {
    // The Qualtrics bridge gives the participant page the only visible
    // viewport and scrollbar. focusAndReveal therefore scrolls this document
    // directly; a second parent-window scroll request would reintroduce the
    // nested-scroll failure that the full-viewport bridge removes.
  }

  private clearError() {
    this.errorMessage = '';
  }

  private focusHeading(speak = true) {
    void this.updateComplete.then(() => {
      window.scrollTo({ top: 0 });
      const heading = this.querySelector<HTMLElement>('#question-panel h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
        this.statusMessage = heading.textContent?.trim() ?? '';
        if (speak && this.audioGuidance) this.speakText(this.currentStepSpeech());
      }
    });
  }
}

@customElement('accessible-questionnaire')
export class AccessibleQuestionnaire extends AccessibleNasaTlx {}

declare global {
  interface HTMLElementTagNameMap {
    'accessible-nasa-tlx': AccessibleNasaTlx;
    'accessible-questionnaire': AccessibleQuestionnaire;
  }
}
