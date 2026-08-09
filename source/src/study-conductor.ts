import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { focusAndReveal } from './accessibility-utils';
import embeddedDataFields from '../../integrations/qualtrics/embedded-data-fields.txt?raw';
import endOfSurveyMessage from '../../integrations/qualtrics/end-of-survey-message.txt?raw';
import qualtricsQuestionJavaScript from '../../integrations/qualtrics/qualtrics-question.js?raw';
import qualtricsQuestionTemplate from '../../integrations/qualtrics/question-html-template.html?raw';
import {
  DEFAULT_QUESTIONNAIRE_ID,
  buildQuestionnairePairs,
  buildRatingValues,
  builtInQuestionnaires,
  getQuestionnaireDefinition,
  resolveQuestionnaireDefinition,
  type QuestionnaireDefinition,
} from './questionnaire-definition';
import {
  MAX_CUSTOM_QUESTIONNAIRE_ITEMS,
  createCustomItemDraft,
  createCustomQuestionnaireDefinition,
  createCustomQuestionnaireDraft,
  customDefinitionFileName,
  validateCustomQuestionnaireDefinition,
  type CustomQuestionnaireDraft,
  type CustomQuestionnaireItemDraft,
} from './custom-questionnaire';
import {
  reviewQuestionnaireExport,
  type QuestionnaireImportReview,
  type QuestionnaireImportSourceSelection,
} from './platform-questionnaire-import';
import {
  PROTOTYPE_VERSION,
  buildParticipantUrl,
  clearCompletedResults,
  createStudyConfig,
  downloadTextFile,
  loadCompletedResults,
  normaliseStudyConfig,
  normaliseHttpsOrigin,
  resultsToCsv,
  validParticipantCode,
  type AnswerMode,
  type ParticipantAdjustmentPolicy,
  type StudyCollectionConfig,
  type StudyConfig,
  type StudyResultRecord,
  type StudySupportConfig,
} from './study';

const qualtricsEmbeddedDataFieldCount =
  embeddedDataFields.trim().split(/\r?\n/).filter(Boolean).length;
const qualtricsBridgeBuild =
  qualtricsQuestionJavaScript.match(/var bridgeBuild = '([^']+)'/)?.[1] ??
  'unidentified';

type ConductorSetupRoute = 'ready-made' | 'imported';
type ConductorStepKey =
  | 'source'
  | 'upload'
  | 'questions'
  | 'answers'
  | 'warnings'
  | 'scoring'
  | 'study'
  | 'support'
  | 'collection'
  | 'review';

interface ConductorStep {
  key: ConductorStepKey;
  title: string;
}

const readyMadeConductorSteps: readonly ConductorStep[] = [
  { key: 'source', title: 'Choose the questionnaire source' },
  { key: 'scoring', title: 'Confirm the questionnaire and scoring' },
  { key: 'study', title: 'Enter study details' },
  { key: 'support', title: 'Set participant support' },
  { key: 'collection', title: 'Choose result collection' },
  { key: 'review', title: 'Review and generate' },
];

const importedConductorSteps: readonly ConductorStep[] = [
  { key: 'source', title: 'Choose the questionnaire source' },
  { key: 'upload', title: 'Upload the file and choose the relevant part' },
  { key: 'questions', title: 'Review the questions' },
  { key: 'answers', title: 'Review answer choices and stored values' },
  { key: 'warnings', title: 'Resolve import warnings' },
  { key: 'scoring', title: 'Confirm the scoring rule' },
  { key: 'study', title: 'Enter study details' },
  { key: 'support', title: 'Set participant support' },
  { key: 'collection', title: 'Choose result collection' },
  { key: 'review', title: 'Review and generate' },
];

const CONDUCTOR_DRAFT_KEY = 'accessible-questionnaire-v0.8-conductor-draft';

function looksLikeCompletedResult(value: unknown) {
  const records = Array.isArray(value) ? value : [value];
  return records.length > 0 && records.some((candidate) => {
    if (!candidate || typeof candidate !== 'object') return false;
    const record = candidate as Record<string, unknown>;
    return 'study' in record && 'responses' in record && 'result' in record;
  });
}

export function buildQualtricsQuestionHtml(participantUrl: string) {
  const placeholder = 'PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE';
  if (!participantUrl || participantUrl.includes(placeholder)) {
    throw new Error('A generated participant URL is required for the Qualtrics question HTML.');
  }
  const escapedUrl = participantUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return qualtricsQuestionTemplate.trim().replace(placeholder, escapedUrl);
}

