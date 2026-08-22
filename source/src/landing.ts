import { createStudyConfig, encodeStudyConfig } from './study';

export type DemoInstrumentId =
  | 'nasa-tlx-weighted'
  | 'nasa-tlx-raw'
  | 'system-usability-scale';

export const DEMO_INSTRUMENTS: ReadonlyArray<{
  id: DemoInstrumentId;
  name: string;
  description: string;
}> = [
  {
    id: 'nasa-tlx-weighted',
    name: 'Weighted NASA-TLX',
    description: 'Six workload ratings followed by the standard pairwise weighting task.',
  },
  {
    id: 'nasa-tlx-raw',
    name: 'Raw NASA-TLX',
    description: 'The six NASA-TLX ratings without pairwise weighting.',
  },
  {
    id: 'system-usability-scale',
    name: 'System Usability Scale',
    description: 'The standard ten-item SUS agreement questionnaire and scoring rule.',
  },
];

const demoIds = new Set<DemoInstrumentId>(
  DEMO_INSTRUMENTS.map(({ id }) => id),
);

export function demoInstrumentFromSearch(search: string): DemoInstrumentId | null {
  const requested = new URLSearchParams(search).get('demo');
  return requested && demoIds.has(requested as DemoInstrumentId)
    ? (requested as DemoInstrumentId)
    : null;
}

export function hasStudyParameter(hash: string) {
  const parameters = new URLSearchParams(
    hash.startsWith('#') ? hash.slice(1) : hash,
  );
  return parameters.has('study');
}

export function buildDemoHash(instrumentId: DemoInstrumentId) {
  const demo = DEMO_INSTRUMENTS.find(({ id }) => id === instrumentId);
  if (!demo) throw new Error('Unsupported demonstration questionnaire.');

  const config = createStudyConfig(
    {
      instrumentId,
      studyId: `DEMO-${instrumentId}`.slice(0, 64),
      studyTitle: `${demo.name} demonstration`,
      taskLabel: 'using the Accessible Questionnaire Platform demonstration',
      showScoreToParticipant: true,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: true,
        participantAdjustmentPolicy: 'participant-choice',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      collection: { mode: 'local' },
    },
    {
      configId: `public-demo-${instrumentId}`,
      createdAt: '2026-08-22T00:00:00.000Z',
    },
  );

  return new URLSearchParams({
    study: encodeStudyConfig(config),
    participant: 'DEMO',
  }).toString();
}
