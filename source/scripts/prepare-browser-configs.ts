import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { QuestionnaireDefinition } from '../src/questionnaire-definition';
import { createStudyConfig, encodeStudyConfig } from '../src/study';

const output = resolve(process.cwd(), 'test-results/browser-study-configs.json');
const customGermanDefinition = JSON.parse(readFileSync(
  resolve(process.cwd(), 'tests/fixtures/custom-german-agreement-check.questionnaire.json'),
  'utf8',
)) as QuestionnaireDefinition;

const definitions = [
  { instrumentId: 'system-usability-scale' },
  { instrumentId: 'user-experience-questionnaire-short' },
  {
    instrumentId: customGermanDefinition.id,
    questionnaireDefinition: customGermanDefinition,
  },
] as const;

const configurations = Object.fromEntries(definitions.map((entry) => {
  const config = createStudyConfig({
    instrumentId: entry.instrumentId,
    ...('questionnaireDefinition' in entry
      ? { questionnaireDefinition: entry.questionnaireDefinition }
      : {}),
    studyId: `BROWSER-${entry.instrumentId}`.slice(0, 64),
    studyTitle: 'Browser accessibility regression',
    taskLabel: 'using the test interface',
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
  }, {
    configId: `browser-config-${entry.instrumentId}`,
    createdAt: '2026-08-08T00:00:00.000Z',
  });
  return [entry.instrumentId, {
    encodedStudy: encodeStudyConfig(config),
    definitionHash: config.definitionHash,
  }];
}));

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify({
  schemaVersion: 1,
  generatedBy: 'production createStudyConfig and encodeStudyConfig',
  configurations,
}, null, 2)}\n`);
