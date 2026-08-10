import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import {
  DEFAULT_QUESTIONNAIRE_ID,
  buildQuestionnairePairs,
  buildRatingValues,
  getQuestionnaireDefinition,
  resolveQuestionnaireDefinition,
  validateQuestionnaireDefinition,
  type QuestionnaireDefinition,
} from './questionnaire-definition';
import {
  scoreQuestionnaire,
  type PairResponses,
  type QuestionnaireScore,
} from './scoring';

export const PROTOTYPE_VERSION = '0.8.0';
export const COMPLETED_RESULTS_KEY = 'accessible-questionnaire-v0.8-completed-results';
export const LEGACY_COMPLETED_RESULTS_KEY = 'accessible-nasa-tlx-v0.7-completed-results';
export const MAX_PARTICIPANT_URL_LENGTH = 24000;

export type AnswerMode = 'standard' | 'smiley';
export type ParticipantAdjustmentPolicy = 'locked' | 'presentation-only' | 'participant-choice';
export type SupportChangeSetting =
  | 'simpler-explanations'
  | 'answer-mode'
  | 'text-size'
  | 'automatic-audio'
  | 'interruption-recovery';

export type StudyCollectionConfig =
  | { mode: 'local' }
  | { mode: 'qualtrics'; parentOrigin: string };

export interface SupportChange {
  setting: SupportChangeSetting;
  from: boolean | AnswerMode | 'standard' | 'large';
  to: boolean | AnswerMode | 'standard' | 'large';
  stage: 'intro' | 'ratings' | 'pairs' | 'review';
  changedAt: string;
}

export interface StudySupportConfig {
  showSimpleLanguage: boolean;
  answerMode: AnswerMode;
  largeText: boolean;
  audioGuidance: boolean;
  recoveryEnabled: boolean;
  participantAdjustmentPolicy: ParticipantAdjustmentPolicy;
  voiceInputAvailable: boolean;
  gazeInputAvailable: boolean;
}

export interface StudyConfig {
  schemaVersion: 4;
  configId: string;
  createdAt: string;
  prototypeVersion: typeof PROTOTYPE_VERSION;
  instrumentId: string;
  definitionHash: string;
  questionnaireDefinition?: QuestionnaireDefinition;
  studyId: string;
  studyTitle: string;
  taskLabel: string;
  showScoreToParticipant: boolean;
  support: StudySupportConfig;
  collection: StudyCollectionConfig;
}

export interface SupportMetadata {
  simplerExplanationsShownAtSubmission: boolean;
  largeTextUsedAtSubmission: boolean;
  answerModeAtSubmission: AnswerMode;
  recoveryEnabledAtSubmission: boolean;
  interruptionSummaryShown: boolean;
  readAloudUsed: boolean;
  automaticAudioGuidanceEnabledAtSubmission: boolean;
  gazeUsed: boolean;
  gazeActionCount: number;
  gazeEngine: string | null;
  ratingInputRoutes: Partial<Record<string, string>>;
  pairInputRoutes: Record<string, string>;
  supportChanges: SupportChange[];
}

export interface StudyResultRecord {
  schemaVersion: 4;
  submissionId: string;
  study: {
    studyId: string;
    configId: string;
    studyTitle: string;
    taskLabel: string;
  };
  participantCode: string;
  timing: {
    startedAt: string;
    completedAt: string;
  };
  prototype: {
    name: 'Accessible Questionnaire Platform';
    version: typeof PROTOTYPE_VERSION;
  };
  instrument: {
    id: string;
    name: string;
    version: string;
    definitionSchemaVersion: 1;
    definitionHash: string;
    scoringStrategy: QuestionnaireScore['strategy'];
    /** Complete immutable snapshot needed to reconstruct the administered instrument from the export alone. */
    definition: QuestionnaireDefinition;
  };
  collection: StudyCollectionConfig;
  configuration: StudySupportConfig;
  responses: {
    ratings: Record<string, number>;
    pairwiseChoices: PairResponses;
    pairPresentationOrder: string[];
  };
  result: QuestionnaireScore;
  supportMetadata: SupportMetadata;
}

