import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const reportPath = resolve(process.cwd(), process.argv[2] ?? '../docs/evidence/technical-evaluation-report.json');
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
const escapeCell = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const publish = (markdown) => summaryPath
  ? appendFileSync(summaryPath, `${markdown}\n`, 'utf8')
  : process.stdout.write(`${markdown}\n`);

if (!existsSync(reportPath)) {
  publish('# Quantified technical evaluation\n\nNo report was produced. The technical evaluation is incomplete.');
  process.exitCode = 1;
} else {
  let report;
  try {
    report = JSON.parse(readFileSync(reportPath, 'utf8'));
  } catch (error) {
    publish(`# Quantified technical evaluation\n\nThe report could not be parsed: ${escapeCell(error)}`);
    process.exitCode = 1;
  }

  if (report) {
    const fidelityRows = (report.fidelity?.results ?? []).map((result) => `| ${[
      escapeCell(result.caseId),
      escapeCell(result.source),
      result.itemsChecked,
      result.fieldComparisons,
      result.mismatches?.length ?? 0,
    ].join(' | ')} |`);
    const negativeRows = (report.negativeBattery?.results ?? []).map((result) => `| ${[
      escapeCell(result.adversarialInput),
      escapeCell(result.outcome),
      escapeCell(result.message),
    ].join(' | ')} |`);
    const reconstructionRows = (report.exportReconstruction?.results ?? []).map((result) => `| ${[
      escapeCell(result.caseId),
      result.itemsReconstructed,
      result.responseValuesReconstructed,
      result.mismatches?.length ?? 0,
    ].join(' | ')} |`);
    const reuse = report.boundedReuse ?? {};
    const markdown = [
      '# Quantified technical evaluation',
      '',
      `- Revision: \`${escapeCell(report.revision ?? 'not recorded')}\``,
      `- Fidelity cases: **${report.fidelity?.cases ?? 0}**`,
      `- Items checked: **${report.fidelity?.itemsChecked ?? 0}**`,
      `- Field comparisons: **${report.fidelity?.fieldComparisons ?? 0}**`,
      `- Fidelity mismatches: **${report.fidelity?.mismatches ?? 0}**`,
      `- Adversarial inputs: **${report.negativeBattery?.adversarialInputs ?? 0}**`,
      `- Silently altered inputs: **${report.negativeBattery?.silentlyAltered ?? 0}**`,
      `- Result exports reconstructed: **${report.exportReconstruction?.exportsChecked ?? 0}**`,
      `- Reconstruction mismatches: **${report.exportReconstruction?.mismatches ?? 0}**`,
      `- Compatible imported definitions admitted as data: **${reuse.compatibleImportedDefinitionsAdmittedAsData ?? 0}**`,
      `- Instrument-specific production files required for those imports: **${reuse.instrumentSpecificProductionFilesRequiredForThoseImports ?? 'not recorded'}**`,
      `- Shared case-contract executions: **${reuse.sharedContractReuse?.completedCaseContractExecutions ?? 0}/${reuse.sharedContractReuse?.requiredCaseContractExecutions ?? 0}**`,
      `- Allowlist combinations matching: **${reuse.allowlistGate?.matching ?? 0}/${reuse.allowlistGate?.combinationsChecked ?? 0}**`,
      '',
      '## Fidelity round trip',
      '',
      '| Case | Source | Items | Comparisons | Mismatches |',
      '| --- | --- | ---: | ---: | ---: |',
      ...fidelityRows,
      '',
      '## Negative battery',
      '',
      '| Adversarial input | Outcome | Message |',
      '| --- | --- | --- |',
      ...negativeRows,
      '',
      '## Export reconstruction',
      '',
      '| Case | Items | Responses | Mismatches |',
      '| --- | ---: | ---: | ---: |',
      ...reconstructionRows,
      '',
      `> ${escapeCell(report.interpretation)}`,
    ].join('\n');
    publish(markdown);

    const htmlPath = reportPath.endsWith('.json')
      ? `${reportPath.slice(0, -5)}.html`
      : `${reportPath}.html`;
    const htmlRows = (rows, fields) => rows.map((row) => `<tr>${fields
      .map((field) => `<td>${escapeHtml(field(row))}</td>`).join('')}</tr>`).join('\n');
    writeFileSync(htmlPath, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Quantified technical evaluation</title><style>
body{max-width:90rem;margin:0 auto;padding:2rem;font:16px/1.5 system-ui,sans-serif;color:#17202a}
table{width:100%;border-collapse:collapse;margin:1rem 0 2rem}th,td{padding:.6rem;border:1px solid #687887;text-align:left;vertical-align:top}th{background:#e8f3fb}.boundary{padding:1rem;border-left:.35rem solid #725b00;background:#fff9dc}code{overflow-wrap:anywhere}
</style></head><body><main><h1>Quantified technical evaluation</h1>
<p>Revision: <code>${escapeHtml(report.revision ?? 'not recorded')}</code></p>
<ul><li>${report.fidelity?.itemsChecked ?? 0} items; ${report.fidelity?.fieldComparisons ?? 0} fidelity comparisons; ${report.fidelity?.mismatches ?? 0} mismatches.</li>
<li>${report.negativeBattery?.adversarialInputs ?? 0} adversarial inputs; ${report.negativeBattery?.silentlyAltered ?? 0} silently altered.</li>
<li>${report.exportReconstruction?.exportsChecked ?? 0} exports reconstructed; ${report.exportReconstruction?.mismatches ?? 0} mismatches.</li>
<li>${reuse.compatibleImportedDefinitionsAdmittedAsData ?? 0} compatible imports admitted as data; ${reuse.instrumentSpecificProductionFilesRequiredForThoseImports ?? 'not recorded'} instrument-specific production files.</li>
<li>${reuse.sharedContractReuse?.completedCaseContractExecutions ?? 0}/${reuse.sharedContractReuse?.requiredCaseContractExecutions ?? 0} shared case-contract executions; ${reuse.sharedContractReuse?.instrumentSpecificContractCopies ?? 0} copies.</li>
<li>${reuse.allowlistGate?.matching ?? 0}/${reuse.allowlistGate?.combinationsChecked ?? 0} allowlist combinations matched.</li></ul>
<h2>Fidelity round trip</h2><table><thead><tr><th>Case</th><th>Source</th><th>Items</th><th>Comparisons</th><th>Mismatches</th></tr></thead><tbody>${htmlRows(report.fidelity?.results ?? [], [
      (row) => row.caseId,
      (row) => row.source,
      (row) => row.itemsChecked,
      (row) => row.fieldComparisons,
      (row) => row.mismatches?.length ?? 0,
    ])}</tbody></table>
<h2>Negative battery</h2><table><thead><tr><th>Input</th><th>Outcome</th><th>Message</th></tr></thead><tbody>${htmlRows(report.negativeBattery?.results ?? [], [
      (row) => row.adversarialInput,
      (row) => row.outcome,
      (row) => row.message,
    ])}</tbody></table>
<h2>Export reconstruction</h2><table><thead><tr><th>Case</th><th>Items</th><th>Responses</th><th>Mismatches</th></tr></thead><tbody>${htmlRows(report.exportReconstruction?.results ?? [], [
      (row) => row.caseId,
      (row) => row.itemsReconstructed,
      (row) => row.responseValuesReconstructed,
      (row) => row.mismatches?.length ?? 0,
    ])}</tbody></table>
<p class="boundary"><strong>Interpretation boundary:</strong> ${escapeHtml(report.interpretation)}</p>
</main></body></html>\n`, 'utf8');
  }
}