export function buildQualtricsEndOfSurveyMessage(showScore: boolean) {
  const scoreBlock = showScore
    ? [
        'Questionnaire:',
        '${e://Field/__js_AQP_INSTRUMENT_NAME}',
        '',
        '${e://Field/__js_AQP_SCORE_NAME}:',
        '${e://Field/__js_AQP_PRIMARY_SCORE}',
      ].join('\n')
    : '';
  return endOfSurveyMessage
    .replace('{{OPTIONAL_SCORE_BLOCK}}', scoreBlock)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

@customElement('study-conductor-app')
export class StudyConductorApp extends LitElement {
  @state() private setupRoute: ConductorSetupRoute = 'ready-made';
  @state() private wizardStepIndex = 0;
  @state() private scoringConfirmed = false;
  @state() private importWarningsAcknowledged = false;
  @state() private instrumentId = DEFAULT_QUESTIONNAIRE_ID;
  @state() private customDefinition: QuestionnaireDefinition | null = null;
  @state() private customDraft: CustomQuestionnaireDraft =
    createCustomQuestionnaireDraft();
  @state() private customBuilderOpen = false;
  @state() private platformImportSource: QuestionnaireImportSourceSelection = 'auto';
  @state() private platformImportReview: QuestionnaireImportReview | null = null;
  @state() private platformImportConfirmed = false;
  @state() private platformImportSelectedGroupId = '';
  @state() private platformImportSelectedRatingSetId = '';
  private platformImportContents = '';
  private platformImportFileName = '';
  @state() private studyId = '';
  @state() private studyTitle = '';
  @state() private taskLabel = '';
  @state() private participantCode = '';
  @state() private showScoreToParticipant = false;
  @state() private showSimpleLanguage = false;
  @state() private answerMode: AnswerMode = 'standard';
  @state() private largeText = false;
  @state() private audioGuidance = false;
  @state() private recoveryEnabled = true;
  @state() private participantAdjustmentPolicy: ParticipantAdjustmentPolicy = 'participant-choice';
  @state() private voiceInputAvailable = true;
  @state() private gazeInputAvailable = false;
  @state() private collectionMode: StudyCollectionConfig['mode'] = 'local';
  @state() private qualtricsSurveyUrl = '';
  @state() private generatedConfig: StudyConfig | null = null;
  @state() private participantUrl = '';
  @state() private message = '';
  @state() private definitionConfirmation = '';
  @state() private configurationConfirmation = '';
  @state() private errorMessage = '';
  @state() private completedResults: StudyResultRecord[] = [];
  private draftRestored = false;

  connectedCallback() {
    super.connectedCallback();
    this.restoreConductorDraft();
    this.refreshResults();
    window.addEventListener('storage', this.refreshResults);
    window.addEventListener('popstate', this.handleWizardPopState);
    window.history.replaceState(
      { ...(window.history.state ?? {}), aqpConductorStep: this.wizardStepIndex },
      '',
      window.location.href,
    );
  }

  disconnectedCallback() {
    window.removeEventListener('storage', this.refreshResults);
    window.removeEventListener('popstate', this.handleWizardPopState);
    super.disconnectedCallback();
  }

  protected updated() {
    if (this.draftRestored) this.persistConductorDraft();
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  private get definition() {
    return resolveQuestionnaireDefinition(
      this.instrumentId,
      this.customDefinition ?? undefined,
    )!;
  }

  private get availableDefinitions() {
    return this.customDefinition
      ? [...builtInQuestionnaires, this.customDefinition]
      : builtInQuestionnaires;
  }

  private get wizardSteps() {
    return this.setupRoute === 'imported'
      ? importedConductorSteps
      : readyMadeConductorSteps;
  }

  private get wizardStep() {
    return this.wizardSteps[Math.min(this.wizardStepIndex, this.wizardSteps.length - 1)];
  }

  private selectSetupRoute(route: ConductorSetupRoute) {
    if (this.setupRoute === route) return;
    this.setupRoute = route;
    this.wizardStepIndex = 0;
    this.errorMessage = '';
    this.scoringConfirmed = false;
    this.importWarningsAcknowledged = false;
    this.generatedConfig = null;
    this.participantUrl = '';
    this.replaceWizardHistory();
  }

  private replaceWizardHistory() {
    window.history.replaceState(
      { ...(window.history.state ?? {}), aqpConductorStep: this.wizardStepIndex },
      '',
      window.location.href,
    );
  }

  private handleWizardPopState = (event: PopStateEvent) => {
    const candidate = Number((event.state as { aqpConductorStep?: unknown } | null)?.aqpConductorStep);
    if (!Number.isInteger(candidate) || candidate < 0 || candidate >= this.wizardSteps.length) return;
    this.wizardStepIndex = candidate;
    this.errorMessage = '';
    this.focusWizardHeading();
  };

  private focusWizardHeading() {
    void this.updateComplete.then(() => {
      const heading = this.querySelector<HTMLElement>('#conductor-step-heading');
      if (heading) focusAndReveal(heading, { block: 'start' });
    });
  }

  private persistConductorDraft() {
    try {
      window.sessionStorage.setItem(CONDUCTOR_DRAFT_KEY, JSON.stringify({
        setupRoute: this.setupRoute,
        wizardStepIndex: this.wizardStepIndex,
        scoringConfirmed: this.scoringConfirmed,
        importWarningsAcknowledged: this.importWarningsAcknowledged,
        instrumentId: this.instrumentId,
        customDefinition: this.customDefinition,
        customDraft: this.customDraft,
        platformImportSource: this.platformImportSource,
        platformImportReview: this.platformImportReview,
        platformImportConfirmed: this.platformImportConfirmed,
        platformImportSelectedGroupId: this.platformImportSelectedGroupId,
        platformImportSelectedRatingSetId: this.platformImportSelectedRatingSetId,
        studyId: this.studyId,
        studyTitle: this.studyTitle,
        taskLabel: this.taskLabel,
        participantCode: this.participantCode,
        showScoreToParticipant: this.showScoreToParticipant,
        showSimpleLanguage: this.showSimpleLanguage,
        answerMode: this.answerMode,
        largeText: this.largeText,
        audioGuidance: this.audioGuidance,
        recoveryEnabled: this.recoveryEnabled,
        participantAdjustmentPolicy: this.participantAdjustmentPolicy,
        voiceInputAvailable: this.voiceInputAvailable,
        gazeInputAvailable: this.gazeInputAvailable,
        collectionMode: this.collectionMode,
        qualtricsSurveyUrl: this.qualtricsSurveyUrl,
        generatedConfig: this.generatedConfig,
      }));
    } catch {
      // The setup remains usable when private browsing or a storage quota blocks draft recovery.
    }
  }

  private restoreConductorDraft() {
    try {
      const raw = window.sessionStorage.getItem(CONDUCTOR_DRAFT_KEY);
      if (!raw) {
        this.draftRestored = true;
        return;
      }
      const saved = JSON.parse(raw) as Record<string, unknown>;
      const route = saved.setupRoute === 'imported' ? 'imported' : 'ready-made';
      this.setupRoute = route;
      const steps = route === 'imported' ? importedConductorSteps : readyMadeConductorSteps;
      const savedStep = Number(saved.wizardStepIndex);
      this.wizardStepIndex = Number.isInteger(savedStep) && savedStep >= 0 && savedStep < steps.length
        ? savedStep
        : 0;
      this.scoringConfirmed = saved.scoringConfirmed === true;
      this.importWarningsAcknowledged = saved.importWarningsAcknowledged === true;
      if (typeof saved.instrumentId === 'string') this.instrumentId = saved.instrumentId;
      if (saved.customDefinition && typeof saved.customDefinition === 'object') {
        this.customDefinition = saved.customDefinition as QuestionnaireDefinition;
      }
      if (saved.customDraft && typeof saved.customDraft === 'object') {
        this.customDraft = saved.customDraft as CustomQuestionnaireDraft;
      }
      if (typeof saved.platformImportSource === 'string') {
        this.platformImportSource = saved.platformImportSource as QuestionnaireImportSourceSelection;
      }
      if (saved.platformImportReview && typeof saved.platformImportReview === 'object') {
        this.platformImportReview = saved.platformImportReview as QuestionnaireImportReview;
      }
      this.platformImportConfirmed = saved.platformImportConfirmed === true;
      if (typeof saved.platformImportSelectedGroupId === 'string') {
        this.platformImportSelectedGroupId = saved.platformImportSelectedGroupId;
      }
      if (typeof saved.platformImportSelectedRatingSetId === 'string') {
        this.platformImportSelectedRatingSetId = saved.platformImportSelectedRatingSetId;
      }
      if (typeof saved.studyId === 'string') this.studyId = saved.studyId;
      if (typeof saved.studyTitle === 'string') this.studyTitle = saved.studyTitle;
      if (typeof saved.taskLabel === 'string') this.taskLabel = saved.taskLabel;
      if (typeof saved.participantCode === 'string' && validParticipantCode(saved.participantCode)) {
        this.participantCode = saved.participantCode;
      }
      this.showScoreToParticipant = saved.showScoreToParticipant === true;
      this.showSimpleLanguage = saved.showSimpleLanguage === true;
      this.answerMode = saved.answerMode === 'smiley' ? 'smiley' : 'standard';
      this.largeText = saved.largeText === true;
      this.audioGuidance = saved.audioGuidance === true;
      this.recoveryEnabled = saved.recoveryEnabled !== false;
      if (
        saved.participantAdjustmentPolicy === 'locked' ||
        saved.participantAdjustmentPolicy === 'presentation-only' ||
        saved.participantAdjustmentPolicy === 'participant-choice'
      ) {
        this.participantAdjustmentPolicy = saved.participantAdjustmentPolicy;
      }
      this.voiceInputAvailable = saved.voiceInputAvailable !== false;
      this.gazeInputAvailable = saved.gazeInputAvailable === true;
      this.collectionMode = saved.collectionMode === 'qualtrics' ? 'qualtrics' : 'local';
      if (typeof saved.qualtricsSurveyUrl === 'string') this.qualtricsSurveyUrl = saved.qualtricsSurveyUrl;
      const restoredConfig = saved.generatedConfig
        ? normaliseStudyConfig(saved.generatedConfig)
        : null;
      if (restoredConfig) this.useConfiguration(restoredConfig);
      if (
        route === 'imported' &&
        (
          this.platformImportReview?.requiresGroupSelection ||
          this.platformImportReview?.requiresRatingSetSelection
        ) &&
        !this.platformImportContents
      ) {
        this.wizardStepIndex = 1;
        this.platformImportReview = null;
        this.platformImportSelectedGroupId = '';
        this.platformImportSelectedRatingSetId = '';
        this.message = 'Select the source file again to continue choosing its LimeSurvey group or rating set.';
      }
    } catch {
      window.sessionStorage.removeItem(CONDUCTOR_DRAFT_KEY);
    } finally {
      this.draftRestored = true;
    }
  }

  private validateStudyDetails() {
    createStudyConfig({
      instrumentId: this.instrumentId,
      ...(this.customDefinition?.id === this.instrumentId
        ? { questionnaireDefinition: this.customDefinition }
        : {}),
      studyId: this.studyId,
      studyTitle: this.studyTitle,
      taskLabel: this.taskLabel,
      showScoreToParticipant: this.showScoreToParticipant,
      support: this.currentSupportConfig(),
      collection: { mode: 'local' },
    });
  }

  private continueWizard = () => {
    this.errorMessage = '';
    const key = this.wizardStep.key;
    try {
      if (key === 'upload') {
        const review = this.platformImportReview;
        if (!review) throw new Error('Choose and review a questionnaire export before continuing.');
        if (review.requiresGroupSelection) throw new Error('Choose the LimeSurvey questionnaire group before continuing.');
        if (review.requiresRatingSetSelection) throw new Error('Choose the compatible LimeSurvey rating set before continuing.');
        if (!review.canConvert || !review.draft) {
          throw new Error('This export contains unsupported content. Correct the source and review a new export before continuing.');
        }
      }
      if (key === 'warnings' && !this.importWarningsAcknowledged) {
        throw new Error('Acknowledge the listed import findings before continuing.');
      }
      if (key === 'scoring') {
        if (this.setupRoute === 'imported') {
          if (!this.platformImportConfirmed) {
            throw new Error('Confirm the scoring rule and imported values against the source before continuing.');
          }
          this.usePlatformImport();
          if (this.customDefinition?.id !== this.instrumentId) {
            throw new Error('The reviewed questionnaire could not be activated. Check the scoring fields and try again.');
          }
        } else if (!this.scoringConfirmed) {
          throw new Error('Confirm that the selected questionnaire and scoring rule match the study protocol.');
        }
      }
      if (key === 'study') this.validateStudyDetails();
      if (key === 'collection') this.currentCollectionConfig();
      const next = Math.min(this.wizardStepIndex + 1, this.wizardSteps.length - 1);
      if (next === this.wizardStepIndex) return;
      this.wizardStepIndex = next;
      window.history.pushState(
        { ...(window.history.state ?? {}), aqpConductorStep: next },
        '',
        window.location.href,
      );
      this.message = `Step ${next + 1} of ${this.wizardSteps.length}: ${this.wizardSteps[next].title}.`;
      this.focusWizardHeading();
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'This step is incomplete.');
    }
  };

  private previousWizard = () => {
    if (this.wizardStepIndex === 0) return;
    const previous = this.wizardStepIndex - 1;
    this.wizardStepIndex = previous;
    window.history.pushState(
      { ...(window.history.state ?? {}), aqpConductorStep: previous },
      '',
      window.location.href,
    );
    this.errorMessage = '';
    this.message = `Step ${previous + 1} of ${this.wizardSteps.length}: ${this.wizardSteps[previous].title}.`;
    this.focusWizardHeading();
  };

  private selectInstrument = (event: Event) => {
    const instrumentId = (event.currentTarget as HTMLSelectElement).value;
    const definition =
      this.availableDefinitions.find((candidate) => candidate.id === instrumentId) ??
      null;
    if (!definition) return;
    this.instrumentId = instrumentId;
    if (!definition.supports.simplerExplanations) this.showSimpleLanguage = false;
    if (!definition.supports.smileyLandmarks) this.answerMode = 'standard';
    this.scoringConfirmed = false;
    this.generatedConfig = null;
    this.participantUrl = '';
    this.definitionConfirmation =
      `${definition.name} ${definition.version} selected. ` +
      'Complete the study details, then generate a new configuration.';
    this.configurationConfirmation = '';
    this.message = `${definition.name} selected. Generate a new configuration before testing.`;
  };

  protected render() {
    return html`
      <a class="skip-link" href="#conductor-main">Skip to study setup</a>
      <main class="app-shell conductor-shell" id="conductor-main">
        <header class="app-header">
          <p class="eyebrow">
            Study conductor · Version ${PROTOTYPE_VERSION} · Qualtrics package ${qualtricsBridgeBuild}
          </p>
          <h1>Prepare an accessible questionnaire study</h1>
          <p class="subtitle">Create one configuration, give participants a prepared link, and export completed records.</p>
        </header>

        <aside class="boundary-note important-boundary" aria-labelledby="current-generator-heading">
          <h2 id="current-generator-heading">Current Qualtrics generator: ${qualtricsBridgeBuild}</h2>
          <p>
            Every generated JavaScript block must contain
            <code>var bridgeBuild = '${qualtricsBridgeBuild}';</code>. If it shows another value, that browser tab is
            running a stale conductor build. Close that tab and reopen the versioned
            <a href="study.html?package=${qualtricsBridgeBuild}">Prepare a study page</a> before copying anything.
          </p>
        </aside>

        <aside class="boundary-note important-boundary">
          <h2>What this page does</h2>
          <p>
            This separates study setup from participant answering. Participants receive a configured questionnaire and do not
            have to set it up themselves. This researcher page generates a separate participant page. Measurement-adjacent
            support starts from the study configuration. The conductor can keep it fixed or allow documented participant
            preferences without making initial configuration a participant task.
          </p>
          <p>
            <strong>Collection boundary:</strong> local mode stays in this browser. Qualtrics mode sends a completed,
            pseudonymous record to the exact approved Qualtrics survey origin through the documented bridge. It places no
            account token in the participant page.
          </p>
        </aside>

        ${this.errorMessage
          ? html`<div class="error-summary" role="alert" tabindex="-1" id="conductor-error">
              <h2>There is a problem</h2><p>${this.errorMessage}</p>
            </div>`
          : nothing}
        <p class="sr-only" aria-live="polite">${this.message}</p>

        <div class="progress-card conductor-progress">
          <p class="step-label">Step ${this.wizardStepIndex + 1} of ${this.wizardSteps.length}</p>
          <progress max=${this.wizardSteps.length} value=${this.wizardStepIndex + 1}>
            ${this.wizardStepIndex + 1} of ${this.wizardSteps.length}
          </progress>
          <h2 id="conductor-step-heading" tabindex="-1">${this.wizardStep.title}</h2>
          <p>Complete this task, then use Continue. Your draft is kept in this browser tab if the page reloads.</p>
        </div>

        <section
          class="panel conductor-panel"
          aria-labelledby="study-details-heading"
          ?hidden=${this.wizardStep.key !== 'source' && this.wizardStep.key !== 'study'}
        >
          <h2 id="study-details-heading">
            ${this.wizardStep.key === 'source' ? 'Choose the questionnaire source' : 'Enter study details'}
          </h2>
          ${this.wizardStep.key === 'source'
            ? html`
                <fieldset class="answer-mode-control conductor-answer-mode source-route-control">
                  <legend>How will you provide the questionnaire?</legend>
                  <label>
                    <input
                      type="radio"
                      name="questionnaire-source-route"
                      value="ready-made"
                      .checked=${this.setupRoute === 'ready-made'}
                      @change=${() => this.selectSetupRoute('ready-made')}
                    />
                    <span>
                      <strong>Use a ready-made or saved AQP questionnaire</strong>
                      <small>Six short steps. You can select a built-in questionnaire or add a reviewed AQP definition.</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="questionnaire-source-route"
                      value="imported"
                      .checked=${this.setupRoute === 'imported'}
                      @change=${() => this.selectSetupRoute('imported')}
                    />
                    <span>
                      <strong>Import a Qualtrics or LimeSurvey export</strong>
                      <small>Ten short steps separate file selection, questions, values, warnings and scoring.</small>
                    </span>
                  </label>
                </fieldset>
                ${this.setupRoute === 'imported'
                  ? html`<p class="support-boundary">
                      Continue to choose a QSF, LSS, LSG or LSQ file. The original file is read only in this browser.
                    </p>`
                  : nothing}
                <p class="support-boundary">
                  Participant identity is kept separate from study setup. Give each participant a
                  pseudonymous code such as <strong>P-001</strong>. The generated participant-specific link fills it in;
                  the participant may correct it if needed.
                </p>
              `
            : html`<p class="support-boundary">
                These fields identify the questionnaire configuration, not the participant. Give each participant a separate
                pseudonymous code such as P-001. The generated participant-specific link fills it in;
                the participant may correct it if needed.
              </p>`}
          <div class="form-grid" ?hidden=${this.wizardStep.key !== 'source' || this.setupRoute !== 'ready-made'}>
            <label class="full-width">
              <strong>Questionnaire definition</strong>
              <span>
                Choose a versioned definition. Item wording, scale, workflow and scoring are loaded from that
                definition; accessibility supports are configured separately.
              </span>
              <select @change=${this.selectInstrument}>
                ${this.availableDefinitions.map(
                  (definition) => html`<option
                    value=${definition.id}
                    .selected=${definition.id === this.instrumentId}
                  >
                    ${definition.name} · ${definition.version}${getQuestionnaireDefinition(definition.id)
                      ? ''
                      : ' · researcher supplied'}
                  </option>`,
                )}
              </select>
            </label>
            <aside
              class=${`definition-summary full-width${this.definitionConfirmation
                ? ' success-confirmation'
                : ''}`}
              id="selected-questionnaire-summary"
              tabindex="-1"
              aria-describedby=${this.definitionConfirmation
                ? 'definition-confirmation-message'
                : nothing}
            >
              ${this.definitionConfirmation
                  ? html`<p
                    class="success-message"
                    id="definition-confirmation-message"
                  >
                    <span class="success-icon" aria-hidden="true">✓</span>
                    <span><strong>Questionnaire ready.</strong> ${this.definitionConfirmation}</span>
                  </p>`
                : nothing}
              <strong>${this.definition.shortName}</strong>
              <span>
                ${this.definition.items.length} items,
                ${buildRatingValues(this.definition).length}
                ${this.definition.scale.type.replace('-', ' ')} response values,
                ${buildQuestionnairePairs(this.definition).length} comparisons,
                ${this.definition.scoring.scoreName}.
              </span>
              <span>
                Questionnaire language: <code>${this.definition.language}</code>.
                Voice input uses English recognition. Every supported questionnaire accepts a shown
                number spoken in English. English questionnaires also accept one complete exact visible
                English answer label. Non-English answer-label recognition is outside this prototype's
                tested boundary. Visible answer buttons remain available.
              </span>
              ${this.definition.source.url
                ? html`<a href=${this.definition.source.url} target="_blank" rel="noopener">
                    Instrument source: ${this.definition.source.label}
                  </a>`
                : html`<span>Instrument source: ${this.definition.source.label}</span>`}
            </aside>
            <div class="full-width button-row compact">
              <button
                class="secondary-button"
                type="button"
                aria-expanded=${String(this.customBuilderOpen)}
                aria-controls="custom-questionnaire-builder"
                @click=${() => { this.customBuilderOpen = !this.customBuilderOpen; }}
              >
                ${this.customBuilderOpen ? 'Close custom questionnaire builder' : 'Add your own questionnaire'}
              </button>
              ${this.customDefinition
                ? html`
                    <button
                      class="secondary-button"
                      type="button"
                      @click=${this.downloadCustomDefinition}
                    >
                      Download current questionnaire definition
                    </button>
                  `
                : nothing}
            </div>
            ${this.customBuilderOpen ? this.renderCustomQuestionnaireBuilder(false) : nothing}
          </div>
          <div class="form-grid" ?hidden=${this.wizardStep.key !== 'study'}>
            <label>
              <strong>Study ID</strong>
              <span>Internal label shared by records from one study or condition. Example: ACCESS-TECH-01. Do not use a participant name.</span>
              <input placeholder="ACCESS-TECH-01" autocomplete="off" spellcheck="false" .value=${this.studyId} maxlength="64" @input=${(event: Event) => { this.studyId = (event.currentTarget as HTMLInputElement).value; }} />
            </label>
            <label>
              <strong>Study title</strong>
              <span>Participant-facing name of the study. Example: Route-planning interface study.</span>
              <input placeholder="Route-planning interface study" autocomplete="off" .value=${this.studyTitle} maxlength="120" @input=${(event: Event) => { this.studyTitle = (event.currentTarget as HTMLInputElement).value; }} />
            </label>
            <label class="full-width">
              <strong>Task label</strong>
              <span>Exact activity the participant has just completed and must rate. Example: planning a route from A to B using the prototype.</span>
              <input placeholder="planning a route from A to B using the prototype" autocomplete="off" .value=${this.taskLabel} maxlength="160" @input=${(event: Event) => { this.taskLabel = (event.currentTarget as HTMLInputElement).value; }} />
            </label>
          </div>
        </section>

        ${this.renderQuestionnaireReviewStep()}

        <section
          class="panel conductor-panel"
          aria-labelledby="support-config-heading"
          ?hidden=${this.wizardStep.key !== 'support'}
        >
          <h2 id="support-config-heading">Set participant support</h2>
          <p>
            These are starting settings. The selected definition keeps its declared items, values,
            workflow and allowlisted scoring rule unchanged.
          </p>
          <div class="config-grid">
            ${this.definition.supports.simplerExplanations
              ? this.booleanOption('Show simpler explanations from the start', this.showSimpleLanguage, (value) => { this.showSimpleLanguage = value; })
              : html`<aside class="boundary-note">
                  <strong>No alternate item wording is included for ${this.definition.shortName}</strong>
                  <p>
                    Built-in instruments keep their sourced item text. Controls and instructions use plain language,
                    but AQP does not present an author-written paraphrase as an equivalent standard item.
                    If your protocol approves supplemental explanations, import a custom definition containing them;
                    its distinct definition hash and any use of the support will be recorded.
                  </p>
                </aside>`}
            ${this.booleanOption('Use large text from the start', this.largeText, (value) => { this.largeText = value; })}
            ${this.booleanOption('Use automatic spoken guidance from the start', this.audioGuidance, (value) => { this.audioGuidance = value; })}
            ${this.booleanOption('Save incomplete progress on this device', this.recoveryEnabled, (value) => { this.recoveryEnabled = value; })}
            ${this.booleanOption('Allow confirmed built-in voice answers', this.voiceInputAvailable, (value) => { this.voiceInputAvailable = value; })}
            ${this.booleanOption('Allow experimental webcam gaze input', this.gazeInputAvailable, (value) => { this.gazeInputAvailable = value; }, 'Default off because current gaze accuracy is recorded as Partial.')}
            ${this.booleanOption(`Show the ${this.definition.scoring.scoreName.toLowerCase()} to the participant`, this.showScoreToParticipant, (value) => { this.showScoreToParticipant = value; }, 'Default off for a study; the conductor receives the score in the export.')}
          </div>

          <fieldset class="answer-mode-control conductor-answer-mode">
            <legend>Participant personalisation policy</legend>
            <label>
              <input
                type="radio"
                name="participant-adjustment-policy"
                value="locked"
                .checked=${this.participantAdjustmentPolicy === 'locked'}
                @change=${() => { this.participantAdjustmentPolicy = 'locked'; }}
              />
              <span>
                <strong>Prepared settings only</strong>
                <small>Use for a controlled measurement condition. The participant can still use any permitted answer route.</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="participant-adjustment-policy"
                value="presentation-only"
                .checked=${this.participantAdjustmentPolicy === 'presentation-only'}
                @change=${() => { this.participantAdjustmentPolicy = 'presentation-only'; }}
              />
              <span>
                <strong>Allow display, audio and recovery preferences</strong>
                <small>
                  The participant may change text size, automatic spoken guidance and interruption recovery. Simpler
                  explanations and the standard/smiley answer presentation remain fixed.
                </small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="participant-adjustment-policy"
                value="participant-choice"
                .checked=${this.participantAdjustmentPolicy === 'participant-choice'}
                @change=${() => { this.participantAdjustmentPolicy = 'participant-choice'; }}
              />
              <span>
                <strong>Prepared defaults with optional participant choice</strong>
                <small>
                  Recommended for evaluating the accessibility support. Nothing must be configured before starting; the
                  participant may change applicable optional support, and every change is exported separately from the scored answers.
                </small>
              </span>
            </label>
          </fieldset>

          ${this.definition.supports.smileyLandmarks
            ? html`<fieldset class="answer-mode-control conductor-answer-mode">
                <legend>Starting rating presentation</legend>
                <label>
                  <input type="radio" name="conductor-answer-mode" value="standard" .checked=${this.answerMode === 'standard'} @change=${() => { this.answerMode = 'standard'; }} />
                  <span>
                    <strong>Standard ${buildRatingValues(this.definition).length}-value scale</strong>
                    <small>Recommended default.</small>
                  </span>
                </label>
                <label>
                  <input type="radio" name="conductor-answer-mode" value="smiley" .checked=${this.answerMode === 'smiley'} @change=${() => { this.answerMode = 'smiley'; }} />
                  <span><strong>Experimental smiley landmarks</strong><small>Use only when this presentation is part of the approved protocol.</small></span>
                </label>
              </fieldset>`
            : html`<p class="support-boundary">
                ${this.definition.shortName} uses its standard ${buildRatingValues(this.definition).length}-value
                response scale. Smiley landmarks are disabled because this definition does not declare validated
                landmark meanings; adding faces could change the meaning of its response scale.
              </p>`}
        </section>

        <section
          class="panel conductor-panel"
          aria-labelledby="collection-heading"
          ?hidden=${this.wizardStep.key !== 'collection'}
        >
          <h2 id="collection-heading">Choose where completed results are collected</h2>
          <fieldset class="answer-mode-control conductor-answer-mode">
            <legend>Result collection route</legend>
            <label>
              <input
                type="radio"
                name="collection-mode"
                value="local"
                .checked=${this.collectionMode === 'local'}
                @change=${() => { this.collectionMode = 'local'; }}
              />
              <span>
                <strong>This browser only</strong>
                <small>Use for development and supervised same-device testing. It does not collect results across devices.</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="collection-mode"
                value="qualtrics"
                .checked=${this.collectionMode === 'qualtrics'}
                @change=${() => { this.collectionMode = 'qualtrics'; }}
              />
              <span>
                <strong>UCL Qualtrics central collection</strong>
                <small>Recommended for an approved remote study that does not collect highly confidential data.</small>
              </span>
            </label>
          </fieldset>
          ${this.collectionMode === 'qualtrics'
            ? html`<label class="full-width">
                <strong>Qualtrics survey or preview URL</strong>
                <span>
                  Paste the HTTPS URL opened by your UCL Qualtrics survey. Only its exact origin is stored in the
                  questionnaire configuration; the survey identifier is not exposed in the result record.
                </span>
                <input
                  placeholder="https://your-ucl-brand.eu.qualtrics.com/jfe/form/SV_..."
                  autocomplete="off"
                  spellcheck="false"
                  .value=${this.qualtricsSurveyUrl}
                  @input=${(event: Event) => { this.qualtricsSurveyUrl = (event.currentTarget as HTMLInputElement).value; }}
                />
              </label>
              <p class="support-boundary">
                Participants must receive the Qualtrics distribution link, not the embedded GitHub page URL. Complete the
                one-question bridge setup and verify a synthetic record in Qualtrics Data &amp; Analysis before recruitment.
              </p>`
            : nothing}
        </section>

        <section
          class="panel conductor-panel"
          aria-labelledby="link-heading"
          ?hidden=${this.wizardStep.key !== 'review'}
        >
          <h2 id="link-heading">Review and generate the participant configuration</h2>
          ${this.renderConfigurationSummary()}
          <label class="participant-code-field" for="conductor-participant-code">
            <strong>Pseudonymous participant code for this link</strong>
            <span>
              Use the code from the approved participant list, not a name or email. The generated link fills it in;
              the participant may correct it if needed.
            </span>
            <input
              id="conductor-participant-code"
              type="text"
              maxlength="32"
              autocomplete="off"
              spellcheck="false"
              placeholder="P-001"
              .value=${this.participantCode}
              @input=${this.updateParticipantCode}
            />
          </label>
          <div class="button-row compact">
            <button class="primary-button large-answer-button" type="button" @click=${this.generateParticipantLink}>Generate link</button>
            <label class="file-button secondary-button">
              Import configuration JSON
              <input
                class="sr-only"
                data-configuration-import
                type="file"
                accept="application/json,.json"
                @change=${this.importConfiguration}
              />
            </label>
          </div>
          <p class="support-boundary">
            Import only the JSON downloaded from <strong>Configuration ready</strong>. Completed-result JSON is a different
            record type and is not imported here.
          </p>

          ${this.generatedConfig
            ? html`<div
                class=${`generated-link${this.configurationConfirmation
                  ? ' success-confirmation'
                  : ''}`}
                id="configuration-ready-panel"
                role="region"
                aria-labelledby="generated-link-heading"
                aria-describedby=${this.configurationConfirmation
                  ? 'configuration-confirmation-message'
                  : nothing}
                tabindex="-1"
              >
                ${this.configurationConfirmation
                  ? html`<p
                      class="success-message"
                      id="configuration-confirmation-message"
                    >
                      <span class="success-icon" aria-hidden="true">✓</span>
                      <span><strong>Success.</strong> ${this.configurationConfirmation}</span>
                    </p>`
                  : nothing}
                <h3 id="generated-link-heading">Configuration ready</h3>
                <dl class="study-details">
                  <div><dt>Questionnaire</dt><dd>${this.definition.name} · ${this.definition.version}</dd></div>
                  <div><dt>Study ID</dt><dd>${this.generatedConfig.studyId}</dd></div>
                  <div><dt>Configuration ID</dt><dd>${this.generatedConfig.configId}</dd></div>
                  <div><dt>Definition SHA-256</dt><dd class="aqp-long-value">${this.generatedConfig.definitionHash}</dd></div>
                  <div>
                    <dt>Participant code in this link</dt>
                    <dd>${validParticipantCode(this.participantCode) ? this.participantCode : 'Not set'}</dd>
                  </div>
                  <div><dt>Created</dt><dd>${this.generatedConfig.createdAt}</dd></div>
                </dl>
                ${validParticipantCode(this.participantCode) && this.participantUrl
                  ? html`
                      <label for="participant-link">
                        <strong>${this.generatedConfig.collection.mode === 'qualtrics'
                          ? 'Participant page URL for the Qualtrics iframe'
                          : 'Participant link'}</strong>
                      </label>
                      <textarea id="participant-link" readonly rows="5" .value=${this.participantUrl}></textarea>
                      <div class="button-row compact">
                        <button class="secondary-button" type="button" @click=${this.copyParticipantLink}>Copy link</button>
                        ${this.generatedConfig.collection.mode === 'local'
                          ? html`<a class="secondary-button link-button" href=${this.participantUrl} target="_blank" rel="noopener">Open participant page</a>`
                          : nothing}
                        <button class="secondary-button" type="button" @click=${this.downloadConfiguration}>Download configuration JSON</button>
                      </div>
                      ${this.generatedConfig.collection.mode === 'qualtrics'
                        ? this.renderQualtricsSetup()
                        : nothing}
                    `
                  : html`
                      <p class="field-error" role="status">
                        Enter the approved pseudonymous participant code above. No participant link is available until the code is valid.
                      </p>
                      <div class="button-row compact">
                        <button class="secondary-button" type="button" @click=${this.downloadConfiguration}>Download configuration JSON</button>
                      </div>
                    `}
                <p class="support-boundary">
                  Save the JSON with the study protocol. It preserves the configuration ID and definition hash. After importing it,
                  enter the approved pseudonymous code to regenerate a participant-specific link. The link contains no name, email or answer.
                </p>
              </div>`
            : nothing}
        </section>

        <section
          class="panel conductor-panel"
          aria-labelledby="results-heading"
          ?hidden=${this.wizardStep.key !== 'review'}
        >
          <h2 id="results-heading">Results saved on this device</h2>
          <p><strong>${this.completedResults.length}</strong> completed record${this.completedResults.length === 1 ? '' : 's'} found in this browser.</p>
          ${this.completedResults.length
            ? html`
                <div class="table-scroll">
                  <table>
                    <thead><tr><th>Study ID</th><th>Instrument</th><th>Participant code</th><th>Completed</th><th>Primary score</th></tr></thead>
                    <tbody>
                      ${this.completedResults.map((record) => html`<tr>
                        <td>${record.study.studyId}</td>
                        <td>${record.instrument.name}</td>
                        <td>${record.participantCode}</td>
                        <td>${record.timing.completedAt}</td>
                        <td>${record.result.scoreName}: ${record.result.primaryScore.toFixed(2)}</td>
                      </tr>`)}
                    </tbody>
                  </table>
                </div>
                <div class="button-row compact">
                  <button class="primary-button" type="button" @click=${this.exportResultsCsv}>Export all as CSV</button>
                  <button class="secondary-button" type="button" @click=${this.exportResultsJson}>Export all as JSON</button>
                  <button class="danger-button" type="button" @click=${this.eraseResults}>Erase local results</button>
                </div>
                <p class="support-boundary">
                  Verify the exported files and move them through the approved data-management route before erasing the browser copy.
                </p>
              `
            : html`<p>After a configured questionnaire is completed in this same browser, its pseudonymous record will appear here.</p>`}
        </section>

        <section
          class="panel conductor-panel"
          aria-labelledby="remote-heading"
          ?hidden=${this.wizardStep.key !== 'collection'}
        >
          <h2 id="remote-heading">Remote-study boundary</h2>
          <p>
            <strong>Central collection is not configured on this GitHub Pages deployment.</strong> A participant using another
            device will otherwise keep the result in that device's browser. Do not make the participant download and email data
            as the normal study procedure.
          </p>
          <p>
            Version ${PROTOTYPE_VERSION} includes a Qualtrics parent bridge. The participant page sends a complete record only to the
            exact HTTPS origin stored by the conductor; Qualtrics writes the fields into the current response and returns a
            matching receipt before advancing. A failed save leaves the answers on Review for retry. Platform selection,
            consent, retention and access must still match the project's existing approved protocol and data-management documents.
          </p>
        </section>

        ${this.renderWizardNavigation()}
      </main>
    `;
  }

  private renderQuestionnaireReviewStep() {
    const key = this.wizardStep.key;
    if (!['upload', 'questions', 'answers', 'warnings', 'scoring'].includes(key)) {
      return nothing;
    }
    if (key === 'scoring' && this.setupRoute === 'ready-made') {
      return html`
        <section class="panel conductor-panel" aria-labelledby="questionnaire-scoring-heading">
          <h2 id="questionnaire-scoring-heading">Confirm the questionnaire and scoring</h2>
          <dl class="study-details">
            <div><dt>Questionnaire</dt><dd>${this.definition.name} · ${this.definition.version}</dd></div>
            <div><dt>Items</dt><dd>${this.definition.items.length}</dd></div>
            <div><dt>Response values</dt><dd>${buildRatingValues(this.definition).join(', ')}</dd></div>
            <div><dt>Scoring rule</dt><dd>${this.definition.scoring.strategy}</dd></div>
            <div><dt>Reported result</dt><dd>${this.definition.scoring.scoreName}</dd></div>
            <div><dt>Source</dt><dd>${this.definition.source.label}</dd></div>
          </dl>
          <label class="platform-import-final-confirmation">
            <input
              type="checkbox"
              .checked=${this.scoringConfirmed}
              @change=${(event: Event) => {
                this.scoringConfirmed = (event.currentTarget as HTMLInputElement).checked;
              }}
            />
            <span>
              I checked that this questionnaire version, response scale and scoring rule match the study protocol.
            </span>
          </label>
        </section>
      `;
    }

    const review = this.platformImportReview;
    if (key === 'upload') {
      return html`
        <section class="panel conductor-panel" aria-labelledby="questionnaire-upload-heading">
          <h2 id="questionnaire-upload-heading">Upload the file and choose the relevant part</h2>
          ${this.renderPlatformQuestionnaireImport(false)}
          ${review && !review.requiresGroupSelection && !review.requiresRatingSetSelection
            ? html`<aside class=${`definition-summary${review.canConvert ? ' success-confirmation' : ''}`}>
                <strong>${review.canConvert ? 'File review ready' : 'This file cannot be converted'}</strong>
                <span>${review.title} · ${review.sourceName} · ${review.fileName}</span>
                <span>
                  ${review.draft?.items.length ?? 0} compatible item${review.draft?.items.length === 1 ? '' : 's'};
                  ${review.unsupported.length} blocking finding${review.unsupported.length === 1 ? '' : 's'}.
                </span>
              </aside>`
            : nothing}
        </section>
      `;
    }

    if (!review?.draft) {
      return html`<section class="panel conductor-panel">
        <h2>${this.wizardStep.title}</h2>
        <p>Return to the upload step and review a supported questionnaire export.</p>
      </section>`;
    }

    if (key === 'questions') {
      return html`
        <section class="panel conductor-panel" aria-labelledby="import-question-review-heading">
          <h2 id="import-question-review-heading">Review the questions</h2>
          <p>Compare every item, its order and its wording with the untouched source preview.</p>
          <ol class="wizard-review-list">
            ${this.customDraft.items.map((item) => html`<li>
              <strong>${item.name || 'Unnamed item'}</strong>
              <span>${item.prompt || 'No question text was found.'}</span>
              <small>Source key: ${item.key} · required single answer</small>
            </li>`)}
          </ol>
        </section>
      `;
    }

    if (key === 'answers') {
      const values: number[] = [];
      for (let value = this.customDraft.minimum; value <= this.customDraft.maximum; value += this.customDraft.step) {
        values.push(value);
      }
      return html`
        <section class="panel conductor-panel" aria-labelledby="import-answer-review-heading">
          <h2 id="import-answer-review-heading">Review answer choices and stored values</h2>
          <dl class="study-details">
            <div><dt>Scale type</dt><dd>${this.customDraft.scaleType.replace('-', ' ')}</dd></div>
            <div><dt>Stored values</dt><dd>${values.join(', ')}</dd></div>
            <div><dt>Direction</dt><dd>${this.customDraft.minimum} to ${this.customDraft.maximum}</dd></div>
          </dl>
          <ol class="wizard-review-list compact-review-list">
            ${this.customDraft.items.map((item) => html`<li>
              <strong>${item.name}</strong>
              <span>${item.lowAnchor} (${this.customDraft.minimum}) → ${item.highAnchor} (${this.customDraft.maximum})</span>
              ${item.responseLabels
                ? html`<small>Visible labels: ${Object.entries(item.responseLabels).map(([value, label]) => `${value} = ${label}`).join('; ')}</small>`
                : html`<small>Intermediate positions use their stored number.</small>`}
            </li>`)}
          </ol>
        </section>
      `;
    }

    if (key === 'warnings') {
      return html`
        <section class="panel conductor-panel" aria-labelledby="import-warning-heading">
          <h2 id="import-warning-heading">Resolve import warnings</h2>
          <p>Blocking content must be corrected in the source. Other transformations must be understood before scoring is confirmed.</p>
          <div class="platform-import-findings">
            ${this.renderImportFindingList('Imported safely', 'import-safe', review.imported, 'No safe import findings were recorded.')}
            ${this.renderImportFindingList('Requires confirmation', 'import-confirm', review.confirmations, 'No extra confirmation finding was recorded.')}
            ${this.renderImportFindingList('Unsupported content', 'import-unsupported', review.unsupported, 'No unsupported content was found.')}
          </div>
          <label class="platform-import-final-confirmation">
            <input
              data-platform-import-warnings-confirm
              type="checkbox"
              .checked=${this.importWarningsAcknowledged}
              @change=${(event: Event) => {
                this.importWarningsAcknowledged = (event.currentTarget as HTMLInputElement).checked;
              }}
            />
            <span>I read the findings and understand what the platform keeps, changes and does not support.</span>
          </label>
        </section>
      `;
    }

    return html`
      <section class="panel conductor-panel" aria-labelledby="import-scoring-heading">
        <h2 id="import-scoring-heading">Confirm the scoring rule</h2>
        <p>The export may not encode the intended scoring rule. Check these fields against the instrument source or study protocol.</p>
        <div class="form-grid">
          <label>
            <strong>Questionnaire language</strong>
            <span>BCP 47 language tag for the questionnaire text.</span>
            <input
              data-platform-import-language
              maxlength="35"
              spellcheck="false"
              .value=${this.customDraft.language}
              @input=${(event: Event) => this.updateCustomDraft('language', (event.currentTarget as HTMLInputElement).value)}
            />
          </label>
          <label>
            <strong>Scale description</strong>
            <select
              data-platform-import-scale-type
              .value=${this.customDraft.scaleType}
              @change=${(event: Event) => this.updateCustomDraft(
                'scaleType',
                (event.currentTarget as HTMLSelectElement).value as CustomQuestionnaireDraft['scaleType'],
              )}
            >
              <option value="agreement">Agreement</option>
              <option value="magnitude">Magnitude</option>
              <option value="semantic-differential">Semantic differential</option>
            </select>
          </label>
          <label>
            <strong>Score calculation</strong>
            <select
              data-platform-import-aggregation
              .value=${this.customDraft.aggregation}
              @change=${(event: Event) => this.updateCustomDraft(
                'aggregation',
                (event.currentTarget as HTMLSelectElement).value as CustomQuestionnaireDraft['aggregation'],
              )}
            >
              <option value="mean">Mean of reviewed item values</option>
              <option value="sum">Sum of reviewed item values</option>
            </select>
          </label>
          <label>
            <strong>Score name</strong>
            <input
              data-platform-import-score-name
              maxlength="120"
              .value=${this.customDraft.scoreName}
              @input=${(event: Event) => this.updateCustomDraft('scoreName', (event.currentTarget as HTMLInputElement).value)}
            />
          </label>
        </div>
        <fieldset class="platform-import-reverse-items">
          <legend>Reverse-scored items</legend>
          <p>Select an item only when the reviewed scoring instructions require it.</p>
          ${this.customDraft.items.map((item, index) => html`<label>
            <input
              data-platform-import-reverse=${index}
              type="checkbox"
              .checked=${item.reverseScored}
              @change=${(event: Event) => this.updateCustomItem(
                index,
                'reverseScored',
                (event.currentTarget as HTMLInputElement).checked,
              )}
            />
            <span>${index + 1}. ${item.name}: ${item.prompt}</span>
          </label>`)}
        </fieldset>
        <label class="platform-import-final-confirmation">
          <input
            data-platform-import-confirm
            type="checkbox"
            .checked=${this.platformImportConfirmed}
            @change=${(event: Event) => {
              this.platformImportConfirmed = (event.currentTarget as HTMLInputElement).checked;
            }}
          />
          <span>
            I checked the wording, order, labels, stored values, score calculation and reverse-scored items against the source.
          </span>
        </label>
      </section>
    `;
  }

  private renderImportFindingList(
    title: string,
    className: string,
    findings: QuestionnaireImportReview['imported'],
    emptyMessage: string,
  ) {
    return html`<section class=${`platform-import-finding ${className}`}>
      <h3>${title} (${findings.length})</h3>
      ${findings.length
        ? html`<ul>${findings.map((finding) => html`<li>
            <strong>${finding.title}</strong><span>${finding.detail}</span>
          </li>`)}</ul>`
        : html`<p>${emptyMessage}</p>`}
    </section>`;
  }

  private renderConfigurationSummary() {
    return html`
      <dl class="study-details configuration-review-summary">
        <div><dt>Questionnaire</dt><dd>${this.definition.name} · ${this.definition.version}</dd></div>
        <div><dt>Study</dt><dd>${this.studyId} · ${this.studyTitle}</dd></div>
        <div><dt>Task</dt><dd>${this.taskLabel}</dd></div>
        <div><dt>Participant settings</dt><dd>${this.participantAdjustmentPolicy}; voice ${this.voiceInputAvailable ? 'available' : 'off'}; recovery ${this.recoveryEnabled ? 'on' : 'off'}</dd></div>
        <div><dt>Collection</dt><dd>${this.collectionMode === 'qualtrics' ? `Qualtrics: ${normaliseHttpsOrigin(this.qualtricsSurveyUrl) ?? 'invalid URL'}` : 'This browser only'}</dd></div>
      </dl>
      <p class="support-boundary">Check this summary before generating. The questionnaire definition and scoring rule cannot be edited by participants.</p>
    `;
  }

  private renderWizardNavigation() {
    const onFinalStep = this.wizardStep.key === 'review';
    const continueLabel = this.wizardStep.key === 'scoring' && this.setupRoute === 'imported'
      ? 'Convert and continue'
      : this.wizardStepIndex === this.wizardSteps.length - 2
        ? 'Continue to review'
        : 'Continue';
    return html`
      <nav class="wizard-navigation button-row" aria-label="Researcher setup steps">
        <button
          class="secondary-button large-answer-button"
          type="button"
          ?disabled=${this.wizardStepIndex === 0}
          @click=${this.previousWizard}
        >Back</button>
        ${onFinalStep
          ? html`<span class="support-boundary">This is the final setup step. Generate only after checking the summary.</span>`
          : html`<button
              class="primary-button large-answer-button"
              type="button"
              @click=${this.continueWizard}
            >${continueLabel}</button>`}
      </nav>
    `;
  }

  private renderCustomQuestionnaireBuilder(includePlatformImport = true) {
    return html`
      <section
        class="custom-questionnaire-builder full-width"
        id="custom-questionnaire-builder"
        aria-labelledby="custom-questionnaire-heading"
      >
        <h3 id="custom-questionnaire-heading">Add a researcher-supplied questionnaire</h3>
        <p>
          ${includePlatformImport ? 'Choose one of three routes. Import a source-platform export, reuse a definition' : 'Reuse a definition'}
          previously downloaded from this platform, or build a small questionnaire manually.
          These routes accept different file types and are not interchangeable.
        </p>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>Check permission and measurement validity before use.</strong>
            The platform validates structure and calculation, but it cannot decide whether a
            questionnaire is licensed, validated for the study population, or suitable for the
            research question. Free text, branching, multiple answers, custom formulas and
            executable code are deliberately not accepted.
          </p>
        </aside>

        ${includePlatformImport ? this.renderPlatformQuestionnaireImport() : nothing}

        <section
          class="questionnaire-add-route"
          aria-labelledby="aqp-definition-import-heading"
        >
          <h4 id="aqp-definition-import-heading">
            ${includePlatformImport ? '2.' : '1.'} Reuse an AQP questionnaire definition
          </h4>
          <p>
            Choose a <code>.json</code> definition previously downloaded from this
            Accessible Questionnaire Platform. This skips source-platform conversion,
            but the definition is validated again before it is selected.
          </p>
          <label class="file-import-control">
            <strong>AQP definition JSON</strong>
            <span>
              Use an AQP definition file here—not a Qualtrics <code>.qsf</code> or
              LimeSurvey <code>.lss</code>, <code>.lsg</code> or <code>.lsq</code> export.
            </span>
            <input
              data-custom-definition-import
              type="file"
              accept=".json,application/json"
              @change=${this.importCustomDefinition}
            />
          </label>
        </section>

        <section
          class="questionnaire-add-route"
          aria-labelledby="manual-questionnaire-builder-heading"
        >
          <h4 id="manual-questionnaire-builder-heading">
            ${includePlatformImport ? '3.' : '2.'} Build a questionnaire manually
          </h4>
          <p>
            No code is required. The manual builder supports
            1–${MAX_CUSTOM_QUESTIONNAIRE_ITEMS} required single-choice items that
            share one whole-number response scale. It can calculate a reviewed mean
            or sum, including selected reverse-scored items.
          </p>

          <div class="form-grid custom-definition-fields">
          <label>
            <strong>Questionnaire name</strong>
            <span>Full participant-facing name.</span>
            <input
              data-custom-field="name"
              maxlength="120"
              .value=${this.customDraft.name}
              @input=${(event: Event) =>
                this.updateCustomDraft('name', (event.currentTarget as HTMLInputElement).value)}
            />
          </label>
          <label>
            <strong>Short name</strong>
            <span>Short label used in results, for example WAI.</span>
            <input
              data-custom-field="short-name"
              maxlength="40"
              .value=${this.customDraft.shortName}
              @input=${(event: Event) =>
                this.updateCustomDraft('shortName', (event.currentTarget as HTMLInputElement).value)}
            />
          </label>
          <label>
            <strong>Questionnaire version</strong>
            <span>Version of the wording and scoring definition.</span>
            <input
              data-custom-field="version"
              maxlength="40"
              .value=${this.customDraft.version}
              @input=${(event: Event) =>
                this.updateCustomDraft('version', (event.currentTarget as HTMLInputElement).value)}
            />
          </label>
          <label>
            <strong>Questionnaire language</strong>
            <span>BCP 47 tag used for item text and voice recognition, for example en-GB or de.</span>
            <input
              data-custom-field="language"
              maxlength="35"
              spellcheck="false"
              .value=${this.customDraft.language}
              @input=${(event: Event) =>
                this.updateCustomDraft('language', (event.currentTarget as HTMLInputElement).value)}
            />
          </label>
          <label>
            <strong>Source or authorship label</strong>
            <span>Primary source, author, or “Researcher-supplied questionnaire”.</span>
            <input
              data-custom-field="source-label"
              maxlength="240"
              .value=${this.customDraft.sourceLabel}
              @input=${(event: Event) =>
                this.updateCustomDraft('sourceLabel', (event.currentTarget as HTMLInputElement).value)}
            />
          </label>
          <label class="full-width">
            <strong>Source URL (optional)</strong>
            <span>Use an HTTPS link to the primary instrument source when one is available.</span>
            <input
              data-custom-field="source-url"
              type="url"
              inputmode="url"
              maxlength="500"
              placeholder="https://example.org/questionnaire"
              .value=${this.customDraft.sourceUrl}
              @input=${(event: Event) =>
                this.updateCustomDraft('sourceUrl', (event.currentTarget as HTMLInputElement).value)}
            />
          </label>
          <label class="full-width">
            <strong>Description</strong>
            <span>Short explanation shown under the questionnaire title.</span>
            <textarea
              data-custom-field="description"
              rows="3"
              maxlength="400"
              .value=${this.customDraft.description}
              @input=${(event: Event) =>
                this.updateCustomDraft('description', (event.currentTarget as HTMLTextAreaElement).value)}
            ></textarea>
          </label>
          <label class="full-width">
            <strong>Participant instruction</strong>
            <span>What participants should think about before answering.</span>
            <textarea
              data-custom-field="intro-prompt"
              rows="3"
              maxlength="400"
              .value=${this.customDraft.introPrompt}
              @input=${(event: Event) =>
                this.updateCustomDraft('introPrompt', (event.currentTarget as HTMLTextAreaElement).value)}
            ></textarea>
          </label>
          <label>
            <strong>Scale type</strong>
            <span>Controls how the shared response scale is described.</span>
            <select
              data-custom-field="scale-type"
              .value=${this.customDraft.scaleType}
              @change=${(event: Event) =>
                this.updateCustomDraft(
                  'scaleType',
                  (event.currentTarget as HTMLSelectElement)
                    .value as CustomQuestionnaireDraft['scaleType'],
                )}
            >
              <option value="agreement">Agreement</option>
              <option value="magnitude">Magnitude</option>
              <option value="semantic-differential">Semantic differential</option>
            </select>
          </label>
          <label>
            <strong>Score calculation</strong>
            <span>Mean keeps the scale range; sum adds adjusted item values.</span>
            <select
              data-custom-field="aggregation"
              .value=${this.customDraft.aggregation}
              @change=${(event: Event) =>
                this.updateCustomDraft(
                  'aggregation',
                  (event.currentTarget as HTMLSelectElement)
                    .value as CustomQuestionnaireDraft['aggregation'],
                )}
            >
              <option value="mean">Mean of item values</option>
              <option value="sum">Sum of item values</option>
            </select>
          </label>
          <label>
            <strong>Minimum response value</strong>
            <span>Whole number from 0 to 99.</span>
            <input
              data-custom-field="minimum"
              type="number"
              min="0"
              max="99"
              step="1"
              .value=${String(this.customDraft.minimum)}
              @input=${(event: Event) =>
                this.updateCustomDraft(
                  'minimum',
                  (event.currentTarget as HTMLInputElement).valueAsNumber,
                )}
            />
          </label>
          <label>
            <strong>Maximum response value</strong>
            <span>Whole number up to 100.</span>
            <input
              data-custom-field="maximum"
              type="number"
              min="1"
              max="100"
              step="1"
              .value=${String(this.customDraft.maximum)}
              @input=${(event: Event) =>
                this.updateCustomDraft(
                  'maximum',
                  (event.currentTarget as HTMLInputElement).valueAsNumber,
                )}
            />
          </label>
          <label>
            <strong>Response step</strong>
            <span>The range must divide exactly by this positive whole number.</span>
            <input
              data-custom-field="step"
              type="number"
              min="1"
              max="100"
              step="1"
              .value=${String(this.customDraft.step)}
              @input=${(event: Event) =>
                this.updateCustomDraft(
                  'step',
                  (event.currentTarget as HTMLInputElement).valueAsNumber,
                )}
            />
          </label>
          <label>
            <strong>Score name</strong>
            <span>Label used on review, result and export pages.</span>
            <input
              data-custom-field="score-name"
              maxlength="120"
              .value=${this.customDraft.scoreName}
              @input=${(event: Event) =>
                this.updateCustomDraft('scoreName', (event.currentTarget as HTMLInputElement).value)}
            />
          </label>
        </div>

        <fieldset class="custom-items">
          <legend>Questionnaire items</legend>
          <p>
            Each item uses the shared numeric range but may have different visible endpoint labels.
            A reverse-scored response is transformed as minimum + maximum − response before the
            mean or sum is calculated.
          </p>
          ${this.customDraft.items.map((item, index) =>
            this.renderCustomQuestionnaireItem(item, index))}
          <button
            class="secondary-button"
            type="button"
            ?disabled=${this.customDraft.items.length >= MAX_CUSTOM_QUESTIONNAIRE_ITEMS}
            @click=${this.addCustomItem}
          >
            Add another item
          </button>
        </fieldset>

        <div class="button-row compact">
          <button
            class="primary-button"
            type="button"
            @click=${this.useCustomDraft}
          >
            Validate and use this questionnaire
          </button>
          <button
            class="secondary-button"
            type="button"
            @click=${this.resetCustomDraft}
          >
            Reset builder fields
          </button>
        </div>
        <p class="support-boundary">
          Editing these fields does not change the selected questionnaire until you select
          <strong>Validate and use this questionnaire</strong>.
        </p>
        <p class="support-boundary">
          After validation, the full definition is embedded in the configuration and participant
          link. Download its JSON for the study protocol. Route 2 can later reproduce the same
          items, scale and scoring rule without changing source code.
        </p>
        </section>
      </section>
    `;
  }

  private renderPlatformQuestionnaireImport(showCompleteReview = true) {
    const review = this.platformImportReview;
    return html`
      <section
        class="platform-questionnaire-import"
        aria-labelledby="platform-questionnaire-import-heading"
      >
        <h3 id="platform-questionnaire-import-heading">
          1. Import a Qualtrics or LimeSurvey export
        </h3>
        <p class="platform-import-introduction">
          Choose a Qualtrics <code>.qsf</code> survey export or a LimeSurvey
          <code>.lss</code> survey export, <code>.lsg</code> question-group export,
          or <code>.lsq</code> single-question export.
          A multi-group LSS asks you to choose one group. If that group contains
          different numeric scales, it then asks you to choose one compatible rating
          set. Questions outside that set are listed explicitly and remain in the source
          survey. The file is reviewed in this browser and is not uploaded. Nothing is
          converted until you review and confirm the result.
        </p>
        <p class="support-boundary">
          Use <strong>QSF</strong> for a Qualtrics survey, <strong>LSS</strong> for a
          complete LimeSurvey survey, or <strong>LSG</strong> for one LimeSurvey
          question group. Use <strong>LSQ</strong> only when one exported question is
          intended to become a standalone questionnaire. LimeSurvey LSA archives,
          printable files and response-data exports are not questionnaire inputs here.
        </p>
        <details class="support-boundary platform-import-guide">
          <summary><strong>Which source file should I use?</strong></summary>
          <ul>
            <li><strong>Qualtrics QSF:</strong> one complete Qualtrics survey.</li>
            <li><strong>LimeSurvey LSS:</strong> one survey; choose one group during review if needed.</li>
            <li><strong>LimeSurvey LSG:</strong> one exported question group.</li>
            <li><strong>LimeSurvey LSQ:</strong> one exported question, reviewed as a standalone questionnaire.</li>
          </ul>
          <p>
            LSA archives may contain participant data and LSL contains only labels.
            Response-data, bulk-authoring, word-processing and printable formats are
            ambiguous or incomplete for this conversion. They are identified and rejected
            with a safer native-export instruction.
          </p>
        </details>
        <div class="form-grid">
          <label>
            <strong>Source format</strong>
            <span id="platform-import-source-hint">Automatic detection is recommended.</span>
            <select
              data-platform-import-source
              aria-describedby="platform-import-source-hint"
              .value=${this.platformImportSource}
              @change=${(event: Event) => {
                this.platformImportSource = (event.currentTarget as HTMLSelectElement)
                  .value as QuestionnaireImportSourceSelection;
                this.platformImportReview = null;
                this.platformImportConfirmed = false;
                this.importWarningsAcknowledged = false;
                this.platformImportSelectedGroupId = '';
                this.platformImportSelectedRatingSetId = '';
                this.platformImportContents = '';
                this.platformImportFileName = '';
              }}
            >
              <option value="auto">Detect from file</option>
              <option value="qualtrics-qsf">Qualtrics QSF</option>
              <option value="limesurvey-lss">LimeSurvey LSS</option>
              <option value="limesurvey-lsg">LimeSurvey LSG</option>
              <option value="limesurvey-lsq">LimeSurvey LSQ</option>
            </select>
          </label>
          <label class="file-import-control">
            <strong>Questionnaire export</strong>
            <span id="platform-import-file-hint">
              QSF, LSS, LSG or LSQ; maximum file size: 2 MB.
            </span>
            <input
              data-platform-questionnaire-import
              type="file"
              aria-describedby="platform-import-file-hint"
              accept=".qsf,.lss,.lsg,.lsq,.lsa,.lsl,.csv,.tsv,.xls,.xlsx,.vv,.txt,.doc,.docx,.rtf,.odt,.pdf,.html,.htm,.xml,.zip,.sav,.json,application/json,application/xml,text/xml"
              @change=${this.importPlatformQuestionnaire}
            />
          </label>
        </div>
        ${review && (
          showCompleteReview ||
          !review.canConvert ||
          review.requiresGroupSelection ||
          review.requiresRatingSetSelection
        ) ? this.renderPlatformQuestionnaireReview(review) : nothing}
      </section>
    `;
  }

  private renderPlatformQuestionnaireReview(review: QuestionnaireImportReview) {
    const findingList = (
      title: string,
      className: string,
      findings: QuestionnaireImportReview['imported'],
      emptyMessage: string,
    ) => html`
      <section class=${`platform-import-finding ${className}`}>
        <h4>${title} (${findings.length})</h4>
        ${findings.length
          ? html`<ul>
              ${findings.map((finding) => html`
                <li>
                  <strong>${finding.title}</strong>
                  <span>${finding.detail}</span>
                </li>
              `)}
            </ul>`
          : html`<p>${emptyMessage}</p>`}
      </section>
    `;

    if (review.requiresGroupSelection && review.groupOptions?.length) {
      return html`
        <section
          class="platform-import-review import-selection"
          id="platform-import-review"
          tabindex="-1"
          aria-labelledby="platform-import-review-heading"
        >
          <div class="platform-import-review-heading">
            <span class="selection-icon" aria-hidden="true">→</span>
            <div>
              <h4 id="platform-import-review-heading">Choose one LimeSurvey questionnaire group</h4>
              <p><strong>${review.title}</strong> · ${review.sourceName} · ${review.fileName}</p>
            </div>
          </div>
          <p>
            This survey contains several groups. Choose the group that should become
            one standalone questionnaire. Other groups are not silently merged or removed.
          </p>
          <fieldset class="platform-import-group-selection">
            <legend>Questionnaire group</legend>
            <label>
              <strong>Group to review</strong>
              <select
                data-platform-import-group
                .value=${this.platformImportSelectedGroupId}
                @change=${(event: Event) => {
                  this.platformImportSelectedGroupId =
                    (event.currentTarget as HTMLSelectElement).value;
                }}
              >
                <option value="">Choose a group</option>
                ${review.groupOptions.map((group) => html`
                  <option value=${group.id}>
                    ${group.name} · ${group.questionCount} source question${group.questionCount === 1 ? '' : 's'} ·
                    types ${group.questionTypes.join(', ')}
                  </option>
                `)}
              </select>
            </label>
            <button
              class="primary-button"
              type="button"
              ?disabled=${!this.platformImportSelectedGroupId}
              @click=${this.reviewSelectedLimeSurveyGroup}
            >
              Review selected group
            </button>
          </fieldset>
        </section>
      `;
    }

    if (review.requiresRatingSetSelection && review.ratingSetOptions?.length) {
      return html`
        <section
          class="platform-import-review import-selection"
          id="platform-import-review"
          tabindex="-1"
          aria-labelledby="platform-import-review-heading"
        >
          <div class="platform-import-review-heading">
            <span class="selection-icon" aria-hidden="true">→</span>
            <div>
              <h4 id="platform-import-review-heading">Choose one compatible rating set</h4>
              <p><strong>${review.title}</strong> · ${review.sourceName} · ${review.fileName}</p>
            </div>
          </div>
          <p>
            This group contains different response scales or non-rating questions. One AQP
            questionnaire needs one reviewed numeric scale, so choose the rating set that should
            become the standalone questionnaire. Everything else remains in the source file and
            will be listed for confirmation.
          </p>
          <fieldset class="platform-import-group-selection">
            <legend>Rating set</legend>
            <label>
              <strong>Set to review</strong>
              <select
                data-platform-import-rating-set
                .value=${this.platformImportSelectedRatingSetId}
                @change=${(event: Event) => {
                  this.platformImportSelectedRatingSetId =
                    (event.currentTarget as HTMLSelectElement).value;
                }}
              >
                <option value="">Choose a rating set</option>
                ${review.ratingSetOptions.map((set) => html`
                  <option value=${set.id}>
                    ${set.name} · ${set.itemCount} item${set.itemCount === 1 ? '' : 's'} ·
                    values ${set.responseValues.join(', ')}
                  </option>
                `)}
              </select>
            </label>
            <button
              class="primary-button"
              type="button"
              ?disabled=${!this.platformImportSelectedRatingSetId}
              @click=${this.reviewSelectedLimeSurveyRatingSet}
            >
              Review selected rating set
            </button>
          </fieldset>
        </section>
      `;
    }

    return html`
      <section
        class=${`platform-import-review${review.canConvert ? '' : ' import-blocked'}`}
        id="platform-import-review"
        tabindex="-1"
        aria-labelledby="platform-import-review-heading"
      >
        <div class="platform-import-review-heading">
          <span class=${review.canConvert ? 'success-icon' : 'warning-icon'} aria-hidden="true">
            ${review.canConvert ? '✓' : '!'}
          </span>
          <div>
            <h4 id="platform-import-review-heading">
              ${review.canConvert ? 'Import review ready' : 'Conversion blocked'}
            </h4>
            <p>
              <strong>${review.title}</strong> · ${review.sourceName} ·
              ${review.fileName}
            </p>
          </div>
        </div>

        <div class="platform-import-findings">
          ${findingList(
            'Imported safely',
            'import-safe',
            review.imported,
            'No questionnaire items were imported safely.',
          )}
          ${findingList(
            'Requires researcher confirmation',
            'import-confirm',
            review.confirmations,
            'No additional confirmation is required.',
          )}
          ${findingList(
            'Unsupported content',
            'import-unsupported',
            review.unsupported,
            'No unsupported content was found.',
          )}
        </div>

        ${review.canConvert && review.draft
          ? html`
              <fieldset class="platform-import-confirmation">
                <legend>Confirm scoring before conversion</legend>
                <div class="form-grid">
                  <label>
                    <strong>Questionnaire language</strong>
                    <span>
                      BCP 47 language used to mark the questionnaire text. Voice input remains English:
                      participants may say a shown number in English, and may say a complete exact visible
                      answer label only when the questionnaire is English. Confirm this tag against the source.
                    </span>
                    <input
                      data-platform-import-language
                      maxlength="35"
                      spellcheck="false"
                      .value=${this.customDraft.language}
                      @input=${(event: Event) =>
                        this.updateCustomDraft(
                          'language',
                          (event.currentTarget as HTMLInputElement).value,
                        )}
                    />
                  </label>
                  <label>
                    <strong>Scale description</strong>
                    <select
                      data-platform-import-scale-type
                      .value=${this.customDraft.scaleType}
                      @change=${(event: Event) =>
                        this.updateCustomDraft(
                          'scaleType',
                          (event.currentTarget as HTMLSelectElement)
                            .value as CustomQuestionnaireDraft['scaleType'],
                        )}
                    >
                      <option value="agreement">Agreement</option>
                      <option value="magnitude">Magnitude</option>
                      <option value="semantic-differential">Semantic differential</option>
                    </select>
                  </label>
                  <label>
                    <strong>Score calculation</strong>
                    <select
                      data-platform-import-aggregation
                      .value=${this.customDraft.aggregation}
                      @change=${(event: Event) =>
                        this.updateCustomDraft(
                          'aggregation',
                          (event.currentTarget as HTMLSelectElement)
                            .value as CustomQuestionnaireDraft['aggregation'],
                        )}
                    >
                      <option value="mean">Mean of reviewed item values</option>
                      <option value="sum">Sum of reviewed item values</option>
                    </select>
                  </label>
                </div>
                <fieldset class="platform-import-reverse-items">
                  <legend>Reverse-scored items</legend>
                  <p>Select an item only if the questionnaire's reviewed scoring instructions require it.</p>
                  ${this.customDraft.items.map((item, index) => html`
                    <label>
                      <input
                        data-platform-import-reverse=${index}
                        type="checkbox"
                        .checked=${item.reverseScored}
                        @change=${(event: Event) =>
                          this.updateCustomItem(
                            index,
                            'reverseScored',
                            (event.currentTarget as HTMLInputElement).checked,
                          )}
                      />
                      <span>${index + 1}. ${item.name}: ${item.prompt}</span>
                    </label>
                  `)}
                </fieldset>
                <label class="platform-import-final-confirmation">
                  <input
                    data-platform-import-confirm
                    type="checkbox"
                    .checked=${this.platformImportConfirmed}
                    @change=${(event: Event) => {
                      this.platformImportConfirmed =
                        (event.currentTarget as HTMLInputElement).checked;
                    }}
                  />
                  <span>
                    I checked the imported wording, question order, response labels,
                    numeric values, score calculation and reverse-scored items against
                    the source questionnaire. I also understand every listed source
                    setting or display condition that is not retained.
                  </span>
                </label>
                <button
                  class="primary-button"
                  type="button"
                  ?disabled=${!this.platformImportConfirmed}
                  @click=${this.usePlatformImport}
                >
                  Convert and use this questionnaire
                </button>
              </fieldset>
            `
          : html`
              <p class="support-boundary">
                Correct the unsupported content in the source survey and export it
                again. The platform has not created a partial questionnaire.
              </p>
            `}
      </section>
    `;
  }

  private renderCustomQuestionnaireItem(
    item: CustomQuestionnaireItemDraft,
    index: number,
  ) {
    return html`
      <section class="custom-item-editor" aria-labelledby=${`custom-item-${index + 1}-heading`}>
        <div class="custom-item-heading">
          <h4 id=${`custom-item-${index + 1}-heading`}>Item ${index + 1}</h4>
          <button
            class="secondary-button"
            type="button"
            ?disabled=${this.customDraft.items.length === 1}
            aria-label=${`Remove item ${index + 1}`}
            @click=${() => this.removeCustomItem(index)}
          >
            Remove item
          </button>
        </div>
        <div class="form-grid">
          <label>
            <strong>Item label</strong>
            <span>Short name shown on review and export.</span>
            <input
              data-custom-item=${index}
              data-custom-item-field="name"
              maxlength="120"
              .value=${item.name}
              @input=${(event: Event) =>
                this.updateCustomItem(
                  index,
                  'name',
                  (event.currentTarget as HTMLInputElement).value,
                )}
            />
          </label>
          <label class="custom-reverse-option">
            <input
              data-custom-item=${index}
              data-custom-item-field="reverse-scored"
              type="checkbox"
              .checked=${item.reverseScored}
              @change=${(event: Event) =>
                this.updateCustomItem(
                  index,
                  'reverseScored',
                  (event.currentTarget as HTMLInputElement).checked,
                )}
            />
            <span>
              <strong>Reverse this item for scoring</strong>
              <small>The displayed and stored answer is unchanged; only score calculation is reversed.</small>
            </span>
          </label>
          <label class="full-width">
            <strong>Question or statement</strong>
            <textarea
              data-custom-item=${index}
              data-custom-item-field="prompt"
              rows="3"
              maxlength="1000"
              .value=${item.prompt}
              @input=${(event: Event) =>
                this.updateCustomItem(
                  index,
                  'prompt',
                  (event.currentTarget as HTMLTextAreaElement).value,
                )}
            ></textarea>
          </label>
          <label>
            <strong>Low endpoint label</strong>
            <input
              data-custom-item=${index}
              data-custom-item-field="low-anchor"
              maxlength="80"
              .value=${item.lowAnchor}
              @input=${(event: Event) =>
                this.updateCustomItem(
                  index,
                  'lowAnchor',
                  (event.currentTarget as HTMLInputElement).value,
                )}
            />
          </label>
          <label>
            <strong>High endpoint label</strong>
            <input
              data-custom-item=${index}
              data-custom-item-field="high-anchor"
              maxlength="80"
              .value=${item.highAnchor}
              @input=${(event: Event) =>
                this.updateCustomItem(
                  index,
                  'highAnchor',
                  (event.currentTarget as HTMLInputElement).value,
                )}
            />
          </label>
          <label class="full-width">
            <strong>Simpler explanation (optional)</strong>
            <span>
              This support is offered only when every item has an explanation. Do not paraphrase a
              validated instrument without evidence and approval.
            </span>
            <textarea
              data-custom-item=${index}
              data-custom-item-field="simple-explanation"
              rows="2"
              maxlength="1000"
              .value=${item.simpleExplanation}
              @input=${(event: Event) =>
                this.updateCustomItem(
                  index,
                  'simpleExplanation',
                  (event.currentTarget as HTMLTextAreaElement).value,
                )}
            ></textarea>
          </label>
        </div>
      </section>
    `;
  }

  private importPlatformQuestionnaire = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.errorMessage = '';
    this.definitionConfirmation = '';
    this.platformImportReview = null;
    this.platformImportConfirmed = false;
    this.importWarningsAcknowledged = false;
    try {
      const contents = await file.text();
      this.platformImportContents = contents;
      this.platformImportFileName = file.name;
      this.platformImportSelectedGroupId = '';
      this.platformImportSelectedRatingSetId = '';
      const review = reviewQuestionnaireExport(
        contents,
        file.name,
        this.platformImportSource,
      );
      this.platformImportReview = review;
      this.platformImportSelectedGroupId = review.selectedGroupId ?? '';
      if (review.draft) this.customDraft = structuredClone(review.draft);
      this.message = review.requiresGroupSelection
        ? 'Choose one LimeSurvey questionnaire group to review.'
        : review.requiresRatingSetSelection
          ? 'Choose one compatible LimeSurvey rating set to review.'
        : review.canConvert
          ? 'Import review ready. Check every section and confirm scoring before conversion.'
          : 'Import review found unsupported content. No partial questionnaire was created.';
      this.revealConductorResult('#platform-import-review');
    } catch (error) {
      this.showError(
        error instanceof Error
          ? error.message
          : 'The questionnaire export could not be reviewed.',
      );
    } finally {
      input.value = '';
    }
  };

  private reviewSelectedLimeSurveyGroup = () => {
    if (
      !this.platformImportContents ||
      !this.platformImportFileName ||
      !this.platformImportSelectedGroupId
    ) return;
    this.errorMessage = '';
    this.definitionConfirmation = '';
    this.platformImportConfirmed = false;
    this.importWarningsAcknowledged = false;
    try {
      const review = reviewQuestionnaireExport(
        this.platformImportContents,
        this.platformImportFileName,
        this.platformImportSource,
        this.platformImportSelectedGroupId,
      );
      this.platformImportReview = review;
      this.platformImportSelectedRatingSetId = '';
      if (review.draft) this.customDraft = structuredClone(review.draft);
      this.message = review.requiresRatingSetSelection
        ? 'Choose one compatible rating set in the selected LimeSurvey group.'
        : review.canConvert
        ? 'Selected group review ready. Check every section and confirm scoring before conversion.'
        : 'The selected group contains unsupported content. No partial questionnaire was created.';
      this.revealConductorResult('#platform-import-review');
    } catch (error) {
      this.showError(
        error instanceof Error
          ? error.message
          : 'The selected LimeSurvey group could not be reviewed.',
      );
    }
  };

  private reviewSelectedLimeSurveyRatingSet = () => {
    if (
      !this.platformImportContents ||
      !this.platformImportFileName ||
      !this.platformImportSelectedGroupId ||
      !this.platformImportSelectedRatingSetId
    ) return;
    this.errorMessage = '';
    this.definitionConfirmation = '';
    this.platformImportConfirmed = false;
    this.importWarningsAcknowledged = false;
    try {
      const review = reviewQuestionnaireExport(
        this.platformImportContents,
        this.platformImportFileName,
        this.platformImportSource,
        this.platformImportSelectedGroupId,
        this.platformImportSelectedRatingSetId,
      );
      this.platformImportReview = review;
      if (review.draft) this.customDraft = structuredClone(review.draft);
      this.message = review.canConvert
        ? 'Selected rating-set review ready. Check every section and confirm scoring before conversion.'
        : 'The selected rating set contains unsupported content. No partial questionnaire was created.';
      this.revealConductorResult('#platform-import-review');
    } catch (error) {
      this.showError(
        error instanceof Error
          ? error.message
          : 'The selected LimeSurvey rating set could not be reviewed.',
      );
    }
  };

  private usePlatformImport = () => {
    const review = this.platformImportReview;
    if (!review?.canConvert || !review.draft || !this.platformImportConfirmed) return;
    this.errorMessage = '';
    this.definitionConfirmation = '';
    try {
      const definition = createCustomQuestionnaireDefinition(this.customDraft);
      this.activateCustomDefinition(definition, 'imported');
    } catch (error) {
      this.showError(
        error instanceof Error
          ? error.message
          : 'The reviewed questionnaire could not be converted.',
      );
    }
  };

  private updateCustomDraft<K extends keyof CustomQuestionnaireDraft>(
    field: K,
    value: CustomQuestionnaireDraft[K],
  ) {
    this.customDraft = { ...this.customDraft, [field]: value };
    if (this.platformImportReview) this.platformImportConfirmed = false;
    if (this.platformImportReview) this.importWarningsAcknowledged = false;
  }

  private updateCustomItem<K extends keyof CustomQuestionnaireItemDraft>(
    index: number,
    field: K,
    value: CustomQuestionnaireItemDraft[K],
  ) {
    this.customDraft = {
      ...this.customDraft,
      items: this.customDraft.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item),
    };
    if (this.platformImportReview) this.platformImportConfirmed = false;
    if (this.platformImportReview) this.importWarningsAcknowledged = false;
  }

  private addCustomItem = () => {
    if (this.customDraft.items.length >= MAX_CUSTOM_QUESTIONNAIRE_ITEMS) return;
    this.customDraft = {
      ...this.customDraft,
      items: [
        ...this.customDraft.items,
        createCustomItemDraft({
          name: `Item ${this.customDraft.items.length + 1}`,
        }),
      ],
    };
  };

  private removeCustomItem(index: number) {
    if (this.customDraft.items.length === 1) return;
    this.customDraft = {
      ...this.customDraft,
      items: this.customDraft.items.filter((_, itemIndex) => itemIndex !== index),
    };
  }

  private activateCustomDefinition(
    definition: QuestionnaireDefinition,
    action: 'validated' | 'imported',
  ) {
    this.customDefinition = definition;
    this.instrumentId = definition.id;
    if (!definition.supports.simplerExplanations) this.showSimpleLanguage = false;
    this.answerMode = 'standard';
    this.generatedConfig = null;
    this.participantUrl = '';
    const completedAction =
      action === 'imported'
        ? 'imported, validated and selected'
        : 'validated and selected';
    this.definitionConfirmation =
      `${definition.name} ${definition.version} ${completedAction}. ` +
      'Complete the study details, then generate a new configuration.';
    this.configurationConfirmation = '';
    this.message = '';
    this.revealConductorResult('#selected-questionnaire-summary');
  }

  private useCustomDraft = () => {
    this.errorMessage = '';
    this.definitionConfirmation = '';
    try {
      this.activateCustomDefinition(
        createCustomQuestionnaireDefinition(this.customDraft),
        'validated',
      );
    } catch (error) {
      this.showError(
        error instanceof Error
          ? error.message
          : 'The custom questionnaire could not be validated.',
      );
    }
  };

  private importCustomDefinition = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.errorMessage = '';
    this.definitionConfirmation = '';
    try {
      const definition = validateCustomQuestionnaireDefinition(
        JSON.parse(await file.text()) as unknown,
      );
      this.activateCustomDefinition(definition, 'imported');
    } catch (error) {
      this.showError(
        error instanceof Error
          ? error.message
          : 'The questionnaire definition file could not be read.',
      );
    } finally {
      input.value = '';
    }
  };

  private downloadCustomDefinition = () => {
    if (!this.customDefinition) return;
    downloadTextFile(
      customDefinitionFileName(this.customDefinition),
      JSON.stringify(this.customDefinition, null, 2),
      'application/json',
    );
  };

  private resetCustomDraft = () => {
    this.customDraft = createCustomQuestionnaireDraft();
    this.platformImportReview = null;
    this.platformImportConfirmed = false;
    this.importWarningsAcknowledged = false;
    this.platformImportSelectedGroupId = '';
    this.platformImportSelectedRatingSetId = '';
    this.platformImportContents = '';
    this.platformImportFileName = '';
    this.message =
      'Custom questionnaire builder fields reset. The selected questionnaire is unchanged until you validate a new definition.';
  };

  private booleanOption(label: string, checked: boolean, update: (value: boolean) => void, help = '') {
    return html`<label class="toggle-card conductor-toggle">
      <input type="checkbox" .checked=${checked} @change=${(event: Event) => update((event.currentTarget as HTMLInputElement).checked)} />
      <span><strong>${label}</strong>${help ? html`<small>${help}</small>` : nothing}</span>
    </label>`;
  }

  private currentSupportConfig(): StudySupportConfig {
    return {
      showSimpleLanguage:
        this.definition.supports.simplerExplanations && this.showSimpleLanguage,
      answerMode:
        this.definition.supports.smileyLandmarks ? this.answerMode : 'standard',
      largeText: this.largeText,
      audioGuidance: this.audioGuidance,
      recoveryEnabled: this.recoveryEnabled,
      participantAdjustmentPolicy: this.participantAdjustmentPolicy,
      voiceInputAvailable: this.voiceInputAvailable,
      gazeInputAvailable: this.gazeInputAvailable,
    };
  }

  private currentCollectionConfig(): StudyCollectionConfig {
    if (this.collectionMode === 'local') return { mode: 'local' };
    const parentOrigin = normaliseHttpsOrigin(this.qualtricsSurveyUrl);
    if (!parentOrigin) {
      throw new Error('Enter a valid HTTPS Qualtrics survey or preview URL for central collection.');
    }
    if (parentOrigin === window.location.origin) {
      throw new Error('The Qualtrics origin must be different from this GitHub Pages website.');
    }
    return { mode: 'qualtrics', parentOrigin };
  }

  private useConfiguration(config: StudyConfig) {
    if (config.questionnaireDefinition) {
      this.customDefinition = config.questionnaireDefinition;
    }
    this.generatedConfig = config;
    this.instrumentId = config.instrumentId;
    this.studyId = config.studyId;
    this.studyTitle = config.studyTitle;
    this.taskLabel = config.taskLabel;
    this.showScoreToParticipant = config.showScoreToParticipant;
    this.showSimpleLanguage = config.support.showSimpleLanguage;
    this.answerMode = config.support.answerMode;
    this.largeText = config.support.largeText;
    this.audioGuidance = config.support.audioGuidance;
    this.recoveryEnabled = config.support.recoveryEnabled;
    this.participantAdjustmentPolicy = config.support.participantAdjustmentPolicy;
    this.voiceInputAvailable = config.support.voiceInputAvailable;
    this.gazeInputAvailable = config.support.gazeInputAvailable;
    this.collectionMode = config.collection.mode;
    this.qualtricsSurveyUrl = config.collection.mode === 'qualtrics' ? config.collection.parentOrigin : '';
    this.participantUrl = validParticipantCode(this.participantCode)
      ? buildParticipantUrl(
          new URL('index.html', window.location.href).toString(),
          config,
          this.participantCode,
        )
      : '';
  }

  private updateParticipantCode = (event: Event) => {
    this.participantCode = (event.currentTarget as HTMLInputElement).value.trim();
    if (!this.generatedConfig) return;
    const codeIsValid = validParticipantCode(this.participantCode);
    this.participantUrl = codeIsValid
      ? buildParticipantUrl(
          new URL('index.html', window.location.href).toString(),
          this.generatedConfig,
          this.participantCode,
        )
      : '';
    this.configurationConfirmation = codeIsValid
      ? `Participant-specific link ready for code ${this.participantCode}.`
      : '';
  };

  private qualtricsIframeHtml() {
    if (!this.generatedConfig || this.generatedConfig.collection.mode !== 'qualtrics') return '';
    return buildQualtricsQuestionHtml(this.participantUrl);
  }

  private renderQualtricsSetup() {
    const questionHtml = this.qualtricsIframeHtml();
    const endMessage = buildQualtricsEndOfSurveyMessage(
      this.generatedConfig?.showScoreToParticipant === true,
    );
    return html`
      <div class="qualtrics-setup" role="region" aria-labelledby="qualtrics-setup-heading">
        <h3 id="qualtrics-setup-heading">Qualtrics installation package for this configuration</h3>
        <p>
          <strong>Selected questionnaire:</strong> ${this.definition.name}
          (${this.definition.version}).
          The generated HTML contains this configuration and questionnaire ID. The JavaScript and Embedded Data
          manifest are intentionally shared by every registered questionnaire.
        </p>
        <p>
          <strong>Installation fingerprint:</strong>
          platform ${PROTOTYPE_VERSION}; Qualtrics bridge ${qualtricsBridgeBuild}.
          Replace both the complete HTML and complete JavaScript together whenever this fingerprint changes.
        </p>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>Do not upload these repository files to Qualtrics and do not paste the static HTML template unchanged.</strong>
            The first three blocks below are the required installation inputs. Only the first block contains this
            study's generated participant URL. The fourth block is optional plain text for Qualtrics' final page;
            it is not code and does not affect whether a response is saved.
          </p>
        </aside>
        <aside class="boundary-note">
          <p>
            <strong>Version 0.7 records have not been deleted.</strong>
            They remain in the existing <code>__js_ANTLX_*</code> columns. Version 0.8 writes new records to the
            questionnaire-independent <code>__js_AQP_*</code> columns and does not rewrite old rows. Keep the old
            fields until those rows have been exported and verified. Use a copied synthetic survey for the first
            Version 0.8 installation test.
          </p>
        </aside>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>Check Qualtrics response anonymisation before recruitment.</strong>
            An anonymous distribution link still records IP address and approximate location by
            default. If the approved study does not require those fields, enable
            <strong>Anonymize responses</strong> in Qualtrics Survey Options before the synthetic
            test, publish the change, and confirm that a newly exported row has blank IP and
            location fields. This setting is not retroactive.
          </p>
          <p>
            <a
              href="https://www.qualtrics.com/support/survey-platform/survey-module/survey-options/survey-protection/#AnonymizeResponses"
              target="_blank"
              rel="noopener"
            >Open the official Qualtrics anonymisation guidance</a>.
          </p>
        </aside>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>A rendered iframe is not a data-collection pass.</strong>
            In Preview, the status above the questionnaire must name bridge
            ${qualtricsBridgeBuild} and say that diagnostic fields were staged. Then complete one
            <em>new</em> synthetic response and confirm that its newly dated row contains
            <code>__js_AQP_ACCEPTED = 1</code>, <code>__js_AQP_SCHEMA = 4</code> and the selected
            instrument ID. Rows collected before these fields were installed remain blank and are
            not a valid test of this package.
          </p>
        </aside>
        <ol class="qualtrics-install-steps">
          <li>
            <h4>Text/Graphic question: complete generated HTML</h4>
            <p>
              Add one Text/Graphic question on its own page. Open that question's HTML or source view, replace the
              whole question body with this block, and save it. Do not paste it into the ordinary rich-text view.
            </p>
            <label for="qualtrics-question-html"><strong>Complete question HTML</strong></label>
            <textarea
              id="qualtrics-question-html"
              data-qualtrics-asset="question-html"
              readonly
              rows="10"
              .value=${questionHtml}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${() => this.copySetupAsset(questionHtml, 'question HTML')}
            >
              Copy complete question HTML
            </button>
          </li>
          <li>
            <h4>Survey Flow: Embedded Data field names</h4>
            <p>
              Before the questionnaire block, add one Embedded Data element. Add every non-empty line below as a separate
              field name, including the <code>__js_</code> prefix, and leave each value unset. This list does not go
              into the question body.
            </p>
            <label for="qualtrics-embedded-fields">
              <strong>${qualtricsEmbeddedDataFieldCount} Embedded Data field names</strong>
            </label>
            <textarea
              id="qualtrics-embedded-fields"
              data-qualtrics-asset="embedded-data"
              readonly
              rows="10"
              .value=${embeddedDataFields.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${() => this.copySetupAsset(embeddedDataFields.trim(), 'Embedded Data field list')}
            >
              Copy Embedded Data field list
            </button>
          </li>
          <li>
            <h4>Question behavior: JavaScript</h4>
            <p>
              Open JavaScript for the same Text/Graphic question. Replace the sample callback content with this
              complete script and save it. Do not add <code>&lt;script&gt;</code> tags and do not paste it into the
              question HTML.
            </p>
            <label for="qualtrics-question-javascript"><strong>Complete question JavaScript</strong></label>
            <textarea
              id="qualtrics-question-javascript"
              data-qualtrics-asset="question-javascript"
              readonly
              rows="10"
              .value=${qualtricsQuestionJavaScript.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${() => this.copySetupAsset(qualtricsQuestionJavaScript.trim(), 'question JavaScript')}
            >
              Copy complete question JavaScript
            </button>
          </li>
          <li>
            <h4>Optional: End of Survey plain-text message</h4>
            <p>
              This step is not required for data collection. Qualtrics' default End of Survey page is acceptable.
              To provide a clearer final confirmation, create or select a custom message and paste this as ordinary
              text. Do not add HTML, JavaScript or a redirect. If you selected Show score to participant, use this
              message if you want the score to remain visible after the automatic transition.
            </p>
            <label for="qualtrics-end-message"><strong>Optional End of Survey message</strong></label>
            <textarea
              id="qualtrics-end-message"
              data-qualtrics-asset="end-message"
              readonly
              rows="8"
              .value=${endMessage}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${() => this.copySetupAsset(endMessage, 'End of Survey message')}
            >
              Copy End of Survey message
            </button>
          </li>
        </ol>
        <p class="support-boundary">
          The Qualtrics editing canvas may show piped-text tokens such as
          <code>\${e://Field/__js_AQP_PARTICIPANT_CODE}</code>. That canvas is not the participant test. In Preview,
          before a response is recorded, the summary must be hidden and the configured participant iframe must be
          visible. If it is not, clear the question body and repeat step 1 in HTML or source view.
        </p>
        <p class="support-boundary">
          In Preview, the participant application must fill the browser viewport and expose one visible
          vertical scrollbar at the browser edge. A narrow inner panel, clipped content or two visible
          scrollbars means that the HTML and JavaScript are not both from this installation fingerprint;
          do not collect data from that survey.
        </p>
        <p class="support-boundary">
          After replacing the three required inputs, and after any optional message change, select
          <strong>Review and Publish</strong>. Preview one new synthetic response after publishing. Draft changes
          do not update an already active distribution link, and older recorded rows are not backfilled with new
          <code>__js_AQP_*</code> values.
        </p>
        <p>
          <a href="docs/QUALTRICS-INTEGRATION.md">Open the full Qualtrics setup and adverse-test guide</a>
        </p>
      </div>
    `;
  }

  private generateParticipantLink = () => {
    this.errorMessage = '';
    this.configurationConfirmation = '';
    try {
      if (!validParticipantCode(this.participantCode)) {
        throw new Error('Enter a pseudonymous participant code using 1–32 letters, numbers, hyphens or underscores.');
      }
      const config = createStudyConfig({
        instrumentId: this.instrumentId,
        ...(this.customDefinition?.id === this.instrumentId
          ? { questionnaireDefinition: this.customDefinition }
          : {}),
        studyId: this.studyId,
        studyTitle: this.studyTitle,
        taskLabel: this.taskLabel,
        showScoreToParticipant: this.showScoreToParticipant,
        support: this.currentSupportConfig(),
        collection: this.currentCollectionConfig(),
      });
      this.useConfiguration(config);
      this.configurationConfirmation =
        'Participant link and configuration generated. The ready-to-use files and link are shown below.';
      this.message = '';
      this.revealConductorResult('#configuration-ready-panel');
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'The study configuration could not be generated.');
    }
  };

  private copyParticipantLink = async () => {
    if (!this.participantUrl) return;
    await this.copySetupAsset(this.participantUrl, 'participant link');
  };

  private copySetupAsset = async (value: string, label: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable.');
      await navigator.clipboard.writeText(value);
      this.message = `${label.charAt(0).toUpperCase()}${label.slice(1)} copied.`;
    } catch {
      this.message = `Automatic copy was unavailable. Select and copy the ${label} from its text box.`;
    }
  };

  private downloadConfiguration = () => {
    if (!this.generatedConfig) return;
    downloadTextFile(
      `${this.generatedConfig.studyId}-${this.generatedConfig.configId}.json`,
      JSON.stringify(this.generatedConfig, null, 2),
      'application/json',
    );
  };

  private importConfiguration = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.errorMessage = '';
    this.configurationConfirmation = '';
    try {
      const candidate = JSON.parse(await file.text()) as unknown;
      const config = normaliseStudyConfig(candidate);
      if (!config) {
        if (looksLikeCompletedResult(candidate)) {
          throw new Error(
            'This is a completed result file, not a study configuration. Import the JSON downloaded from Configuration ready.',
          );
        }
        throw new Error('This is not a valid Version 0.8 study configuration or supported Version 0.7 configuration.');
      }
      this.useConfiguration(config);
      this.configurationConfirmation = validParticipantCode(this.participantCode)
        ? 'Configuration imported and participant-specific link reproduced. The configuration ID and files are shown below.'
        : 'Configuration imported. Enter the approved pseudonymous participant code to create a participant-specific link.';
      this.message = '';
      this.revealConductorResult('#configuration-ready-panel');
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'The configuration file could not be read.');
    } finally {
      input.value = '';
    }
  };

  private showError(message: string) {
    this.errorMessage = message;
    void this.updateComplete.then(() => {
      const summary = this.querySelector<HTMLElement>('#conductor-error');
      if (!summary) return;
      focusAndReveal(summary);
    });
  }

  private revealConductorResult(selector: string) {
    void this.updateComplete.then(() => {
      const target = this.querySelector<HTMLElement>(selector);
      if (!target) return;
      focusAndReveal(target, { block: 'start' });
    });
  }

  private refreshResults = () => {
    this.completedResults = loadCompletedResults();
  };

  private exportResultsJson = () => {
    if (!this.completedResults.length) return;
    downloadTextFile(
      `accessible-questionnaire-results-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(this.completedResults, null, 2),
      'application/json',
    );
  };

  private exportResultsCsv = () => {
    if (!this.completedResults.length) return;
    downloadTextFile(
      `accessible-questionnaire-results-${new Date().toISOString().slice(0, 10)}.csv`,
      `\uFEFF${resultsToCsv(this.completedResults)}`,
      'text/csv',
    );
  };

  private eraseResults = () => {
    const confirmed = window.confirm(
      'Erase every completed questionnaire record stored by this site in this browser? Confirm only after checking the exported files.',
    );
    if (!confirmed) return;
    clearCompletedResults();
    this.refreshResults();
    this.message = 'Local completed records erased.';
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'study-conductor-app': StudyConductorApp;
  }
}
