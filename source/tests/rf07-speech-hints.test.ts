import { describe, expect, it } from 'vitest';
import {
  buildRatingValues,
  getQuestionnaireDefinition,
} from '../src/questionnaire-definition';
import {
  buildRatingSpeechHints,
  parseRatingAlternatives,
  parseRatingTranscript,
} from '../src/voice-input';

describe('RF-07 speech proposal and negation safety', () => {
  it('biases the frozen SUS command and its negated safety phrase without wrapper noise', () => {
    const definition = getQuestionnaireDefinition('system-usability-scale')!;
    const item = definition.items[0];
    const values = buildRatingValues(definition);
    const hints = buildRatingSpeechHints(item, values, [], true);

    expect(hints).toContain('4');
    expect(hints).toContain('four');
    expect(hints).toContain('number four');
    expect(hints).toContain('not four');

    expect(hints).not.toContain('option four');
    expect(hints).not.toContain('rating four');
    expect(hints).not.toContain('value four');
    expect(hints).not.toContain('answer four');
    expect(hints).not.toContain('choice four');
    expect(new Set(hints).size).toBe(hints.length);
  });

  it('keeps the frozen SUS number-four proposal valid while rejecting negation homophones', () => {
    const definition = getQuestionnaireDefinition('system-usability-scale')!;
    const item = definition.items[0];
    const values = buildRatingValues(definition);

    expect(parseRatingTranscript('number four', item, values, [])).toBe(4);
    for (const transcript of [
      'not four',
      'note four',
      'knot four',
      'naught four',
      'nought four',
    ]) {
      expect(parseRatingTranscript(transcript, item, values, [])).toBeNull();
    }
  });

  it('lets an unsafe lower-ranked alternative veto an apparently safe four', () => {
    const definition = getQuestionnaireDefinition('system-usability-scale')!;
    const item = definition.items[0];
    const values = buildRatingValues(definition);

    expect(parseRatingAlternatives(['4', 'Note 4'], item, values, [])).toBeNull();
    expect(parseRatingAlternatives(['number four'], item, values, [])).toEqual({
      transcript: 'number four',
      value: 4,
    });
  });
});
