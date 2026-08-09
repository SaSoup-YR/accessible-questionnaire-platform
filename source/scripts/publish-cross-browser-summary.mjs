import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const engines = ['chromium', 'firefox', 'webkit'];
const inputDirectory = resolve(process.cwd(), 'test-results/support');
const outputPath = resolve(process.cwd(), '../docs/evidence/cross-browser-support-report.json');
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const escapeCell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const publish = (markdown) => summaryPath
  ? appendFileSync(summaryPath, `${markdown}\n`, 'utf8')
  : process.stdout.write(`${markdown}\n`);

const missing = [];
const results = [];
for (const engine of engines) {
  const path = resolve(inputDirectory, `cross-browser-${engine}.json`);
  if (!existsSync(path)) {
    missing.push(engine);
    continue;
  }
  results.push(JSON.parse(readFileSync(path, 'utf8')));
}

const report = {
  schemaVersion: 1,
  evidenceType: 'automated cross-browser capability matrix',
  revision: process.env.GITHUB_SHA ?? results[0]?.revision ?? 'local-uncommitted',
  generatedAt: new Date().toISOString(),
  missingEngines: missing,
  results,
  interpretation:
    'This matrix records native web-platform feature availability and a runner smoke test. Playwright WebKit is not Safari, and browser automation does not test NVDA, VoiceOver or operating-system voice control usability.',
};
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

const rows = results.map((result) => `| ${[
  result.engine,
  result.browserVersion,
  result.features.builtInVoiceRecognition ? 'available' : 'unavailable',
  result.features.speechSynthesis ? 'available' : 'unavailable',
  result.features.localStorage ? 'pass' : 'fail',
  escapeCell(result.context),
].join(' | ')} |`);
const markdown = [
  '# Cross-browser capability matrix',
  '',
  `- Revision: \`${escapeCell(report.revision)}\``,
  `- Engines recorded: **${results.length}/3**`,
  `- Missing engines: **${missing.length}**`,
  '',
  '| Engine | Version | Built-in voice recognition | Speech synthesis | Local storage | Boundary |',
  '| --- | --- | --- | --- | --- | --- |',
  ...rows,
  '',
  `> ${report.interpretation}`,
].join('\n');
publish(markdown);

const htmlPath = outputPath.replace(/\.json$/, '.html');
writeFileSync(htmlPath, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Cross-browser capability matrix</title><style>body{max-width:80rem;margin:0 auto;padding:2rem;font:16px/1.5 system-ui,sans-serif;color:#17202a}table{width:100%;border-collapse:collapse}th,td{padding:.6rem;border:1px solid #687887;text-align:left;vertical-align:top}th{background:#e8f3fb}.boundary{padding:1rem;border-left:.35rem solid #725b00;background:#fff9dc}</style></head><body><main><h1>Cross-browser capability matrix</h1><p>Revision: <code>${escapeHtml(report.revision)}</code></p><table><thead><tr><th>Engine</th><th>Version</th><th>Built-in voice recognition</th><th>Speech synthesis</th><th>Local storage</th><th>Boundary</th></tr></thead><tbody>${results.map((result) => `<tr><td>${escapeHtml(result.engine)}</td><td>${escapeHtml(result.browserVersion)}</td><td>${result.features.builtInVoiceRecognition ? 'available' : 'unavailable'}</td><td>${result.features.speechSynthesis ? 'available' : 'unavailable'}</td><td>${result.features.localStorage ? 'pass' : 'fail'}</td><td>${escapeHtml(result.context)}</td></tr>`).join('')}</tbody></table><p class="boundary"><strong>Interpretation boundary:</strong> ${escapeHtml(report.interpretation)}</p></main></body></html>\n`, 'utf8');

if (missing.length) process.exitCode = 1;
