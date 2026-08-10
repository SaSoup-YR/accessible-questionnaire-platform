import { describe, expect, it } from 'vitest';
import { dimensions, pairs, ratingValues, smileyLandmarks } from '../src/nasa-tlx';

describe('NASA-TLX instrument content', () => {
  it('contains six sourced dimensions without author-written alternate wording', () => {
    expect(dimensions).toHaveLength(6);
    for (const dimension of dimensions) {
      expect(dimension.prompt.length).toBeGreaterThan(40);
      expect(dimension.simpleExplanation).toBeUndefined();
    }
  });

  it('contains every unique pair exactly once', () => {
    expect(pairs).toHaveLength(15);
    expect(new Set(pairs.map(({ id }) => id)).size).toBe(15);
  });

  it('preserves the 0 to 100 scale in increments of five', () => {
    expect(ratingValues).toHaveLength(21);
    expect(ratingValues[0]).toBe(0);
    expect(ratingValues.at(-1)).toBe(100);
    expect(ratingValues.every((value) => value % 5 === 0)).toBe(true);
  });

  it('preserves the reversed Performance anchors documented by NASA', () => {
    const performance = dimensions.find(({ id }) => id === 'performance');
    expect(performance?.lowAnchor).toBe('Good');
    expect(performance?.highAnchor).toBe('Poor');
  });

  it('maps every smiley shortcut to an official rating increment', () => {
    expect(smileyLandmarks.map(({ value }) => value)).toEqual([0, 25, 50, 75, 100]);
    expect(smileyLandmarks.every(({ value }) => ratingValues.includes(value))).toBe(true);
  });
});