export interface StudyConfigDraft {
  instrumentId?: string;
  questionnaireDefinition?: QuestionnaireDefinition;
  studyId: string;
  studyTitle: string;
  taskLabel: string;
  showScoreToParticipant: boolean;
  support: StudySupportConfig;
  collection: StudyCollectionConfig;
}

export interface StudyResultInput {
  config: StudyConfig;
  participantCode: string;
  startedAt: string;
  completedAt?: string;
  pairPresentationOrder: string[];
  pairwiseChoices: PairResponses;
  result: QuestionnaireScore;
  supportMetadata: SupportMetadata;
  submissionId?: string;
}

interface LegacyStudyResultRecordV3 {
  schemaVersion: 3;
  submissionId: string;
  study: StudyResultRecord['study'];
  participantCode: string;
  timing: StudyResultRecord['timing'];
  prototype: {
    name: 'Accessible NASA-TLX';
    version: '0.7.0';
  };
  instrument: {
    name: 'NASA Task Load Index';
    version: 'full weighted';
  };
  collection: StudyCollectionConfig;
  configuration: StudySupportConfig;
  responses: StudyResultRecord['responses'];
  result: {
    ratings: Record<string, number>;
    weights: Record<string, number>;
    adjustedRatings: Record<string, number>;
    weightedScore: number;
  };
  supportMetadata: SupportMetadata;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function randomId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}-${uuid}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function cleanText(value: string, field: string, maximumLength: number) {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) throw new Error(`${field} is required.`);
  if (cleaned.length > maximumLength) throw new Error(`${field} must be ${maximumLength} characters or fewer.`);
  return cleaned;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${canonicalJson(entry)}`).join(',')}}`;
}

/**
 * Stable content identifier for the exact validated definition shown by the
 * runner. This is an integrity fingerprint, not a digital signature.
 */
export function questionnaireDefinitionHash(definition: QuestionnaireDefinition) {
  const bytes = new TextEncoder().encode(canonicalJson(definition));
  return `sha256:${bytesToHex(sha256(bytes))}`;
}

function validDefinitionHash(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

export function validStudyId(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value);
}

export function validParticipantCode(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function validSupportConfig(value: unknown): value is StudySupportConfig {
  if (!value || typeof value !== 'object') return false;
  const support = value as Record<string, unknown>;
  return (
    isBoolean(support.showSimpleLanguage) &&
    (support.answerMode === 'standard' || support.answerMode === 'smiley') &&
    isBoolean(support.largeText) &&
    isBoolean(support.audioGuidance) &&
    isBoolean(support.recoveryEnabled) &&
    (
      support.participantAdjustmentPolicy === 'locked' ||
      support.participantAdjustmentPolicy === 'presentation-only' ||
      support.participantAdjustmentPolicy === 'participant-choice'
    ) &&
    isBoolean(support.voiceInputAvailable) &&
    isBoolean(support.gazeInputAvailable)
  );
}

function supportMatchesDefinition(
  definition: QuestionnaireDefinition,
  support: StudySupportConfig,
) {
  if (support.showSimpleLanguage && !definition.supports.simplerExplanations) return false;
  if (support.answerMode === 'smiley' && !definition.supports.smileyLandmarks) return false;
  return true;
}

export function normaliseHttpsOrigin(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.origin === 'null') return null;
    return url.origin;
  } catch {
    return null;
  }
}

function validCollectionConfig(value: unknown): value is StudyCollectionConfig {
  if (!value || typeof value !== 'object') return false;
  const collection = value as Record<string, unknown>;
  if (collection.mode === 'local') return true;
  return (
    collection.mode === 'qualtrics' &&
    typeof collection.parentOrigin === 'string' &&
    normaliseHttpsOrigin(collection.parentOrigin) === collection.parentOrigin
  );
}

