// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  DEMO_INSTRUMENTS,
  buildDemoHash,
  demoInstrumentFromSearch,
  hasStudyParameter,
} from '../src/landing';
import {
  readParticipantCodeFromHash,
  readStudyConfigFromHash,
} from '../src/study';

describe('AQP public landing and demonstration routing', () => {
  it('shows the landing unless a study parameter is present', () => {
    expect(hasStudyParameter('')).toBe(false);
    expect(hasStudyParameter('#participant=DEMO')).toBe(false);
    expect(hasStudyParameter('#study=invalid')).toBe(true);
  });

  it('accepts only the three published demonstration identifiers', () => {
    expect(demoInstrumentFromSearch('?demo=nasa-tlx-weighted')).toBe(
      'nasa-tlx-weighted',
    );
    expect(demoInstrumentFromSearch('?demo=nasa-tlx-raw')).toBe(
      'nasa-tlx-raw',
    );
    expect(demoInstrumentFromSearch('?demo=system-usability-scale')).toBe(
      'system-usability-scale',
    );
    expect(demoInstrumentFromSearch('?demo=unknown')).toBeNull();
    expect(demoInstrumentFromSearch('')).toBeNull();
  });

  it.each(DEMO_INSTRUMENTS)(
    'creates a valid local $name configuration with the DEMO code',
    ({ id }) => {
      const hash = `#${buildDemoHash(id)}`;
      const config = readStudyConfigFromHash(hash);

      expect(config?.instrumentId).toBe(id);
      expect(config?.collection).toEqual({ mode: 'local' });
      expect(config?.showScoreToParticipant).toBe(true);
      expect(config?.support.participantAdjustmentPolicy).toBe(
        'participant-choice',
      );
      expect(config?.support.recoveryEnabled).toBe(false);
      expect(config?.support.voiceInputAvailable).toBe(true);
      expect(config?.support.gazeInputAvailable).toBe(
        id === 'nasa-tlx-weighted',
      );
      expect(readParticipantCodeFromHash(hash)).toBe('DEMO');
    },
  );
});
