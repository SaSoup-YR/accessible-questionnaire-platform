# Supervisor feedback acceptance evidence v1

Status: local correction candidate; release evidence pending
Revised: 2026-08-10
Repository: `SaSoup-YR/accessible-questionnaire-platform`

## Evidence rule

A requirement is not marked release-complete merely because code exists or a
local command passed. Final evidence requires the following chain:

1. the requirement is linked to production code and a falsifiable test;
2. the test runs in CI against an immutable Git commit SHA;
3. CI publishes the raw and human-readable report as an artefact;
4. the verified commit is deployed and the deployed URL is re-tested; and
5. where the claim concerns actual assistive-technology output, the versioned
   manual audit contains an observed result rather than `NT`.

The current local results below are reproducible pre-release evidence. They do
not become final release evidence until CI and deployment reproduce them.

## Original five corrections

| ID | Supervisor requirement | Production evidence | Falsifiable test evidence | Current result | Release-complete gate |
| --- | --- | --- | --- | --- | --- |
| F1 | Review shows complete item text, selected answer label and a per-item Change control. Change opens the selected item and returns to the same review record. | `source/src/accessible-nasa-tlx.ts`; review/edit state and focus-return code | `source/tests/component.test.ts`; `source/tests/study-component.test.ts`; `source/tests/e2e/browser-accessibility.spec.ts` SUS review/edit route | Local unit/component suite passed; the previous PR revision's rendered-browser review/edit/focus route also passed. | Fresh correction-candidate CI plus deployed review smoke check for the same final SHA. |
| F2 | Participant code is prefilled from the generated link and remains editable as fallback. | `source/src/study.ts`; `source/src/study-conductor.ts`; participant hash parameter and precedence over stale session state | `source/tests/study.test.ts`; `source/tests/conductor-component.test.ts`; `source/tests/study-component.test.ts`; Playwright intro check | Local tests passed. | CI pass tied to release SHA; generated deployed link opens with the intended pseudonymous code and no initial validation failure. |
| F3 | Participant introduction is reduced to necessary content and the full audio-guidance panel is rendered once, not above every item. | `source/src/accessible-nasa-tlx.ts`; intro/support disclosure and in-question rendering | `source/tests/component.test.ts`; `source/tests/accessibility.test.ts`; Playwright intro/item/review checks | Local tests passed; the Playwright intro word-count gate is below 160 words and checks that `.audio-guidance` is not repeated on question/review screens. | CI browser artefact and deployed intro/item inspection for the release SHA. |
| F4 | A stable definition hash is carried in configuration and result, recomputed at load and submission, and a missing or mismatched Version 4 fingerprint blocks success or stored-result restoration. | `source/src/study.ts`; `source/src/result-sink.ts`; configuration/result/CSV/Qualtrics fields | `source/tests/study.test.ts`; `source/tests/study-component.test.ts`; `source/tests/result-sink.test.ts`; `source/tests/technical-evaluation.test.ts` | Local stale-hash, delete-the-hash, submission-block, stored-result and reconstruction checks passed. Hashless Version 4 configuration/result migration has been removed; explicit Version 3 legacy migration remains. | CI report shows hash checks and reconstruction for the release SHA; deployed tamper tests cannot submit, restore or show false success. The hash is an unsigned consistency fingerprint, not proof of researcher origin. |
| F5 | axe scans run in a real browser in CI over all required runner states and reports are published. | `.github/workflows/verify.yml`; `source/playwright.config.ts`; `source/tests/e2e/browser-accessibility.spec.ts`; report publisher | Four Playwright scenarios cover 12 named states under five profiles: 1280, 768, 320 CSS pixels, CDP 200% zoom and a 640×450 companion viewport, for 60 required scans. Tests also check overflow, target size and rendered focus. | GitHub Actions run `31335943404` for the previous PR revision published 60/60 scans with 0 violations, incomplete checks, overflow failures or target-size failures. The current synthetic-fixture correction requires a fresh run. | Fresh GitHub Actions artefact containing axe JSON/HTML, Playwright HTML/traces and support matrix, tied to final main/deployment SHA. |

## Endpoint-label PS

| Requirement | Code/test evidence | Current status | Final evidence |
| --- | --- | --- | --- |
| Retain the fieldset legend as the announced endpoint source; keep the visual anchor `aria-hidden`; suppress an option label only when it exactly duplicates its endpoint; preserve distinct middle labels on a five-point German scale. | `source/src/accessible-nasa-tlx.ts` (`visibleResponseLabel`); `source/tests/platform-component.test.ts`; `source/tests/e2e/browser-accessibility.spec.ts` German five-point route | Unit/component and previous-PR rendered-browser tests passed. | Fresh correction-candidate rendered-browser test plus deployed visual and accessibility-tree inspection. |

## Latest technical-evaluation requirements

