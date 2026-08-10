import { describe, expect, it } from 'vitest';
import { assertPublicQuestionnaireInventory } from '../scripts/public-questionnaire-policy.mjs';

describe('public questionnaire release policy', () => {
  it('accepts the current distributable inventory', () => {
    expect(() => assertPublicQuestionnaireInventory([
      'questionnaire-definition.schema.json',
      'nasa-tlx-weighted.questionnaire.json',
      'nasa-tlx-raw.questionnaire.json',
      'system-usability-scale.questionnaire.json',
    ])).not.toThrow();
  });

  it('blocks accidental restoration of the removed public UEQ-S definition', () => {
    expect(() => assertPublicQuestionnaireInventory([
      'user-experience-questionnaire-short.questionnaire.json',
    ])).toThrow(/no archived permission covers public repository and deployment redistribution/i);
  });
});
