// @vitest-environment jsdom
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import '../src/accessible-nasa-tlx';
import type { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import { createCustomQuestionnaireDefinition } from '../src/custom-questionnaire';
import { reviewQuestionnaireExport } from '../src/platform-questionnaire-import';
import {
  buildQuestionnairePairs,
  getQuestionnaireDefinition,
  validateQuestionnaireDefinition,
  type QuestionnaireDefinition,
} from '../src/questionnaire-definition';
import {
  buildParticipantUrl,
  createStudyConfig,
  questionnaireDefinitionHash,
  reconstructResultExport,
  type StudyResultRecord,
} from '../src/study';

type ExpectedItem = {
  id: string;
  name: string;
  text: string;
  low: string;
  high: string;
};

type ResponseSet = {
  storedValues: number[];
  labels: Record<string, string>;
};

type FidelityCase = {
  caseId: string;
  kind: 'built-in' | 'import';
  instrumentId?: string;
  fixture?: string;
  itemSet: string;
  responseSet: string;
  required: boolean;
  scoring: {
    rule: string;
    scoreName: string;
    ratings: number[];
    pairChoice?: 'left';
    expectedScore: number;
  };
};

type FidelityTruth = {
  responseSets: Record<string, ResponseSet>;
  itemSets: Record<string, ExpectedItem[]>;
  cases: FidelityCase[];
};

type Mismatch = {
  field: string;
  expected: unknown;
  actual: unknown;
};

type FidelityResult = {
  caseId: string;
  source: string;
  instrumentId: string;
  itemsChecked: number;
  fieldComparisons: number;
  mismatches: Mismatch[];
};

type NegativeOutcome =
  | 'refused-specific'
  | 'refused-generic'
  | 'accepted-documented-loss'
  | 'silently-altered';

type NegativeResult = {
  adversarialInput: string;
  outcome: NegativeOutcome;
  message: string;
};

const truth = JSON.parse(readFileSync(
  resolve(process.cwd(), '../docs/evidence/fidelity-source-of-truth.json'),
  'utf8',
)) as FidelityTruth;

const fixture = (name: string) =>
  readFileSync(resolve(import.meta.dirname, 'fixtures', name), 'utf8');

const fidelityResults: FidelityResult[] = [];
const completedRecords = new Map<string, StudyResultRecord>();
const negativeResults: NegativeResult[] = [];
const reconstructionResults: Array<{
  caseId: string;
  itemsReconstructed: number;
  responseValuesReconstructed: number;
  mismatches: Mismatch[];
}> = [];

function compactText(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function pushComparison(
  mismatches: Mismatch[],
  field: string,
  expected: unknown,
  actual: unknown,
) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    mismatches.push({ field, expected, actual });
  }
}

function expectedAccessibleLabels(
  definition: QuestionnaireDefinition,
  item: ExpectedItem,
  responseSet: ResponseSet,
) {
  return responseSet.storedValues.map((value, index) => {
    const token = responseSet.labels[String(value)];
    const declared = token === '$LOW' ? item.low : token === '$HIGH' ? item.high : token;
    const label = declared && declared !== String(value) ? declared : null;
    if (definition.scale.type === 'semantic-differential') {
      return label
        ? `Position ${index + 1} of ${responseSet.storedValues.length}, ${label}, for ${item.name}`
        : `Position ${index + 1} of ${responseSet.storedValues.length}, between ${item.low} and ${item.high}, for ${item.name}`;
    }
    return label ? `${value}, ${label}, for ${item.name}` : `${value} for ${item.name}`;
  });
}

function definitionFor(testCase: FidelityCase) {
  if (testCase.kind === 'built-in') {
    const definition = getQuestionnaireDefinition(testCase.instrumentId ?? '');
    if (!definition) throw new Error(`Missing built-in definition ${testCase.instrumentId}.`);
    return { definition, source: `instruments/${testCase.instrumentId}.questionnaire.json`, embedded: false };
  }
  const contents = fixture(testCase.fixture!);
  const review = reviewQuestionnaireExport(contents, testCase.fixture!);
  if (!review.canConvert || !review.draft || review.unsupported.length) {
    throw new Error(
      `${testCase.fixture} did not produce one supported reviewed definition: ` +
      review.unsupported.map(({ code }) => code).join(', '),
    );
  }
  return {
    definition: createCustomQuestionnaireDefinition(review.draft),
    source: `tests/fixtures/${testCase.fixture}`,
    embedded: true,
  };
}

