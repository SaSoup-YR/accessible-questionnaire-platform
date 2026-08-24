import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distHtmlPath = resolve(root, 'dist-standalone/standalone.html');
const outputPath = resolve(root, 'demo/accessible-questionnaire-platform-v0.8.html');

let html = readFileSync(distHtmlPath, 'utf8');
const scriptMatch = html.match(/src="\.\/(assets\/[^\"]+\.js)"/);
const styleMatch = html.match(/href="\.\/(assets\/[^\"]+\.css)"/);

if (!scriptMatch || !styleMatch) {
  throw new Error('The Vite build did not expose the expected JavaScript and CSS assets.');
}

const javascript = readFileSync(resolve(root, 'dist-standalone', scriptMatch[1]), 'utf8')
  .replace(/<\/script/gi, '<\\/script');
const stylesheet = readFileSync(resolve(root, 'dist-standalone', styleMatch[1]), 'utf8');

// Function replacers are intentional. A replacement string would interpret
// JavaScript sequences such as $` and corrupt the inlined bundle.
html = html
  .replace(/    <script type="module" crossorigin src="[^\"]+"><\/script>\n/, () => '')
  .replace(/    <link rel="stylesheet" crossorigin href="[^\"]+">/, () => `    <style>${stylesheet}</style>`)
  .replace(
    'Participant page for the Accessible Questionnaire Platform Version 0.8 research prototype',
    'Self-contained participant page for the Accessible Questionnaire Platform Version 0.8',
  )
  .replace('  </body>', () => `    <script type="module">${javascript}</script>\n  </body>`);

const doctypeCount = html.match(/<!doctype html>/gi)?.length ?? 0;
const componentCount = html.match(/<accessible-questionnaire><\/accessible-questionnaire>/g)?.length ?? 0;

if (doctypeCount !== 1 || componentCount !== 1 || html.includes('./assets/')) {
  throw new Error('Standalone verification failed: the output is duplicated or still depends on Vite assets.');
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);
console.log(`Wrote verified standalone demo: ${outputPath}`);
