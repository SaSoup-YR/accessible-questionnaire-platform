import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = resolve(root, 'dist-standalone');
const distHtmlPath = resolve(distRoot, 'standalone.html');
const outputPath = resolve(root, 'demo/accessible-questionnaire-platform-v0.8.html');

let html = readFileSync(distHtmlPath, 'utf8');

const scriptTagPattern = /<script\b(?=[^>]*\btype=["']module["'])[^>]*\bsrc=["']\.\/(assets\/[^"']+\.js)["'][^>]*><\/script>\s*/gi;
const stylesheetTagPattern = /<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*\bhref=["']\.\/(assets\/[^"']+\.css)["'][^>]*>\s*/gi;

const scriptAssets = [...html.matchAll(scriptTagPattern)].map((match) => match[1]);
const stylesheetAssets = [...html.matchAll(stylesheetTagPattern)].map((match) => match[1]);

if (scriptAssets.length === 0 || stylesheetAssets.length === 0) {
  throw new Error('The Vite build did not expose the expected JavaScript and CSS assets.');
}

const javascript = scriptAssets
  .map((asset) => readFileSync(resolve(distRoot, asset), 'utf8'))
  .join('\n')
  .replace(/<\/script/gi, '<\\/script');
const stylesheet = stylesheetAssets
  .map((asset) => readFileSync(resolve(distRoot, asset), 'utf8'))
  .join('\n');

// Function replacers are intentional. A replacement string would interpret
// JavaScript sequences such as $` and corrupt the inlined bundle.
html = html
  .replace(scriptTagPattern, () => '')
  .replace(stylesheetTagPattern, () => '')
  .replace(
    'Participant page for the Accessible Questionnaire Platform Version 0.8 research prototype',
    'Self-contained participant page for the Accessible Questionnaire Platform Version 0.8',
  )
  .replace('  </head>', () => `    <style>${stylesheet}</style>\n  </head>`)
  .replace('  </body>', () => `    <script type="module">${javascript}</script>\n  </body>`);

const doctypeCount = html.match(/<!doctype html>/gi)?.length ?? 0;
const componentCount = html.match(/<accessible-questionnaire><\/accessible-questionnaire>/g)?.length ?? 0;

// A harmless string literal containing "./assets/" is not an external runtime
// dependency. Check the forms that a browser would actually load instead.
const runtimeAssetPatterns = [
  /(?:src|href)=["']\.\/assets\//i,
  /url\(\s*["']?\.\/assets\//i,
  /\bimport\s*\(\s*["']\.\/assets\//i,
  /\bfrom\s*["']\.\/assets\//i,
];
const remainingRuntimeAssetReference = runtimeAssetPatterns.find((pattern) => pattern.test(html));

if (doctypeCount !== 1 || componentCount !== 1 || remainingRuntimeAssetReference) {
  throw new Error(
    `Standalone verification failed: expected one document and component with no runtime Vite asset dependency; ` +
      `doctype=${doctypeCount}, component=${componentCount}, assetPattern=${remainingRuntimeAssetReference ?? 'none'}.`,
  );
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html);
console.log(`Wrote verified standalone demo: ${outputPath}`);
