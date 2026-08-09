// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { dimensions, pairs, type DimensionId } from '../src/nasa-tlx';
import {
  createCustomItemDraft,
  createCustomQuestionnaireDefinition,
  createCustomQuestionnaireDraft,
} from '../src/custom-questionnaire';
import { getQuestionnaireDefinition } from '../src/questionnaire-definition';
import { calculateResult, scoreQuestionnaire } from '../src/scoring';
import {
  buildParticipantUrl,
  clearCompletedResults,
  COMPLETED_RESULTS_KEY,
  LEGACY_COMPLETED_RESULTS_KEY,
  createStudyConfig,
  createStudyResultRecord,
  decodeStudyConfig,
  encodeStudyConfig,
  loadCompletedResults,
  normaliseStudyConfig,
  questionnaireDefinitionHash,
  readParticipantCodeFromHash,
  reconstructResultExport,
  removeCompletedResult,
  resultsToCsv,
  saveCompletedResult,
  type SupportMetadata,
} from '../src/study';

const support = {
  showSimpleLanguage: false,
  answerMode: 'standard' as const,
  largeText: true,
  audioGuidance: false,
  recoveryEnabled: true,
  participantAdjustmentPolicy: 'presentation-only' as const,
  voiceInputAvailable: true,
  gazeInputAvailable: false,
};

function config() {
  return createStudyConfig(
    {
      studyId: 'TLX-PILOT-01',
      studyTitle: 'Workload study – café task',
      taskLabel: 'the checkout task',
      showScoreToParticipant: false,
      support,
      collection: { mode: 'local' },
    },
    { configId: 'config-fixed', createdAt: '2026-07-20T12:00:00.000Z' },
  );
}

function record() {
  const ratings = Object.fromEntries(dimensions.map(({ id }) => [id, 50])) as Record<DimensionId, number>;
  const pairwiseChoices = Object.fromEntries(pairs.map((pair) => [pair.id, pair.left]));
  const metadata: SupportMetadata = {
    simplerExplanationsShownAtSubmission: true,
    largeTextUsedAtSubmission: true,
    answerModeAtSubmission: 'standard',
    recoveryEnabledAtSubmission: true,
    interruptionSummaryShown: false,
    readAloudUsed: false,
    automaticAudioGuidanceEnabledAtSubmission: false,
    gazeUsed: false,
    gazeActionCount: 0,
    gazeEngine: null,
    ratingInputRoutes: Object.fromEntries(dimensions.map(({ id }) => [id, 'standard-scale'])),
    pairInputRoutes: Object.fromEntries(pairs.map(({ id }) => [id, 'standard-choice'])),
    supportChanges: [
      {
        setting: 'text-size',
        from: 'standard',
        to: 'large',
        stage: 'intro',
        changedAt: '2026-07-20T12:00:30.000Z',
      },
    ],
  };
  return createStudyResultRecord({
    config: config(),
    participantCode: 'P-001',
    startedAt: '2026-07-20T12:01:00.000Z',
    completedAt: '2026-07-20T12:05:00.000Z',
    submissionId: 'submission-fixed',
    pairPresentationOrder: pairs.map(({ id }) => id),
    pairwiseChoices,
    result: calculateResult(pairs, pairwiseChoices, ratings),
    supportMetadata: metadata,
  });
}