export function createStudyConfig(draft: StudyConfigDraft, overrides: Partial<Pick<StudyConfig, 'configId' | 'createdAt'>> = {}): StudyConfig {
  const studyId = draft.studyId.trim();
  const instrumentId = draft.instrumentId ?? DEFAULT_QUESTIONNAIRE_ID;
  const definition = resolveQuestionnaireDefinition(
    instrumentId,
    draft.questionnaireDefinition,
  );
  if (!validStudyId(studyId)) {
    throw new Error('Study ID must use 1–64 letters, numbers, hyphens or underscores, and start with a letter or number.');
  }
  if (!validSupportConfig(draft.support)) throw new Error('The support configuration is incomplete.');
  if (!definition) {
    throw new Error('Choose a supported questionnaire definition.');
  }
  if (!supportMatchesDefinition(definition, draft.support)) {
    throw new Error('The selected support settings are not compatible with this questionnaire definition.');
  }
  if (!validCollectionConfig(draft.collection)) throw new Error('The result-collection configuration is incomplete.');
  return {
    schemaVersion: 4,
    configId: overrides.configId ?? randomId('config'),
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    prototypeVersion: PROTOTYPE_VERSION,
    instrumentId,
    definitionHash: questionnaireDefinitionHash(definition),
    ...(getQuestionnaireDefinition(instrumentId)
      ? {}
      : { questionnaireDefinition: definition }),
    studyId,
    studyTitle: cleanText(draft.studyTitle, 'Study title', 120),
    taskLabel: cleanText(draft.taskLabel, 'Task label', 160),
    showScoreToParticipant: draft.showScoreToParticipant,
    support: { ...draft.support },
    collection: { ...draft.collection },
  };
}

export function isStudyConfig(value: unknown): value is StudyConfig {
  if (!value || typeof value !== 'object') return false;
  const config = value as Record<string, unknown>;
  const definition =
    typeof config.instrumentId === 'string'
      ? resolveQuestionnaireDefinition(
          config.instrumentId,
          config.questionnaireDefinition,
        )
      : null;
  return (
    config.schemaVersion === 4 &&
    config.prototypeVersion === PROTOTYPE_VERSION &&
    typeof config.instrumentId === 'string' &&
    definition !== null &&
    validDefinitionHash(config.definitionHash) &&
    config.definitionHash === questionnaireDefinitionHash(definition) &&
    typeof config.configId === 'string' &&
    config.configId.length > 0 &&
    typeof config.createdAt === 'string' &&
    typeof config.studyId === 'string' &&
    validStudyId(config.studyId) &&
    typeof config.studyTitle === 'string' &&
    config.studyTitle.length > 0 &&
    config.studyTitle.length <= 120 &&
    typeof config.taskLabel === 'string' &&
    config.taskLabel.length > 0 &&
    config.taskLabel.length <= 160 &&
    isBoolean(config.showScoreToParticipant) &&
    validSupportConfig(config.support) &&
    supportMatchesDefinition(definition, config.support) &&
    validCollectionConfig(config.collection)
  );
}

interface LegacyStudyConfigV3 {
  schemaVersion: 3;
  prototypeVersion: '0.7.0';
  configId: string;
  createdAt: string;
  studyId: string;
  studyTitle: string;
  taskLabel: string;
  showScoreToParticipant: boolean;
  support: StudySupportConfig;
  collection: StudyCollectionConfig;
}

function isLegacyStudyConfigV3(value: unknown): value is LegacyStudyConfigV3 {
  if (!value || typeof value !== 'object') return false;
  const config = value as Record<string, unknown>;
  return (
    config.schemaVersion === 3 &&
    config.prototypeVersion === '0.7.0' &&
    typeof config.configId === 'string' &&
    Boolean(config.configId) &&
    typeof config.createdAt === 'string' &&
    typeof config.studyId === 'string' &&
    validStudyId(config.studyId) &&
    typeof config.studyTitle === 'string' &&
    Boolean(config.studyTitle) &&
    typeof config.taskLabel === 'string' &&
    Boolean(config.taskLabel) &&
    isBoolean(config.showScoreToParticipant) &&
    validSupportConfig(config.support) &&
    validCollectionConfig(config.collection)
  );
}

