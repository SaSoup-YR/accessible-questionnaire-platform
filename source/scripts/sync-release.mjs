import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertPublicQuestionnaireInventory } from './public-questionnaire-policy.mjs';

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(sourceRoot, '..');
const distRoot = resolve(sourceRoot, 'dist');
const releaseAssets = resolve(repositoryRoot, 'assets');
const instrumentRoot = resolve(sourceRoot, 'instruments');
const releaseQuestionnaires = resolve(repositoryRoot, 'questionnaires');

copyFileSync(resolve(distRoot, 'index.html'), resolve(repositoryRoot, 'index.html'));
copyFileSync(resolve(distRoot, 'study.html'), resolve(repositoryRoot, 'study.html'));
mkdirSync(releaseAssets, { recursive: true });
mkdirSync(releaseQuestionnaires, { recursive: true });

const entryHtml = [
  readFileSync(resolve(distRoot, 'index.html'), 'utf8'),
  readFileSync(resolve(distRoot, 'study.html'), 'utf8'),
].join('\n');
const referencedAssets = new Set(
  [...entryHtml.matchAll(/\.\/assets\/([^"']+\.(?:js|css))/g)].map((match) => match[1]),
);

for (const asset of referencedAssets) {
  copyFileSync(resolve(distRoot, 'assets', asset), resolve(releaseAssets, basename(asset)));
}

for (const asset of readdirSync(releaseAssets)) {
  if (!/^[A-Za-z0-9_-]+\.(?:js|css)$/.test(asset)) {
    throw new Error(`Refusing to manage unexpected release asset: ${asset}`);
  }
  if (!referencedAssets.has(asset)) rmSync(resolve(releaseAssets, asset));
}

const questionnaireFiles = readdirSync(instrumentRoot).filter((filename) =>
  filename === 'questionnaire-definition.schema.json' ||
  filename.endsWith('.questionnaire.json'),
);
assertPublicQuestionnaireInventory(questionnaireFiles);
for (const filename of questionnaireFiles) {
  copyFileSync(resolve(instrumentRoot, filename), resolve(releaseQuestionnaires, filename));
}
for (const filename of readdirSync(releaseQuestionnaires)) {
  if (!questionnaireFiles.includes(filename)) {
    throw new Error(`Refusing to manage unexpected questionnaire file: ${filename}`);
  }
}

console.log(
  `Synchronized ${referencedAssets.size} production assets, ${questionnaireFiles.length} questionnaire files and both release entry points.`,
);
