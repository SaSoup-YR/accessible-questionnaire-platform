# Supervisor feedback acceptance evidence v1

Status: correction candidate verified in PR CI; final-main/deployment evidence pending
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
| F1 | Review shows complete item text, selected answer label and a per-item Change control. Change opens the selected item and returns to the same review record. | `source/src/accessible-nasa-tlx.ts`; review/edit state and focus-return code | `source/tests/component.test.ts`; `source/tests/study-component.test.ts`; `source/tests/e2e/browser-accessibility.spec.ts` SUS review/edit route | Local and PR CI run `31339674025` passed the review/edit/focus route. | Deployed review smoke check for the final main/deployment SHA. |
| F2 | Participant code is prefilled from the generated link and remains editable as fallback. | `source/src/study.ts`; `source/src/study-conductor.ts`; participant hash parameter and precedence over stale session state | `source/tests/study.test.ts`; `source/tests/conductor-component.test.ts`; `source/tests/study-component.test.ts`; Playwright intro check | Local and PR CI run `31339674025` passed. | Generated deployed link opens with the intended pseudonymous code and no initial validation failure. |
| F3 | Participant introduction is reduced to necessary content and the full audio-guidance panel is rendered once, not above every item. | `source/src/accessible-nasa-tlx.ts`; intro/support disclosure and in-question rendering | `source/tests/component.test.ts`; `source/tests/accessibility.test.ts`; Playwright intro/item/review checks | PR CI run `31339674025` passed the below-160-word intro gate and absence of repeated `.audio-guidance` on item/review screens. | Deployed intro/item inspection for the final SHA. |
| F4 | A stable definition hash is carried in configuration and result, recomputed at load and submission, and a missing or mismatched Version 4 fingerprint blocks success or stored-result restoration. | `source/src/study.ts`; `source/src/result-sink.ts`; configuration/result/CSV/Qualtrics fields | `source/tests/study.test.ts`; `source/tests/study-component.test.ts`; `source/tests/result-sink.test.ts`; `source/tests/technical-evaluation.test.ts` | PR CI run `31339674025` passed stale-hash, delete-the-hash, submission-block, stored-result and reconstruction checks. Hashless Version 4 migration is removed; explicit Version 3 migration remains. | Deployed tamper tests cannot submit, restore or show false success. The hash is an unsigned consistency fingerprint, not proof of researcher origin. |
| F5 | axe scans run in a real browser in CI over all required runner states and reports are published. | `.github/workflows/verify.yml`; `source/playwright.config.ts`; `source/tests/e2e/browser-accessibility.spec.ts`; report publisher | Four Playwright scenarios cover 12 named states under five profiles: 1280, 768, 320 CSS pixels, CDP 200% zoom and a 640×450 companion viewport, for 60 required scans. Tests also check overflow, target size and rendered focus. | Run `31339674025` published 60/60 scans with 0 violations, incomplete checks, overflow failures, target-size failures or missing states; artefact `9045449132`. | Repeat on final main/deployment SHA and archive with the immutable release. |

## Endpoint-label PS

| Requirement | Code/test evidence | Current status | Final evidence |
| --- | --- | --- | --- |
| Retain the fieldset legend as the announced endpoint source; keep the visual anchor `aria-hidden`; suppress an option label only when it exactly duplicates its endpoint; preserve distinct middle labels on a five-point German scale. | `source/src/accessible-nasa-tlx.ts` (`visibleResponseLabel`); `source/tests/platform-component.test.ts`; `source/tests/e2e/browser-accessibility.spec.ts` German five-point route | Unit/component and PR CI run `31339674025` rendered-browser tests passed. | Deployed visual and accessibility-tree inspection. |

## Latest technical-evaluation requirements

| ID | Requirement | Frozen evidence source | Local quantified result | Status before CI/manual execution |
| --- | --- | --- | --- | --- |
| L1 | Manual walkthrough on NVDA/Firefox, NVDA/Chrome, VoiceOver/Safari and one OS voice-control route, including pairwise, review, error, listening, pending and saved-progress states; report by WCAG criterion with exact announcements. | `docs/manual-audit/AQP-MANUAL-AT-AUDIT-v1.0.md` and `deliverables/AQP_Manual_AT_Audit_v1.docx` | Protocol contains A01–A23 state checks, route columns, exact-speech fields, severity rules and a WCAG summary. | **Not executed. All required cells remain `NT`; C2 remains Not evidenced.** |
| L2a | Programmatic fidelity round trip for all three distributable built-ins and every QSF/LSS/LSG/LSQ fixture against an independent source of truth. | `docs/evidence/fidelity-source-of-truth.json`; `source/tests/technical-evaluation.test.ts`; `docs/evidence/technical-evaluation-report.json/.html` | 8 cases; 31 items; 234 field comparisons; 0 mismatches. UEQ-S content is excluded because public redistribution/deployment permission was not established. | Evidenced in PR CI run `31339674025`; technical artefact `9045426794`. Final main/deployment reproduction remains. |
| L2b | Negative battery covering 12 specified adversarial inputs with zero silently altered. | Same technical test and report | 12 inputs; 10 specific refusals; 2 generic XML refusals; 0 documented losses; 0 silently altered. | Evidenced in PR CI run `31339674025`; final main/deployment reproduction remains. |
| L2c | Real-browser WCAG scans in CI at 1280, 768 and 320 widths and 200% zoom, with every named state and a published artefact. | Browser specification, Playwright configuration and `verify.yml` | The correction candidate's original synthetic semantic-differential state completed 60/60 scans with 0 violations, incomplete checks, overflow failures, target-size failures or missing states. | Evidenced in PR CI run `31339674025`; rendered artefact `9045449132`. Final main/deployment reproduction remains. |
| L2d | Cross-browser support matrix, explicitly recording Firefox/Web Speech limitations. | `source/tests/e2e-support/cross-browser-support.spec.ts`; `docs/CROSS-BROWSER-SUPPORT-MATRIX.md`; browser-support report publisher | PR CI recorded Chromium 151, Firefox 153 and Playwright WebKit 26.5. Firefox and WebKit exposed no built-in SpeechRecognition; Linux WebKit is explicitly not Safari/VoiceOver evidence. | Evidenced in PR CI run `31339674025`; manual AT and final-release checks remain. |
| L2e | Reconstruct original instrument and response set from the result export alone. | Technical test and report; embedded complete definition in each result record | 8/8 exports and 31/31 responses reconstructed; 0 mismatches. | Evidenced in PR CI run `31339674025`; final main/deployment reproduction remains. |
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

- [x] Commit the functional correction candidate as `882bd5ce0007e89f40fd42762338abea4714a7ca`.
- [x] Update draft pull request #68 with the implementation and evidence map.
- [x] Obtain passing PR CI run `31339674025` (tested merge revision `c8eb9ddd9b1ca65614442756663c58efec48b630`).
- [ ] Download/archive the `quantified-technical-evaluation` artefact.
- [ ] Download/archive the `rendered-accessibility-evidence` artefact.
- [ ] Confirm the `gh-pages` deployment is built from the same verified SHA.
- [ ] Re-test F1–F4 and the German endpoint case on the public deployment.
- [ ] Execute and complete the manual audit on R1–R4, replacing every required `NT`.
- [ ] Record failures rather than converting them into passes; fix and re-run where necessary.
- [ ] Update matrix v6 statuses from Pending/Not evidenced only when the corresponding evidence exists.
- [ ] Send the supervisor the deployed URL, commit SHA, CI run/artifact links, matrix v6 and completed audit.