export function normaliseStudyConfig(value: unknown): StudyConfig | null {
  if (isStudyConfig(value)) return value;
  if (!isLegacyStudyConfigV3(value)) return null;
  const definition = getQuestionnaireDefinition(DEFAULT_QUESTIONNAIRE_ID)!;
  return {
    schemaVersion: 4,
    configId: value.configId,
    createdAt: value.createdAt,
    prototypeVersion: PROTOTYPE_VERSION,
    instrumentId: DEFAULT_QUESTIONNAIRE_ID,
    definitionHash: questionnaireDefinitionHash(definition),
    studyId: value.studyId,
    studyTitle: value.studyTitle,
    taskLabel: value.taskLabel,
    showScoreToParticipant: value.showScoreToParticipant,
    support: { ...value.support },
    collection: { ...value.collection },
  };
}

function encodeUtf8(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeUtf8(value: string) {
  const normalised = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, '=');
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

export function encodeStudyConfig(config: StudyConfig) {
  if (!isStudyConfig(config)) throw new Error('Cannot encode an invalid study configuration.');
  return encodeUtf8(JSON.stringify(config));
}

export function decodeStudyConfig(encoded: string): StudyConfig | null {
  try {
    const decoded = JSON.parse(decodeUtf8(encoded)) as unknown;
    return normaliseStudyConfig(decoded);
  } catch {
    return null;
  }
}

export function readStudyConfigFromHash(hash: string): StudyConfig | null {
  const parameters = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const encoded = parameters.get('study');
  return encoded ? decodeStudyConfig(encoded) : null;
}

export function readParticipantCodeFromHash(hash: string) {
  const parameters = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const participantCode = parameters.get('participant');
  return participantCode && validParticipantCode(participantCode) ? participantCode : null;
}

export function buildParticipantUrl(baseUrl: string, config: StudyConfig, participantCode?: string) {
  const url = new URL(baseUrl);
  url.search = '';
  const parameters = new URLSearchParams();
  parameters.set('study', encodeStudyConfig(config));
  if (participantCode !== undefined) {
    if (!validParticipantCode(participantCode)) {
      throw new Error('Participant code must use 1–32 letters, numbers, hyphens or underscores.');
    }
    parameters.set('participant', participantCode);
  }
  url.hash = parameters.toString();
  const participantUrl = url.toString();
  if (participantUrl.length > MAX_PARTICIPANT_URL_LENGTH) {
    throw new Error(
      `The generated participant link is too long. Reduce questionnaire wording or item count below ${MAX_PARTICIPANT_URL_LENGTH} URL characters.`,
    );
  }
  return participantUrl;
}

export function progressStorageKey(configId: string, participantCode: string) {
  if (!validParticipantCode(participantCode)) throw new Error('Invalid participant code.');
  return `accessible-questionnaire-v0.8-progress:${configId}:${participantCode}`;
}

export function createStudyResultRecord(input: StudyResultInput): StudyResultRecord {
  if (!validParticipantCode(input.participantCode)) throw new Error('A valid pseudonymous participant code is required.');
  const definition = resolveQuestionnaireDefinition(
    input.config.instrumentId,
    input.config.questionnaireDefinition,
  );
  if (!definition) throw new Error('The study questionnaire definition is unavailable.');
  if (input.result.strategy !== definition.scoring.strategy) {
    throw new Error('The calculated result does not match the configured questionnaire.');
  }
  const definitionHash = questionnaireDefinitionHash(definition);
  if (input.config.definitionHash !== definitionHash) {
    throw new Error('The questionnaire definition does not match the saved study configuration.');
  }
  return {
    schemaVersion: 4,
    submissionId: input.submissionId ?? randomId('submission'),
    study: {
      studyId: input.config.studyId,
      configId: input.config.configId,
      studyTitle: input.config.studyTitle,
      taskLabel: input.config.taskLabel,
    },
    participantCode: input.participantCode,
    timing: {
      startedAt: input.startedAt,
      completedAt: input.completedAt ?? new Date().toISOString(),
    },
    prototype: { name: 'Accessible Questionnaire Platform', version: PROTOTYPE_VERSION },
    instrument: {
      id: definition.id,
      name: definition.name,
      version: definition.version,
      definitionSchemaVersion: definition.schemaVersion,
      definitionHash,
      scoringStrategy: definition.scoring.strategy,
      definition: structuredClone(definition),
    },
    collection: { ...input.config.collection },
    configuration: { ...input.config.support },
    responses: {
      ratings: { ...input.result.ratings },
      pairwiseChoices: { ...input.pairwiseChoices },
      pairPresentationOrder: [...input.pairPresentationOrder],
    },
    result: input.result,
    supportMetadata: input.supportMetadata,
  };
}

function sameNumber(left: number, right: number) {
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 1e-9;
}

function resultDefinition(record: Partial<StudyResultRecord>) {
  try {
    const definition = validateQuestionnaireDefinition(record.instrument?.definition);
    return definition.id === record.instrument?.id ? definition : null;
  } catch {
    return null;
  }
}

export function isStudyResultRecord(value: unknown): value is StudyResultRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as StudyResultRecord;
  const definition = resultDefinition(record);
  if (
    record.schemaVersion !== 4 ||
    typeof record.submissionId !== 'string' ||
    !record.submissionId ||
    !validParticipantCode(record.participantCode) ||
    !record.study ||
    !validStudyId(record.study.studyId) ||
    typeof record.study.configId !== 'string' ||
    !record.study.configId ||
    typeof record.study.studyTitle !== 'string' ||
    typeof record.study.taskLabel !== 'string' ||
    !record.timing ||
    typeof record.timing.startedAt !== 'string' ||
    typeof record.timing.completedAt !== 'string' ||
    record.prototype?.name !== 'Accessible Questionnaire Platform' ||
    record.prototype?.version !== PROTOTYPE_VERSION ||
    !definition ||
    record.instrument?.name !== definition.name ||
    record.instrument?.version !== definition.version ||
    record.instrument?.definitionSchemaVersion !== definition.schemaVersion ||
    record.instrument?.definitionHash !== questionnaireDefinitionHash(definition) ||
    record.instrument?.scoringStrategy !== definition.scoring.strategy ||
    !validCollectionConfig(record.collection) ||
    !validSupportConfig(record.configuration) ||
    !supportMatchesDefinition(definition, record.configuration) ||
    !record.responses ||
    !record.result ||
    !record.supportMetadata
  ) {
    return false;
  }

  const ratingValues = buildRatingValues(definition);
  const itemIds = new Set(definition.items.map(({ id }) => id));
  const responseRatingIds = Object.keys(record.responses.ratings ?? {});
  const resultRatingIds = Object.keys(record.result.ratings ?? {});
  const ratingValuesValid = definition.items.every(({ id }) => {
    const rating = record.responses.ratings?.[id];
    return Number.isInteger(rating) && ratingValues.includes(rating);
  });
  const pairs = buildQuestionnairePairs(definition);
  const pairIds = new Set(pairs.map(({ id }) => id));
  const responsePairIds = Object.keys(record.responses.pairwiseChoices ?? {});
  const pairResponsesValid = pairs.every(({ id, left, right }) => {
    const choice = record.responses.pairwiseChoices?.[id];
    return choice === left || choice === right;
  });
  const supportChangesValid =
    Array.isArray(record.supportMetadata.supportChanges) &&
    record.supportMetadata.supportChanges.every((change) => {
      if (!change || typeof change !== 'object') return false;
      const commonValid =
        [
          'simpler-explanations',
          'answer-mode',
          'text-size',
          'automatic-audio',
          'interruption-recovery',
        ].includes(change.setting) &&
        ['intro', 'ratings', 'pairs', 'review'].includes(change.stage) &&
        typeof change.changedAt === 'string';
      if (!commonValid) return false;
      if (change.setting === 'answer-mode') {
        return (
          (change.from === 'standard' || change.from === 'smiley') &&
          (change.to === 'standard' || change.to === 'smiley') &&
          change.from !== change.to
        );
      }
      if (change.setting === 'text-size') {
        return (
          (change.from === 'standard' || change.from === 'large') &&
          (change.to === 'standard' || change.to === 'large') &&
          change.from !== change.to
        );
      }
      return typeof change.from === 'boolean' && typeof change.to === 'boolean' && change.from !== change.to;
    });
  const pairOrder = record.responses.pairPresentationOrder;
  if (
    !ratingValuesValid ||
    responseRatingIds.length !== itemIds.size ||
    resultRatingIds.length !== itemIds.size ||
    responseRatingIds.some((id) => !itemIds.has(id)) ||
    resultRatingIds.some((id) => !itemIds.has(id)) ||
    !pairResponsesValid ||
    responsePairIds.length !== pairIds.size ||
    responsePairIds.some((id) => !pairIds.has(id)) ||
    !supportChangesValid ||
    !Array.isArray(pairOrder) ||
    pairOrder.length !== pairs.length ||
    new Set(pairOrder).size !== pairs.length
  ) {
    return false;
  }

  const pairById = new Map(pairs.map((pair) => [pair.id, pair]));
  if (pairOrder.some((id) => !pairById.has(id))) return false;

  try {
    const expected = scoreQuestionnaire(
      definition,
      record.responses.ratings,
      record.responses.pairwiseChoices,
    );
    return (
      record.result.strategy === expected.strategy &&
      record.result.scoreName === expected.scoreName &&
      sameNumber(record.result.primaryScore, expected.primaryScore) &&
      sameNumber(record.result.scoreMinimum, expected.scoreMinimum) &&
      sameNumber(record.result.scoreMaximum, expected.scoreMaximum) &&
      definition.items.every(({ id }) =>
        sameNumber(record.result.ratings[id], expected.ratings[id])) &&
      JSON.stringify(record.result.details) === JSON.stringify(expected.details)
    );
  } catch {
    return false;
  }
}