function primaryButton(component: AccessibleNasaTlx, text: string) {
  const button = [...component.querySelectorAll<HTMLButtonElement>('button')]
    .find((candidate) => compactText(candidate.textContent).includes(text));
  if (!button) throw new Error(`Could not find button containing “${text}”.`);
  return button;
}

async function runFidelityCase(testCase: FidelityCase) {
  document.body.replaceChildren();
  localStorage.clear();
  sessionStorage.clear();
  const { definition, source, embedded } = definitionFor(testCase);
  const expectedItems = truth.itemSets[testCase.itemSet];
  const responseSet = truth.responseSets[testCase.responseSet];
  if (!expectedItems || !responseSet) throw new Error(`Incomplete truth sheet for ${testCase.caseId}.`);
  const config = createStudyConfig({
    instrumentId: definition.id,
    ...(embedded ? { questionnaireDefinition: definition } : {}),
    studyId: `FIDELITY-${testCase.caseId}`.slice(0, 64),
    studyTitle: `Fidelity ${testCase.caseId}`,
    taskLabel: 'using the technical test interface',
    showScoreToParticipant: true,
    support: {
      showSimpleLanguage: false,
      answerMode: 'standard',
      largeText: false,
      audioGuidance: false,
      recoveryEnabled: false,
      participantAdjustmentPolicy: 'locked',
      voiceInputAvailable: false,
      gazeInputAvailable: false,
    },
    collection: { mode: 'local' },
  }, {
    configId: `config-${testCase.caseId}`,
    createdAt: '2026-08-09T00:00:00.000Z',
  });
  const participantCode = `P-${testCase.caseId}`.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
  const url = new URL(buildParticipantUrl('https://example.test/index.html', config, participantCode));
  window.history.replaceState({}, '', `${url.pathname}${url.hash}`);

  const component = document.createElement('accessible-questionnaire') as AccessibleNasaTlx;
  let completed: StudyResultRecord | null = null;
  component.addEventListener('questionnaire-complete', (event) => {
    completed = (event as CustomEvent<StudyResultRecord>).detail;
  });
  document.body.append(component);
  await component.updateComplete;
  primaryButton(component, 'Start').click();
  await component.updateComplete;

  const mismatches: Mismatch[] = [];
  let fieldComparisons = 0;
  const renderedOrder: string[] = [];
  for (let index = 0; index < expectedItems.length; index += 1) {
    const expectedItem = expectedItems[index];
    const inputs = [...component.querySelectorAll<HTMLInputElement>(
      '.rating-fieldset input[type="radio"]',
    )];
    const actualId = inputs[0]?.name.replace(/^rating-/, '') ?? '';
    const actualName = compactText(component.querySelector('#rating-heading')?.textContent);
    const actualText = compactText(component.querySelector('.official-definition > span')?.textContent);
    const actualValues = inputs.map(({ value }) => Number(value));
    const actualLabels = inputs.map((input) => input.getAttribute('aria-label'));
    const actualRequired = inputs.some((input) => input.required);
    renderedOrder.push(actualId);

    const comparisons: Array<[string, unknown, unknown]> = [
      [`items[${index}].id`, expectedItem.id, actualId],
      [`items[${index}].name`, expectedItem.name, actualName],
      [`items[${index}].text`, expectedItem.text, actualText],
      [`items[${index}].storedValues`, responseSet.storedValues, actualValues],
      [
        `items[${index}].responseLabels`,
        expectedAccessibleLabels(definition, expectedItem, responseSet),
        actualLabels,
      ],
      [`items[${index}].required`, testCase.required, actualRequired],
    ];
    comparisons.forEach(([field, expected, actual]) => {
      fieldComparisons += 1;
      pushComparison(mismatches, field, expected, actual);
    });

    const chosen = inputs.find(({ value }) => Number(value) === testCase.scoring.ratings[index]);
    if (!chosen) throw new Error(`${testCase.caseId} has no stored value ${testCase.scoring.ratings[index]}.`);
    chosen.click();
    await component.updateComplete;
    primaryButton(component, index === expectedItems.length - 1
      ? definition.pairwise ? 'Continue to comparisons' : 'Review responses'
      : 'Next question').click();
    await component.updateComplete;
  }

  fieldComparisons += 1;
  pushComparison(mismatches, 'itemOrder', expectedItems.map(({ id }) => id), renderedOrder);

  const pairCount = buildQuestionnairePairs(definition).length;
  for (let index = 0; index < pairCount; index += 1) {
    component.querySelector<HTMLInputElement>('.choice-fieldset input[type="radio"]')!.click();
    await component.updateComplete;
    primaryButton(component, index === pairCount - 1 ? 'Review responses' : 'Next question').click();
    await component.updateComplete;
  }

  const reviewTexts = [...component.querySelectorAll('.review-rating-card .review-item-prompt')]
    .map((element) => compactText(element.textContent));
  fieldComparisons += 1;
  pushComparison(mismatches, 'review.itemText', expectedItems.map(({ text }) => text), reviewTexts);
  primaryButton(component, 'Calculate and submit responses').click();
  await component.updateComplete;
  if (!completed) throw new Error(`${testCase.caseId} did not create a result record.`);
  const record = completed as StudyResultRecord;

  const scoreComparisons: Array<[string, unknown, unknown]> = [
    ['scoring.rule', testCase.scoring.rule, record.instrument.scoringStrategy],
    ['scoring.reportedScoreName', testCase.scoring.scoreName, record.result.scoreName],
    ['scoring.reportedScoreNameVisible', true, compactText(component.textContent).includes(testCase.scoring.scoreName)],
    ['scoring.expectedScore', testCase.scoring.expectedScore, record.result.primaryScore],
  ];
  scoreComparisons.forEach(([field, expected, actual]) => {
    fieldComparisons += 1;
    pushComparison(mismatches, field, expected, actual);
  });

  fidelityResults.push({
    caseId: testCase.caseId,
    source,
    instrumentId: definition.id,
    itemsChecked: expectedItems.length,
    fieldComparisons,
    mismatches,
  });
  completedRecords.set(testCase.caseId, record);
  component.remove();
  return mismatches;
}

