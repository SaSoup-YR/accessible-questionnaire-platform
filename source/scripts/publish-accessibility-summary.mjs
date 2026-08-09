import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const reportPath = resolve(process.cwd(), process.argv[2] ?? '../docs/evidence/axe-browser-report.json');
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

function publish(markdown) {
  if (summaryPath) {
    appendFileSync(summaryPath, `${markdown}\n`, 'utf8');
  } else {
    process.stdout.write(`${markdown}\n`);
  }
}

function tableCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function htmlCell(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

if (!existsSync(reportPath)) {
  publish([
    '# Rendered accessibility evidence',
    '',
    `No machine-readable report was produced at \`${reportPath}\`.`,
    'The real-browser accessibility job is incomplete and must not be cited as passing evidence.',
  ].join('\n'));
  process.exitCode = 1;
} else {
  let report;
  try {
    report = JSON.parse(readFileSync(reportPath, 'utf8'));
  } catch (error) {
    publish([
      '# Rendered accessibility evidence',
      '',
      `The report at \`${reportPath}\` could not be parsed: ${error instanceof Error ? error.message : String(error)}`,
    ].join('\n'));
    process.exitCode = 1;
  }

  if (report) {
    const scans = Array.isArray(report.scans) ? report.scans : [];
    const violationCount = scans.reduce(
      (total, scan) => total + (Array.isArray(scan.violations) ? scan.violations.length : 0),
      0,
    );
    const incompleteCount = scans.reduce(
      (total, scan) => total + (Array.isArray(scan.incomplete) ? scan.incomplete.length : 0),
      0,
    );
    const overflowFailures = scans.filter(
      (scan) => Number(scan.horizontalOverflowCssPixels) > 1,
    ).length;
    const targetSizeFailures = scans.reduce(
      (total, scan) => total + (Array.isArray(scan.targetSize?.undersized)
        ? scan.targetSize.undersized.length
        : 0),
      0,
    );
    const missingRequiredStates = Array.isArray(report.summary?.missingRequiredStates)
      ? report.summary.missingRequiredStates
      : [];
    const missingRequiredStateProfiles = Array.isArray(report.summary?.missingRequiredStateProfiles)
      ? report.summary.missingRequiredStateProfiles
      : [];

    const rows = scans.map((scan) => `| ${[
      tableCell(scan.state ?? 'Unnamed state'),
      tableCell(scan.profile ?? 'Unspecified profile'),
      tableCell(scan.zoomPercent ?? 100),
      tableCell(scan.path ?? ''),
      tableCell(scan.visualViewport?.scale ?? 'not recorded'),
      Array.isArray(scan.violations) ? scan.violations.length : 0,
      Array.isArray(scan.incomplete) ? scan.incomplete.length : 0,
      tableCell(scan.horizontalOverflowCssPixels ?? 'not recorded'),
      tableCell(scan.targetSize?.minimumWidthCssPixels ?? 'not recorded'),
      tableCell(scan.targetSize?.minimumHeightCssPixels ?? 'not recorded'),
      Array.isArray(scan.targetSize?.undersized) ? scan.targetSize.undersized.length : 0,
    ].join(' | ')} |`);

    const htmlRows = scans.map((scan) => `<tr>${[
      scan.state ?? 'Unnamed state',
      scan.profile ?? 'Unspecified profile',
      scan.zoomPercent ?? 100,
      scan.path ?? '',
      scan.visualViewport?.scale ?? 'not recorded',
      Array.isArray(scan.violations) ? scan.violations.length : 0,
      Array.isArray(scan.incomplete) ? scan.incomplete.length : 0,
      scan.horizontalOverflowCssPixels ?? 'not recorded',
      scan.targetSize?.tested ?? 'not recorded',
      scan.targetSize?.minimumWidthCssPixels ?? 'not recorded',
      scan.targetSize?.minimumHeightCssPixels ?? 'not recorded',
      Array.isArray(scan.targetSize?.undersized) ? scan.targetSize.undersized.length : 0,
    ].map((value) => `<td>${htmlCell(value)}</td>`).join('')}</tr>`).join('\n');

    const htmlPath = reportPath.endsWith('.json')
      ? `${reportPath.slice(0, -5)}.html`
      : `${reportPath}.html`;
    writeFileSync(htmlPath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rendered accessibility evidence</title>
  <style>
    body { max-width: 90rem; margin: 0 auto; padding: 2rem; font: 16px/1.5 system-ui, sans-serif; color: #17202a; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.6rem; border: 1px solid #687887; text-align: left; vertical-align: top; }
    th { background: #e8f3fb; }
    code { overflow-wrap: anywhere; }
    .boundary { padding: 1rem; border-left: 0.35rem solid #725b00; background: #fff9dc; }
  </style>
</head>
<body>
  <main>
    <h1>Rendered accessibility evidence</h1>
    <dl>
      <dt>Revision</dt><dd><code>${htmlCell(report.revision ?? 'not recorded')}</code></dd>
      <dt>Generated</dt><dd>${htmlCell(report.generatedAt ?? 'not recorded')}</dd>
      <dt>Browser</dt><dd>${htmlCell(report.browser ?? 'not recorded')}</dd>
      <dt>Profiles</dt><dd>${htmlCell((report.profiles ?? []).map((profile) => `${profile.id}: ${profile.viewport?.width} × ${profile.viewport?.height}, ${profile.zoomPercent}%`).join('; ') || 'not recorded')}</dd>
      <dt>Rendered states</dt><dd>${report.summary?.scannedStates ?? 'not recorded'}</dd>
      <dt>State-profile scans</dt><dd>${scans.length}</dd>
      <dt>Automatically detected violations</dt><dd>${violationCount}</dd>
      <dt>Incomplete axe checks</dt><dd>${incompleteCount}</dd>
      <dt>Horizontal-overflow failures</dt><dd>${overflowFailures}</dd>
      <dt>Critical target-size failures</dt><dd>${targetSizeFailures}</dd>
      <dt>Missing required states</dt><dd>${htmlCell(missingRequiredStates.join(', ') || 'None')}</dd>
      <dt>Missing state-profile combinations</dt><dd>${htmlCell(missingRequiredStateProfiles.join(', ') || 'None')}</dd>
    </dl>
    <table>
      <thead><tr><th>State</th><th>Profile</th><th>Zoom %</th><th>Path</th><th>Observed scale</th><th>Violations</th><th>Incomplete</th><th>Overflow px</th><th>Targets tested</th><th>Min width</th><th>Min height</th><th>Undersized</th></tr></thead>
      <tbody>${htmlRows}</tbody>
    </table>
    <p class="boundary"><strong>Interpretation boundary:</strong> ${htmlCell(report.interpretation ?? 'Automated results are bounded technical evidence, not a complete accessibility claim.')}</p>
  </main>
</body>
</html>\n`, 'utf8');

    publish([
      '# Rendered accessibility evidence',
      '',
      `- Revision: \`${tableCell(report.revision ?? 'not recorded')}\``,
      `- Generated: ${tableCell(report.generatedAt ?? 'not recorded')}`,
      `- Browser: ${tableCell(report.browser ?? 'not recorded')}`,
      `- Rendered states scanned: **${report.summary?.scannedStates ?? 0}**`,
      `- State-profile scans: **${scans.length}**`,
      `- Automatically detected violations: **${violationCount}**`,
      `- Incomplete axe checks requiring inspection: **${incompleteCount}**`,
      `- States with horizontal overflow above 1 CSS pixel: **${overflowFailures}**`,
      `- Critical targets smaller than 24 × 24 CSS pixels: **${targetSizeFailures}**`,
      `- Missing required states: **${missingRequiredStates.length}**`,
      `- Missing state-profile combinations: **${missingRequiredStateProfiles.length}**`,
      '',
      '| State | Profile | Zoom % | Path | Observed scale | Violations | Incomplete | Overflow (px) | Min target width | Min target height | Undersized |',
      '| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
      ...rows,
      '',
      `> ${tableCell(report.interpretation ?? 'Automated results are bounded technical evidence, not a complete accessibility claim.')}`,
      '',
      'Download the `rendered-accessibility-evidence` artifact for the axe JSON/HTML reports, Playwright HTML report and failure traces.',
    ].join('\n'));
  }
}