export interface ReconstructedResultExport {
  definition: QuestionnaireDefinition;
  definitionHash: string;
  ratings: Record<string, number>;
  pairwiseChoices: PairResponses;
  pairPresentationOrder: string[];
  score: QuestionnaireScore;
}

/**
 * Reconstructs the administered instrument and response set solely from one
 * exported result record. No built-in questionnaire lookup is used: the
 * definition snapshot is validated, fingerprinted and checked with the stored
 * responses before a copy is returned.
 */
export function reconstructResultExport(value: unknown): ReconstructedResultExport {
  if (!isStudyResultRecord(value)) {
    throw new Error('The result export is invalid or internally inconsistent.');
  }
  const record = value as StudyResultRecord;
  return {
    definition: structuredClone(record.instrument.definition),
    definitionHash: record.instrument.definitionHash,
    ratings: { ...record.responses.ratings },
    pairwiseChoices: { ...record.responses.pairwiseChoices },
    pairPresentationOrder: [...record.responses.pairPresentationOrder],
    score: structuredClone(record.result),
  };
}

function normaliseLegacyStudyResultRecord(value: unknown): StudyResultRecord | null {
  if (!value || typeof value !== 'object') return null;
  const legacy = value as LegacyStudyResultRecordV3;
  if (
    legacy.schemaVersion !== 3 ||
    legacy.prototype?.name !== 'Accessible NASA-TLX' ||
    legacy.prototype?.version !== '0.7.0' ||
    legacy.instrument?.name !== 'NASA Task Load Index' ||
    legacy.instrument?.version !== 'full weighted' ||
    !legacy.responses?.ratings ||
    !legacy.responses?.pairwiseChoices ||
    !Array.isArray(legacy.responses?.pairPresentationOrder) ||
    !legacy.result?.ratings ||
    !legacy.result?.weights ||
    !legacy.result?.adjustedRatings ||
    !legacy.supportMetadata
  ) {
    return null;
  }

  const definition = getQuestionnaireDefinition(DEFAULT_QUESTIONNAIRE_ID);
  if (!definition) return null;

  try {
    const expected = scoreQuestionnaire(
      definition,
      legacy.responses.ratings,
      legacy.responses.pairwiseChoices,
    );
    if (expected.details.kind !== 'weighted-pairwise') {
      return null;
    }
    const expectedDetails = expected.details;
    if (
      !sameNumber(legacy.result.weightedScore, expected.primaryScore) ||
      !definition.items.every(({ id }) =>
        sameNumber(legacy.result.ratings[id], expected.ratings[id]) &&
        sameNumber(legacy.result.weights[id], expectedDetails.weights[id]) &&
        sameNumber(legacy.result.adjustedRatings[id], expectedDetails.adjustedRatings[id]))
    ) {
      return null;
    }

    const migrated: StudyResultRecord = {
      schemaVersion: 4,
      submissionId: legacy.submissionId,
      study: { ...legacy.study },
      participantCode: legacy.participantCode,
      timing: { ...legacy.timing },
      prototype: {
        name: 'Accessible Questionnaire Platform',
        version: PROTOTYPE_VERSION,
      },
      instrument: {
        id: definition.id,
        name: definition.name,
        version: definition.version,
        definitionSchemaVersion: definition.schemaVersion,
        definitionHash: questionnaireDefinitionHash(definition),
        scoringStrategy: definition.scoring.strategy,
        definition: structuredClone(definition),
      },
      collection: { ...legacy.collection },
      configuration: { ...legacy.configuration },
      responses: {
        ratings: { ...legacy.responses.ratings },
        pairwiseChoices: { ...legacy.responses.pairwiseChoices },
        pairPresentationOrder: [...legacy.responses.pairPresentationOrder],
      },
      result: expected,
      supportMetadata: legacy.supportMetadata,
    };
    return isStudyResultRecord(migrated) ? migrated : null;
  } catch {
    return null;
  }
}