| ID | Requirement | Frozen evidence source | Local quantified result | Status before CI/manual execution |
| --- | --- | --- | --- | --- |
| L1 | Manual walkthrough on NVDA/Firefox, NVDA/Chrome, VoiceOver/Safari and one OS voice-control route, including pairwise, review, error, listening, pending and saved-progress states; report by WCAG criterion with exact announcements. | `docs/manual-audit/AQP-MANUAL-AT-AUDIT-v1.0.md` and `deliverables/AQP_Manual_AT_Audit_v1.docx` | Protocol contains A01–A23 state checks, route columns, exact-speech fields, severity rules and a WCAG summary. | **Not executed. All required cells remain `NT`; C2 remains Not evidenced.** |
| L2a | Programmatic fidelity round trip for all three distributable built-ins and every QSF/LSS/LSG/LSQ fixture against an independent source of truth. | `docs/evidence/fidelity-source-of-truth.json`; `source/tests/technical-evaluation.test.ts`; `docs/evidence/technical-evaluation-report.json/.html` | 8 cases; 31 items; 234 field comparisons; 0 mismatches. UEQ-S content is excluded because public redistribution/deployment permission was not established. | Locally evidenced for the correction candidate; fresh release-CI reproduction pending. |
| L2b | Negative battery covering 12 specified adversarial inputs with zero silently altered. | Same technical test and report | 12 inputs; 10 specific refusals; 2 generic XML refusals; 0 documented losses; 0 silently altered. | Locally evidenced; release-CI reproduction pending. |
| L2c | Real-browser WCAG scans in CI at 1280, 768 and 320 widths and 200% zoom, with every named state and a published artefact. | Browser specification, Playwright configuration and `verify.yml` | The previous PR revision published 60/60 scans with 0 violations, incomplete checks, overflow failures or target-size failures. The correction candidate replaces the UEQ-S state with original synthetic semantic-differential content. | Prior PR-CI evidence exists; the changed correction candidate requires a fresh artefact before final release evidence. |
| L2d | Cross-browser support matrix, explicitly recording Firefox/Web Speech limitations. | `source/tests/e2e-support/cross-browser-support.spec.ts`; `docs/CROSS-BROWSER-SUPPORT-MATRIX.md`; browser-support report publisher | The previous PR CI recorded Chromium, Firefox and Playwright WebKit; Firefox and WebKit exposed no built-in SpeechRecognition. Linux WebKit remains explicitly distinct from Safari/VoiceOver. | Prior PR-CI runtime evidence exists; fresh correction-candidate CI pending. |
| L2e | Reconstruct original instrument and response set from the result export alone. | Technical test and report; embedded complete definition in each result record | 8/8 exports and 31/31 responses reconstructed; 0 mismatches. | Locally evidenced for the correction candidate; fresh release-CI reproduction pending. |
| L3 | Matrix v6 removes C6, revises C2/C5, makes C7 hash checkable and records every evidence status. | `docs/AQP-EVALUATION-MATRIX-v6.md`; `deliverables/AQP_Evaluation_Matrix_v6.docx` | C6 removed; C2/C5/C7 revised; local, pending and Not evidenced states separated. | Document complete; status cells must be updated after release CI and manual audit. |
| L4 | Precisely specify optional observed researcher study: Qualtrics start/end state, counterbalancing, descriptive/per-participant analysis, success/assist/error definitions, fixed script, recording, second coding and planted-discrepancy debrief. | `docs/OBSERVED-RESEARCHER-STUDY-PROTOCOL-v1.0.md`; `deliverables/AQP_Observed_Researcher_Study_Protocol_v1.docx` | Complete planned protocol for 6–8 participants. | Protocol ready; study is optional and must not run without the amendment. C5 remains Not evidenced if no sessions occur. |
| L5 | Dissertation remains complete without observed sessions; technical evaluation and manual audit form the core. | Matrix v6; technical protocol; contribution statement | Claim boundary withdraws respondent comparison, score equivalence, questionnaire independence and disabled-user benefit claims. | Structurally complete, subject to release CI and execution of the manual technical audit. |

## Reproduction commands

Run from `source/`:

```text
npm ci
npm test -- --run
npm run report:technical
npm run build
npm run test:browser
npm run test:browser-support
npm run report:browser
npm run report:browser-support
npm run build:release
```

Expected local non-browser results at the time this evidence map was prepared:

- 20/20 test files and 198/198 tests passed;
- 8 fidelity cases, 31 items and 234 comparisons with 0 mismatches;
- 12 adversarial inputs with 0 silently altered;
- 8/8 exports and 31/31 responses reconstructed with 0 mismatches;
- production, standalone and release builds passed; and
- `npm audit --omit=dev` reported 0 vulnerabilities.

## Final release evidence checklist

- [ ] Commit the correction candidate and record its immutable SHA.
- [ ] Open a pull request containing this evidence map and all implementation changes.
- [ ] Obtain a passing GitHub Actions `verify` run for that SHA.
- [ ] Download/archive the `quantified-technical-evaluation` artefact.
- [ ] Download/archive the `rendered-accessibility-evidence` artefact.
- [ ] Confirm the `gh-pages` deployment is built from the same verified SHA.
- [ ] Re-test F1–F4 and the German endpoint case on the public deployment.
- [ ] Execute and complete the manual audit on R1–R4, replacing every required `NT`.
- [ ] Record failures rather than converting them into passes; fix and re-run where necessary.
- [ ] Update matrix v6 statuses from Pending/Not evidenced only when the corresponding evidence exists.
- [ ] Send the supervisor the deployed URL, commit SHA, CI run/artifact links, matrix v6 and completed audit.