function qsfWith(mutator: (qsf: any) => void) {
  const qsf = JSON.parse(fixture('qualtrics-rating.qsf'));
  mutator(qsf);
  return JSON.stringify(qsf);
}

function qsfQuestion(qsf: any) {
  return qsf.SurveyElements.find((element: any) => element.PrimaryAttribute === 'QID_CONTROL');
}

function qsfBlockItem(qsf: any) {
  const block = qsf.SurveyElements.find((element: any) => element.Element === 'BL');
  return block.Payload[0].BlockElements[0];
}

function refusalFromReview(contents: string, fileName: string) {
  const review = reviewQuestionnaireExport(contents, fileName);
  if (!review.canConvert || review.unsupported.length) {
    return {
      outcome: 'refused-specific' as const,
      message: review.unsupported.map(({ code, title }) => `${code}: ${title}`).join('; '),
    };
  }
  if (review.confirmations.length) {
    return {
      outcome: 'accepted-documented-loss' as const,
      message: review.confirmations.map(({ code, title }) => `${code}: ${title}`).join('; '),
    };
  }
  return { outcome: 'silently-altered' as const, message: 'The input was accepted without a refusal or declared loss.' };
}

function thrownOutcome(action: () => unknown, generic = false) {
  try {
    action();
    return { outcome: 'silently-altered' as const, message: 'The input was accepted without a refusal.' };
  } catch (error) {
    return {
      outcome: (generic ? 'refused-generic' : 'refused-specific') as NegativeOutcome,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

function recordNegative(adversarialInput: string, result: { outcome: NegativeOutcome; message: string }) {
  negativeResults.push({ adversarialInput, ...result });
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', { value: () => undefined, writable: true });
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/index.html');
});

afterAll(() => {
  const output = resolve(process.cwd(), '../docs/evidence/technical-evaluation-report.json');
  const fidelityMismatches = fidelityResults.reduce((total, result) => total + result.mismatches.length, 0);
  const silentlyAltered = negativeResults.filter(({ outcome }) => outcome === 'silently-altered').length;
  const reconstructionMismatches = reconstructionResults.reduce(
    (total, result) => total + result.mismatches.length,
    0,
  );
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify({
    schemaVersion: 1,
    evidenceType: 'quantified technical fidelity evaluation',
    generatedAt: new Date().toISOString(),
    revision: process.env.GITHUB_SHA ?? 'local-uncommitted',
    sourceOfTruth: 'docs/evidence/fidelity-source-of-truth.json',
    fidelity: {
      cases: fidelityResults.length,
      itemsChecked: fidelityResults.reduce((total, result) => total + result.itemsChecked, 0),
      fieldComparisons: fidelityResults.reduce((total, result) => total + result.fieldComparisons, 0),
      mismatches: fidelityMismatches,
      results: fidelityResults,
    },
    negativeBattery: {
      adversarialInputs: negativeResults.length,
      refusedWithSpecificMessage: negativeResults.filter(({ outcome }) => outcome === 'refused-specific').length,
      refusedWithGenericMessage: negativeResults.filter(({ outcome }) => outcome === 'refused-generic').length,
      acceptedWithDocumentedLoss: negativeResults.filter(({ outcome }) => outcome === 'accepted-documented-loss').length,
      silentlyAltered,
      results: negativeResults,
    },
    exportReconstruction: {
      exportsChecked: reconstructionResults.length,
      itemsReconstructed: reconstructionResults.reduce((total, result) => total + result.itemsReconstructed, 0),
      responseValuesReconstructed: reconstructionResults.reduce(
        (total, result) => total + result.responseValuesReconstructed,
        0,
      ),
      mismatches: reconstructionMismatches,
      results: reconstructionResults,
    },
    interpretation:
      'This report tests fidelity, refusal safety and provenance. It does not provide evidence of benefit for disabled users or questionnaire score equivalence across presentation modes.',
  }, null, 2)}\n`, 'utf8');
});

describe('quantified technical evaluation', () => {
  it('round-trips every built-in instrument and every committed QSF/LSS/LSG/LSQ fixture', async () => {
    for (const testCase of truth.cases) {
      expect(await runFidelityCase(testCase), testCase.caseId).toEqual([]);
    }
    expect(fidelityResults).toHaveLength(9);
    expect(fidelityResults.reduce((total, result) => total + result.itemsChecked, 0)).toBe(39);
  });

  it('refuses or documents every pre-specified adversarial input without silent alteration', () => {
    const sus = structuredClone(getQuestionnaireDefinition('system-usability-scale')!) as any;
    sus.scoreFunction = 'return 100';
    recordNegative('executable field', thrownOutcome(() => validateQuestionnaireDefinition(sus)));

    const incompatible = structuredClone(getQuestionnaireDefinition('system-usability-scale')!) as any;
    incompatible.scoring.strategy = 'nasa-tlx-weighted-v1';
    recordNegative('incompatible scoring', thrownOutcome(() => validateQuestionnaireDefinition(incompatible)));

    recordNegative('mixed scales within one instrument', refusalFromReview(qsfWith((qsf) => {
      qsfQuestion(qsf).Payload.RecodeValues['5'] = '6';
    }), 'mixed-scales.qsf'));

    recordNegative('display logic', refusalFromReview(qsfWith((qsf) => {
      qsfQuestion(qsf).Payload.DisplayLogic = { Type: 'BooleanExpression' };
    }), 'display-logic.qsf'));

    recordNegative('skip logic', refusalFromReview(qsfWith((qsf) => {
      qsfBlockItem(qsf).SkipLogic = [{ Condition: 'Selected' }];
    }), 'skip-logic.qsf'));

    recordNegative('randomisation', refusalFromReview(qsfWith((qsf) => {
      qsfQuestion(qsf).Payload.Randomization = { Advanced: true };
    }), 'randomisation.qsf'));

    recordNegative('carry forward', refusalFromReview(qsfWith((qsf) => {
      qsfQuestion(qsf).Payload.CarryForward = { Type: 'SelectedChoices' };
    }), 'carry-forward.qsf'));

    recordNegative('non-forced response', refusalFromReview(qsfWith((qsf) => {
      qsfQuestion(qsf).Payload.Validation.Settings.ForceResponse = 'OFF';
    }), 'optional-question.qsf'));

    recordNegative('unsupported question type', refusalFromReview(qsfWith((qsf) => {
      qsfQuestion(qsf).Payload.Selector = 'MAVR';
    }), 'unsupported-type.qsf'));

    const oversized = structuredClone(getQuestionnaireDefinition('system-usability-scale')!) as any;
    oversized.id = 'oversized-definition';
    oversized.items = Array.from({ length: 101 }, (_, index) => ({
      ...oversized.items[0],
      id: `item-${String(index + 1).padStart(3, '0')}`,
      name: `Item ${index + 1}`,
    }));
    recordNegative('oversized definition', thrownOutcome(() => validateQuestionnaireDefinition(oversized)));

    recordNegative('malformed XML', thrownOutcome(
      () => reviewQuestionnaireExport('<document>', 'malformed.lss'),
      true,
    ));
    const completeLss = fixture('limesurvey-rating.lss');
    recordNegative('truncated file', thrownOutcome(
      () => reviewQuestionnaireExport(completeLss.slice(0, -80), 'truncated.lss'),
      true,
    ));

    expect(negativeResults).toHaveLength(12);
    expect(negativeResults.filter(({ outcome }) => outcome === 'silently-altered')).toEqual([]);
    expect(negativeResults.every(({ message }) => message.trim().length > 0)).toBe(true);
  });

  it('reconstructs every instrument and response set from its result export alone', () => {
    expect(completedRecords.size).toBe(truth.cases.length);
    for (const testCase of truth.cases) {
      const record = completedRecords.get(testCase.caseId)!;
      const expectedItems = truth.itemSets[testCase.itemSet];
      const reconstructed = reconstructResultExport(JSON.parse(JSON.stringify(record)));
      const mismatches: Mismatch[] = [];
      pushComparison(
        mismatches,
        'definitionHash',
        questionnaireDefinitionHash(reconstructed.definition),
        reconstructed.definitionHash,
      );
      pushComparison(
        mismatches,
        'itemOrder',
        expectedItems.map(({ id }) => id),
        reconstructed.definition.items.map(({ id }) => id),
      );
      pushComparison(
        mismatches,
        'itemText',
        expectedItems.map(({ text }) => text),
        reconstructed.definition.items.map(({ prompt }) => prompt),
      );
      pushComparison(
        mismatches,
        'ratings',
        testCase.scoring.ratings,
        reconstructed.definition.items.map(({ id }) => reconstructed.ratings[id]),
      );
      pushComparison(mismatches, 'scoringRule', testCase.scoring.rule, reconstructed.score.strategy);
      pushComparison(mismatches, 'scoreName', testCase.scoring.scoreName, reconstructed.score.scoreName);
      pushComparison(mismatches, 'reportedScore', testCase.scoring.expectedScore, reconstructed.score.primaryScore);
      reconstructionResults.push({
        caseId: testCase.caseId,
        itemsReconstructed: reconstructed.definition.items.length,
        responseValuesReconstructed: Object.keys(reconstructed.ratings).length,
        mismatches,
      });
      expect(mismatches, testCase.caseId).toEqual([]);
    }
  });
});