export function loadCompletedResults(storage: StorageLike = localStorage): StudyResultRecord[] {
  let current: StudyResultRecord[] = [];
  try {
    const raw = storage.getItem(COMPLETED_RESULTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        current = parsed.filter(
          (candidate): candidate is StudyResultRecord => isStudyResultRecord(candidate),
        );
      }
    }
  } catch {
    current = [];
  }

  let legacyValues: unknown[] | null = null;
  try {
    const raw = storage.getItem(LEGACY_COMPLETED_RESULTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) legacyValues = parsed;
    }
  } catch {
    legacyValues = null;
  }
  if (!legacyValues?.length) return current;

  const migrated = legacyValues
    .map(normaliseLegacyStudyResultRecord)
    .filter((record): record is StudyResultRecord => record !== null);
  if (!migrated.length) return current;

  const merged = new Map(current.map((record) => [record.submissionId, record]));
  migrated.forEach((record) => {
    if (!merged.has(record.submissionId)) merged.set(record.submissionId, record);
  });
  const records = [...merged.values()];
  try {
    storage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify(records));
    if (migrated.length === legacyValues.length) {
      storage.removeItem(LEGACY_COMPLETED_RESULTS_KEY);
    }
  } catch {
    // Return the validated records for recovery, but retain the legacy copy if
    // the browser cannot persist the current schema safely.
  }
  return records;
}