function legacyCompletedRecord() {
  const current = record();
  if (current.result.details.kind !== 'weighted-pairwise') {
    throw new Error('The legacy fixture must use weighted NASA-TLX scoring.');
  }
  return {
    ...current,
    schemaVersion: 3,
    prototype: { name: 'Accessible NASA-TLX', version: '0.7.0' },
    instrument: { name: 'NASA Task Load Index', version: 'full weighted' },
    result: {
      ratings: { ...current.result.ratings },
      weights: { ...current.result.details.weights },
      adjustedRatings: { ...current.result.details.adjustedRatings },
      weightedScore: current.result.primaryScore,
    },
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('study configuration', () => {
  it('round-trips a versioned UTF-8 configuration in the participant-link fragment', () => {
    const source = config();
    const encoded = encodeStudyConfig(source);
    expect(decodeStudyConfig(encoded)).toEqual(source);

    const url = new URL(buildParticipantUrl('https://example.test/index.html?discard=yes', source, 'P-LINK-01'));
    expect(url.search).toBe('');
    expect(url.hash).toContain('study=');
    expect(decodeStudyConfig(new URLSearchParams(url.hash.slice(1)).get('study')!)).toEqual(source);
    expect(readParticipantCodeFromHash(url.hash)).toBe('P-LINK-01');
    expect(source.definitionHash).toBe(
      questionnaireDefinitionHash(getQuestionnaireDefinition(source.instrumentId)!),
    );
    const definition = getQuestionnaireDefinition(source.instrumentId)!;
    const reordered = Object.fromEntries(Object.entries(definition).reverse()) as typeof definition;
    expect(questionnaireDefinitionHash(reordered)).toBe(questionnaireDefinitionHash(definition));
  });

  it('rejects identifiers that could mix study records or contain personal prose', () => {
    expect(() => createStudyConfig({
      studyId: 'invalid study id',
      studyTitle: 'Title',
      taskLabel: 'Task',
      showScoreToParticipant: false,
      support,
      collection: { mode: 'local' },
    })).toThrow(/Study ID/);
  });

  it('migrates a valid Version 0.7 configuration to the weighted NASA definition', () => {
    const current = config();
    const legacy = {
      ...current,
      schemaVersion: 3,
      prototypeVersion: '0.7.0',
    } as Record<string, unknown>;
    delete legacy.instrumentId;
    const migrated = normaliseStudyConfig(legacy);
    expect(migrated?.schemaVersion).toBe(4);
    expect(migrated?.prototypeVersion).toBe('0.8.0');
    expect(migrated?.instrumentId).toBe('nasa-tlx-weighted');
    expect(migrated?.configId).toBe(current.configId);
  });

  it('refuses instrument-incompatible support instead of silently changing SUS', () => {
    expect(() => createStudyConfig({
      instrumentId: 'system-usability-scale',
      studyId: 'SUS-01',
      studyTitle: 'SUS study',
      taskLabel: 'using the test system',
      showScoreToParticipant: false,
      support: { ...support, answerMode: 'smiley' },
      collection: { mode: 'local' },
    })).toThrow(/not compatible/i);
  });

  it('round-trips a researcher-supplied definition inside the reproducible participant configuration', () => {
    const draft = createCustomQuestionnaireDraft();
    draft.name = 'Two-item task check';
    draft.shortName = 'TTC';
    draft.items = [
      createCustomItemDraft({
        name: 'Clear',
        prompt: 'The task was clear.',
        lowAnchor: 'Not clear',
        highAnchor: 'Very clear',
      }),
      createCustomItemDraft({
        name: 'Easy',
        prompt: 'The task was easy.',
        lowAnchor: 'Not easy',
        highAnchor: 'Very easy',
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const customConfig = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'CUSTOM-01',
      studyTitle: 'Custom questionnaire study',
      taskLabel: 'using the prototype',
      showScoreToParticipant: false,
      support: {
        ...support,
        showSimpleLanguage: false,
        answerMode: 'standard',
      },
      collection: { mode: 'local' },
    });
    expect(decodeStudyConfig(encodeStudyConfig(customConfig))).toEqual(customConfig);
    expect(customConfig.questionnaireDefinition).toEqual(definition);
    const alteredDefinition = {
      ...definition,
      items: definition.items.map((item, index) => index === 0
        ? { ...item, prompt: 'This text was altered after link generation.' }
        : item),
    };
    const tamperedJson = JSON.stringify({
      ...customConfig,
      questionnaireDefinition: alteredDefinition,
    });
    const tamperedBytes = new TextEncoder().encode(tamperedJson);
    let tamperedBinary = '';
    tamperedBytes.forEach((byte) => { tamperedBinary += String.fromCharCode(byte); });
    const tamperedEncoded = btoa(tamperedBinary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
    expect(decodeStudyConfig(tamperedEncoded)).toBeNull();
    expect(() => createStudyConfig({
      ...customConfig,
      questionnaireDefinition: {
        ...definition,
        id: 'custom-different',
      },
    })).toThrow(/supported questionnaire/i);
  });
});

describe('completed result records', () => {
  it('reconstructs the complete instrument and response set from one JSON export alone', () => {
    const exported = JSON.parse(JSON.stringify(record()));
    const reconstructed = reconstructResultExport(exported);
    const expectedDefinition = getQuestionnaireDefinition('nasa-tlx-weighted')!;

    expect(reconstructed.definition).toEqual(expectedDefinition);
    expect(reconstructed.definitionHash).toBe(questionnaireDefinitionHash(expectedDefinition));
    expect(reconstructed.ratings).toEqual(exported.responses.ratings);
    expect(reconstructed.pairwiseChoices).toEqual(exported.responses.pairwiseChoices);
    expect(reconstructed.pairPresentationOrder).toEqual(exported.responses.pairPresentationOrder);
    expect(reconstructed.score).toEqual(exported.result);
  });

  it('refuses submission when the configuration fingerprint is stale', () => {
    const validRecord = record();
    const staleConfig = {
      ...config(),
      definitionHash: `sha256:${'0'.repeat(64)}`,
    };

    expect(() => createStudyResultRecord({
      config: staleConfig,
      participantCode: validRecord.participantCode,
      startedAt: validRecord.timing.startedAt,
      completedAt: validRecord.timing.completedAt,
      pairPresentationOrder: validRecord.responses.pairPresentationOrder,
      pairwiseChoices: validRecord.responses.pairwiseChoices,
      result: validRecord.result,
      supportMetadata: validRecord.supportMetadata,
    })).toThrow(/definition does not match the saved study configuration/i);
  });

  it('migrates a validated Version 0.7 completed backup without changing its answers or score', () => {
    const legacy = legacyCompletedRecord();
    localStorage.setItem(LEGACY_COMPLETED_RESULTS_KEY, JSON.stringify([legacy]));

    const [migrated] = loadCompletedResults();

    expect(migrated).toMatchObject({
      schemaVersion: 4,
      submissionId: legacy.submissionId,
      participantCode: legacy.participantCode,
      instrument: {
        id: 'nasa-tlx-weighted',
        scoringStrategy: 'nasa-tlx-weighted-v1',
      },
      responses: legacy.responses,
      result: { primaryScore: 50 },
    });
    expect(JSON.parse(localStorage.getItem(COMPLETED_RESULTS_KEY)!)).toHaveLength(1);
    expect(localStorage.getItem(LEGACY_COMPLETED_RESULTS_KEY)).toBeNull();
  });

  it('preserves an invalid Version 0.7 completed backup instead of guessing or deleting it', () => {
    const legacy = legacyCompletedRecord();
    legacy.result.weightedScore = 99;
    const raw = JSON.stringify([legacy]);
    localStorage.setItem(LEGACY_COMPLETED_RESULTS_KEY, raw);

    expect(loadCompletedResults()).toEqual([]);
    expect(localStorage.getItem(COMPLETED_RESULTS_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_COMPLETED_RESULTS_KEY)).toBe(raw);
  });

  it('stores a complete pseudonymous record and prevents duplicate submission IDs', () => {
    const result = record();
    expect(saveCompletedResult(result)).toBe(true);
    expect(saveCompletedResult(result)).toBe(true);
    const stored = loadCompletedResults();
    expect(stored).toHaveLength(1);
    expect(stored[0].participantCode).toBe('P-001');
    expect(Object.keys(stored[0].responses.pairwiseChoices)).toHaveLength(15);
    expect(stored[0].result.primaryScore).toBe(50);
    clearCompletedResults();
    expect(loadCompletedResults()).toEqual([]);
  });

  it('removes only the identified stale backup when an answer is edited before retry', () => {
    const first = record();
    const second = { ...record(), submissionId: 'submission-second' };
    expect(saveCompletedResult(first)).toBe(true);
    expect(saveCompletedResult(second)).toBe(true);
    expect(removeCompletedResult(first.submissionId)).toBe(true);
    expect(loadCompletedResults().map(({ submissionId }) => submissionId)).toEqual([
      'submission-second',
    ]);
  });

  it('reports a blocked or full browser store without throwing', () => {
    const unavailableStorage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      },
      removeItem: () => undefined,
    };
    expect(saveCompletedResult(record(), unavailableStorage)).toBe(false);
  });

  it('rejects a structurally plausible record when its calculated result was altered', () => {
    const altered = record();
    altered.result = { ...altered.result, primaryScore: 99 };
    localStorage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify([altered]));
    expect(loadCompletedResults()).toEqual([]);
  });

  it('rejects a record whose definition fingerprint no longer matches the configured instrument', () => {
    const altered = record();
    altered.instrument.definitionHash = `sha256:${'0'.repeat(64)}`;
    localStorage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify([altered]));
    expect(loadCompletedResults()).toEqual([]);
  });

  it('rejects undeclared answer keys rather than hiding them in a plausible record', () => {
    const altered = record();
    altered.responses.ratings.unregistered_item = 50;
    altered.result.ratings.unregistered_item = 50;
    localStorage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify([altered]));
    expect(loadCompletedResults()).toEqual([]);
  });

  it('rejects an impossible support-change value instead of accepting corrupted provenance', () => {
    const altered = record();
    altered.supportMetadata.supportChanges[0].to = 'smiley';
    localStorage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify([altered]));
    expect(loadCompletedResults()).toEqual([]);
  });

  it('exports stable CSV columns for scores, ratings, weights, pair choices and routes', () => {
    const csv = resultsToCsv([record()]);
    const [header, row] = csv.split('\r\n');
    expect(header).toContain('participant_code');
    expect(header).toContain('definition_hash');
    expect(header).toContain('rating_mental');
    expect(header).toContain('weight_performance');
    expect(header).toContain('pair_mental-physical');
    expect(header).toContain('rating_route_frustration');
    expect(header).toContain('configured_gazeInputAvailable');
    expect(header).toContain('support_change_count');
    expect(row).toContain('P-001');
  });

  it('exports a union of NASA and SUS fields without dropping either instrument', () => {
    const definition = getQuestionnaireDefinition('system-usability-scale')!;
    const susRatings = Object.fromEntries(
      definition.items.map((item, index) => [item.id, index % 2 === 0 ? 5 : 1]),
    );
    const susConfig = createStudyConfig({
      instrumentId: definition.id,
      studyId: 'SUS-CSV-01',
      studyTitle: 'SUS CSV study',
      taskLabel: 'using the test system',
      showScoreToParticipant: false,
      support: {
        ...support,
        showSimpleLanguage: false,
        largeText: false,
      },
      collection: { mode: 'local' },
    });
    const susRecord = createStudyResultRecord({
      config: susConfig,
      participantCode: 'P-SUS-01',
      startedAt: '2026-07-27T12:00:00.000Z',
      completedAt: '2026-07-27T12:03:00.000Z',
      pairPresentationOrder: [],
      pairwiseChoices: {},
      result: scoreQuestionnaire(definition, susRatings),
      supportMetadata: {
        ...record().supportMetadata,
        simplerExplanationsShownAtSubmission: false,
        largeTextUsedAtSubmission: false,
        ratingInputRoutes: Object.fromEntries(
          definition.items.map(({ id }) => [id, 'standard-scale']),
        ),
        pairInputRoutes: {},
        supportChanges: [],
      },
    });
    const csv = resultsToCsv([record(), susRecord]);
    const [header, nasaRow, susRow] = csv.split('\r\n');
    expect(header).toContain('rating_mental');
    expect(header).toContain('weight_mental');
    expect(header).toContain('rating_sus01');
    expect(header).toContain('score_contribution_sus01');
    expect(nasaRow).toContain('nasa-tlx-weighted');
    expect(susRow).toContain('system-usability-scale');
  });

  it('validates and exports a custom questionnaire record with its immutable definition snapshot', () => {
    const draft = createCustomQuestionnaireDraft();
    draft.name = 'Task confidence check';
    draft.shortName = 'TCC';
    draft.items = [
      createCustomItemDraft({
        name: 'Confidence',
        prompt: 'I was confident.',
        lowAnchor: 'Not confident',
        highAnchor: 'Very confident',
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const customConfig = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'CUSTOM-RESULT-01',
      studyTitle: 'Custom result study',
      taskLabel: 'using the test system',
      showScoreToParticipant: false,
      support: {
        ...support,
        showSimpleLanguage: false,
        answerMode: 'standard',
      },
      collection: { mode: 'local' },
    });
    const customRecord = createStudyResultRecord({
      config: customConfig,
      participantCode: 'P-CUSTOM-01',
      startedAt: '2026-07-29T12:00:00.000Z',
      completedAt: '2026-07-29T12:01:00.000Z',
      pairPresentationOrder: [],
      pairwiseChoices: {},
      result: scoreQuestionnaire(definition, { 'item-01': 4 }),
      supportMetadata: {
        ...record().supportMetadata,
        simplerExplanationsShownAtSubmission: false,
        answerModeAtSubmission: 'standard',
        ratingInputRoutes: { 'item-01': 'standard-scale' },
        pairInputRoutes: {},
        supportChanges: [],
      },
    });
    expect(customRecord.instrument.definition).toEqual(definition);
    expect(saveCompletedResult(customRecord)).toBe(true);
    expect(loadCompletedResults()).toContainEqual(customRecord);
    const csv = resultsToCsv([customRecord]);
    expect(csv).toContain('questionnaire_definition_json');
    expect(csv).toContain('custom-tcc');
    expect(csv).toContain('rating_item-01');
  });
});
