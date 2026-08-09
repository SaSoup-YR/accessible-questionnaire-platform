import { describe, expect, it } from 'vitest';
import {
  builtInQuestionnaires,
  buildQuestionnairePairs,
  buildRatingValues,
  getQuestionnaireDefinition,
  validateQuestionnaireDefinition,
} from '../src/questionnaire-definition';
import { scoreQuestionnaire, type Ratings } from '../src/scoring';

describe('declarative questionnaire definitions', () => {
  it('validates four structurally different built-in instruments', () => {
    expect(builtInQuestionnaires.map(({ id }) => id)).toEqual([
      'nasa-tlx-raw',
      'nasa-tlx-weighted',
      'system-usability-scale',
      'user-experience-questionnaire-short',
    ]);
    const weighted = getQuestionnaireDefinition('nasa-tlx-weighted')!;
    const raw = getQuestionnaireDefinition('nasa-tlx-raw')!;
    const sus = getQuestionnaireDefinition('system-usability-scale')!;
    const ueqs = getQuestionnaireDefinition('user-experience-questionnaire-short')!;
    expect(buildRatingValues(weighted)).toHaveLength(21);
    expect(buildQuestionnairePairs(weighted)).toHaveLength(15);
    expect(buildRatingValues(raw)).toHaveLength(21);
    expect(buildQuestionnairePairs(raw)).toEqual([]);
    expect(buildRatingValues(sus)).toEqual([1, 2, 3, 4, 5]);
    expect(buildQuestionnairePairs(sus)).toEqual([]);
    expect(buildRatingValues(ueqs)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(buildQuestionnairePairs(ueqs)).toEqual([]);
    expect(ueqs.scale.type).toBe('semantic-differential');
  });

  it('rejects executable or scorer-incompatible definitions', () => {
    const base = structuredClone(getQuestionnaireDefinition('system-usability-scale')) as any;
    base.scoreFunction = 'return 100';
    expect(() => validateQuestionnaireDefinition(base)).toThrow(/unsupported field/i);

    const incompatible = structuredClone(getQuestionnaireDefinition('system-usability-scale')) as any;
    incompatible.scoring.strategy = 'nasa-tlx-weighted-v1';
    expect(() => validateQuestionnaireDefinition(incompatible)).toThrow(/NASA-TLX scorer requires/i);
  });

  it('calculates the published alternating SUS rule through the scorer allowlist', () => {
    const sus = getQuestionnaireDefinition('system-usability-scale')!;
    const ratings = Object.fromEntries(
      sus.items.map((item, index) => [item.id, index % 2 === 0 ? 5 : 1]),
    ) as Ratings;
    const result = scoreQuestionnaire(sus, ratings);
    expect(result.strategy).toBe('sus-standard-v1');
    expect(result.primaryScore).toBe(100);
    expect(result.scoreName).toBe('SUS score');
    expect(result.details.kind).toBe('sus-contributions');
  });

  it('reproduces the supervisor-checked SUS score of 50', () => {
    const sus = getQuestionnaireDefinition('system-usability-scale')!;
    const vector = [5, 1, 4, 2, 3, 5, 1, 4, 2, 3];
    const ratings = Object.fromEntries(
      sus.items.map((item, index) => [item.id, vector[index]]),
    ) as Ratings;
    expect(scoreQuestionnaire(sus, ratings).primaryScore).toBe(50);
  });

  it('calculates Raw TLX as the unweighted mean of the six ratings', () => {
    const raw = getQuestionnaireDefinition('nasa-tlx-raw')!;
    const ratings = Object.fromEntries(
      raw.items.map((item, index) => [item.id, index * 20]),
    ) as Ratings;
    const result = scoreQuestionnaire(raw, ratings);
    expect(result.strategy).toBe('nasa-tlx-raw-v1');
    expect(result.primaryScore).toBe(50);
    expect(result.details.kind).toBe('raw-mean');
  });

  it('calculates UEQ-S overall, pragmatic and hedonic scores on the centred scale', () => {
    const ueqs = getQuestionnaireDefinition('user-experience-questionnaire-short')!;
    const ratings = Object.fromEntries(
      ueqs.items.map((item, index) => [item.id, index < 4 ? 7 : 1]),
    ) as Ratings;
    const result = scoreQuestionnaire(ueqs, ratings);
    expect(result.strategy).toBe('ueqs-standard-v1');
    expect(result.primaryScore).toBe(0);
    expect(result.details).toEqual({
      kind: 'ueqs-subscales',
      contributions: {
        ueqs01: 3,
        ueqs02: 3,
        ueqs03: 3,
        ueqs04: 3,
        ueqs05: -3,
        ueqs06: -3,
        ueqs07: -3,
        ueqs08: -3,
      },
      pragmaticQuality: 3,
      hedonicQuality: -3,
    });
  });
});