export function saveCompletedResult(record: StudyResultRecord, storage: StorageLike = localStorage) {
  try {
    const records = loadCompletedResults(storage).filter((existing) => existing.submissionId !== record.submissionId);
    records.push(record);
    storage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export function removeCompletedResult(submissionId: string, storage: StorageLike = localStorage) {
  try {
    const records = loadCompletedResults(storage).filter(
      (existing) => existing.submissionId !== submissionId,
    );
    if (records.length === 0) storage.removeItem(COMPLETED_RESULTS_KEY);
    else storage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export function clearCompletedResults(storage: StorageLike = localStorage) {
  storage.removeItem(COMPLETED_RESULTS_KEY);
  storage.removeItem(LEGACY_COMPLETED_RESULTS_KEY);
}

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function resultRow(record: StudyResultRecord): Record<string, unknown> {
  const definition = resultDefinition(record);
  if (!definition) throw new Error(`Unknown questionnaire definition ${record.instrument.id}.`);
  const pairs = buildQuestionnairePairs(definition);
  const row: Record<string, unknown> = {
    schema_version: record.schemaVersion,
    submission_id: record.submissionId,
    study_id: record.study.studyId,
    config_id: record.study.configId,
    participant_code: record.participantCode,
    study_title: record.study.studyTitle,
    task_label: record.study.taskLabel,
    started_at: record.timing.startedAt,
    completed_at: record.timing.completedAt,
    prototype_version: record.prototype.version,
    instrument_id: record.instrument.id,
    instrument_version: record.instrument.version,
    definition_hash: record.instrument.definitionHash,
    scoring_strategy: record.instrument.scoringStrategy,
    embedded_definition: 1,
    questionnaire_definition_json: JSON.stringify(record.instrument.definition),
    instrument_source: definition.source.label,
    instrument_source_url: definition.source.url ?? '',
    collection_mode: record.collection.mode,
    score_name: record.result.scoreName,
    primary_score: record.result.primaryScore,
    score_minimum: record.result.scoreMinimum,
    score_maximum: record.result.scoreMaximum,
  };
  definition.items.forEach(({ id }) => {
    row[`rating_${id}`] = record.result.ratings[id];
    row[`rating_route_${id}`] = record.supportMetadata.ratingInputRoutes[id] ?? '';
    if (record.result.details.kind === 'weighted-pairwise') {
      row[`weight_${id}`] = record.result.details.weights[id];
      row[`weighted_rating_${id}`] = record.result.details.adjustedRatings[id];
    } else {
      row[`score_contribution_${id}`] = record.result.details.contributions[id];
    }
  });
  pairs.forEach(({ id }) => {
    row[`pair_${id}`] = record.responses.pairwiseChoices[id] ?? '';
    row[`pair_route_${id}`] = record.supportMetadata.pairInputRoutes[id] ?? '';
  });
  Object.entries(record.configuration).forEach(([key, value]) => { row[`configured_${key}`] = value; });
  row.final_simple_language = record.supportMetadata.simplerExplanationsShownAtSubmission;
  row.final_answer_mode = record.supportMetadata.answerModeAtSubmission;
  row.final_large_text = record.supportMetadata.largeTextUsedAtSubmission;
  row.final_audio_guidance = record.supportMetadata.automaticAudioGuidanceEnabledAtSubmission;
  row.final_recovery = record.supportMetadata.recoveryEnabledAtSubmission;
  row.interruption_summary_shown = record.supportMetadata.interruptionSummaryShown;
  row.read_aloud_used = record.supportMetadata.readAloudUsed;
  row.gaze_used = record.supportMetadata.gazeUsed;
  row.gaze_action_count = record.supportMetadata.gazeActionCount;
  row.gaze_engine = record.supportMetadata.gazeEngine;
  row.support_change_count = record.supportMetadata.supportChanges.length;
  row.support_changes_json = JSON.stringify(record.supportMetadata.supportChanges);
  row.pair_presentation_order = record.responses.pairPresentationOrder.join('|');
  return row;
}

export function resultsToCsv(records: StudyResultRecord[]) {
  if (records.length === 0) return '';
  const rows = records.map(resultRow);
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return [
    headers.map(csvCell).join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ].join('\r\n');
}

function safeFilePart(value: string) {
  return value.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'questionnaire';
}

export function resultFileBase(record: StudyResultRecord) {
  return `${safeFilePart(record.study.studyId)}-${safeFilePart(record.participantCode)}-${safeFilePart(record.submissionId)}`;
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
