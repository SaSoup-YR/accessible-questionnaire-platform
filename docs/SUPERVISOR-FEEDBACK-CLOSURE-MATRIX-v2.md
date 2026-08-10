# Supervisor feedback closure matrix v2

Version: 2.3
Frozen: 2026-08-10
Candidate branch: `feat/researcher-wizard`
Release rule: implementation is not marked release-complete until the named
test passes in CI for an immutable commit, its report is retained, the same
commit is deployed, and the deployment is re-tested.

## Status codes

- **Local-pass:** production code and a falsifiable local test pass.
- **CI-pending:** a real-browser or release result needs the Draft PR CI run.
- **CI-pass:** the named Draft PR commit and retained artefact satisfy the stated
  candidate gate; final main/deployment evidence is still separate.
- **Manual-NT:** the required observation has not been made and is not counted.
- **Protocol-ready:** a complete method exists but no participant data exist.
- **Blocked:** a named external decision, permission or approval is missing.

## A. First five code corrections

| ID | Supervisor requirement | Implemented evidence | Falsifiable evidence | Current status | Final gate |
| --- | --- | --- | --- | --- | --- |
| F1 | Review shows the item statement, selected answer meaning and one direct Change control per item. | `source/src/accessible-nasa-tlx.ts`: review records; a declared label for the selected value or, when no such label exists, the declared scale endpoints without invented wording; unique visible **Change item N answer** labels; gaze targets; direct edit and focus return; transactional pending value/input route. | Component and rendered-browser routes use Brooke's `5, 1, 4, 2, 3, 5, 1, 4, 2, 3` vector and directly assert Mark's Item 3 = 4 case. They also test direct Save and real Cancel-after-selection. Before Save, recovery storage remains on Review with the original value, input route and score; Cancel retains them; Save alone commits. A failure includes a missing prompt, missing declared selected label/endpoint context, invented label, non-unique or non-targetable Change control, opening the wrong item, false cancellation, premature storage, changing another answer or failing to return focus. | Local-pass for the endpoint-context implementation and regression. Prior candidate `881d834` passed the remaining automated routes; the new change requires fresh PR CI. Manual A16/A17/A21, merge and deployment remain pending. | Obtain fresh candidate CI; execute A16/A17/A21; then merge with authority, deploy and smoke-test Item 3 = 4 plus both Save and Cancel on the public build. |
| F2 | Participant code is prefilled from the generated link and remains editable as fallback. | `source/src/study.ts` and `study-conductor.ts`: per-link pseudonymous code, validation and stale-session precedence. | Link generation/load/recovery tests and rendered intro assertion. | Local-pass. | CI, deploy, open two distinct generated links and confirm distinct editable codes and no first-screen validation error. |
| F3 | Participant introduction is minimal; full audio guidance appears once, not before every item. | Intro/support disclosure and compact in-question controls in `accessible-nasa-tlx.ts`. | Intro word-count gate and absence of `.audio-guidance` on item/review states. | Local-pass. | CI and deployed intro/item/review inspection. |
| F4 | Canonical definition hash is in configuration and result and is verified at load and submission. | Version 4 configuration/result schemas, canonical SHA-256, CSV/Qualtrics fields and fail-closed checks. | Missing/stale hash link, submission and stored-result tamper tests; export reconstruction test. | Local-pass. | CI and deployed tampered-link/submission checks. The hash proves consistency, not authenticated authorship. |
| F5 | Real-browser axe scans run in CI and publish a report. | Playwright specification, `verify.yml`, JSON/HTML publisher and uploaded Playwright traces/results. | Frozen S01–S27 inventory × five profiles = 135 required rows; missing rows, violations, incomplete checks, overflow and target-size failures are reported. | CI-pass on candidate `816e1c4`: 135/135 rows, 0 violations, 0 overflow failures, 0 critical target-size failures and 0 missing combinations. Thirteen incomplete `color-contrast` rule results covering 20 gaze-state nodes are listed with targets/failure summaries and remain inspection items. | Manually determine and record the 20 overlap-dependent contrast outcomes; repeat the automated run on final main/release SHA. |

## B. Latest feedback, section 1 — manual technical accessibility audit

| Requirement | Evidence artefact | Current status | Completion rule |
| --- | --- | --- | --- |
| NVDA/Firefox, NVDA/Chrome, VoiceOver/Safari and one OS voice-control walkthrough. | `docs/manual-audit/AQP-MANUAL-AT-AUDIT-v1.0.md` (protocol v1.1). | Manual-NT on all four routes. | Record exact OS/browser/AT versions and replace every applicable NT with P/F/NA plus evidence ID. |
| Cover every participant state, including pairwise, review, error, voice listening/pending and saved-progress offer. | S01–S27 maps to A01–A33 in `docs/PARTICIPANT-RUNNER-STATE-INVENTORY-v1.md`. | Protocol-ready; observations NT. | Run A01–A33 on the applicable routes; an untested state cannot be inferred from source or axe. |
| Report by WCAG criterion with exact announcements and treat unusable markup as fail. | WCAG route summary, exact-speech fields, P/F/NA/NT rules and S1–S3 issue log in the audit. | Protocol-ready; observations NT. | Transcribe actual speech, including `[no announcement]`; zero NT before calling the audit complete. |
| Publish a versioned audit and bound the claim. | Audit publication wording and matrix C2. | Document ready; C2 Not evidenced. | Publish only after execution; state technical audit only and no disabled-user benefit evidence. |

## C. Latest feedback, section 2 — quantified technical evaluation

| ID | Required evaluation | Reproducible artefact | Current quantified result | Status/gap |
| --- | --- | --- | --- | --- |
| T1 | Programmatic fidelity round trip against independent truth for built-ins and every QSF/LSS/LSG/LSQ fixture. | `docs/evidence/fidelity-source-of-truth.json`, `source/tests/technical-evaluation.test.ts`, generated JSON/HTML report. | 8 cases, 31 items, 234 field comparisons, 0 mismatches. | CI-pass on candidate `816e1c4`. Only three distributable built-ins are present; UEQ-S is excluded pending redistribution permission. This is a disclosed scope shortfall, not a fourth pass. |
| T2 | Twelve-row adversarial battery and zero silently altered. | Same technical test/report. | 12 inputs: 10 specific refusals, 2 generic XML refusals, 0 accepted losses, 0 silently altered. | CI-pass on candidate `816e1c4`; final main/release reproduction pending. |
| T3 | Every runner state at 1280, 768, 320 and 200% zoom, with build artefact. | Frozen state inventory, Playwright/axe spec, CI workflow and report publisher. | 135/135 required state/profile rows; 0 violations, 13 incomplete `color-contrast` results/20 nodes, 0 overflow failures, 0 critical target-size failures and 0 missing rows. | CI-pass on candidate `816e1c4`. Deterministic fixtures are labelled where external host/hardware callbacks are simulated. Incomplete contrast nodes require recorded inspection and are not automatic passes. |
| T4 | Cross-browser support matrix and explicit Firefox/Web Speech limitation. | `source/tests/e2e-support/cross-browser-support.spec.ts` and `docs/CROSS-BROWSER-SUPPORT-MATRIX.md`. | Capability test passed the production runner smoke route in Chromium, Firefox and Playwright WebKit; SpeechRecognition present in Chromium and absent in Firefox/WebKit. | CI-pass on candidate `816e1c4`; WebKit/Linux is not Safari/VoiceOver evidence and OS voice control remains not assessed. |
| T5 | Reconstruct definition, response set and score from export alone. | Technical evaluation reconstruction rows and self-contained result definition. | 8/8 exports and 31/31 responses reconstructed, 0 mismatches. | CI-pass on candidate `816e1c4`; final main/release reproduction pending. |
| T6 | Quantify definition-driven reuse rather than assume it. | Technical evaluation reuse/allowlist rows. | 5 compatible imports admitted as data with 0 instrument-specific production files; 96/96 shared contract executions with 0 test copies; 16/16 allowlist combinations match. | CI-pass on candidate `816e1c4`. A new scorer/response structure remains an executable boundary and is not a data-only pass. |

## D. Latest feedback, section 3 — matrix v6

| Requirement | Resolution | Current status |
| --- | --- | --- |
| Remove C6 rather than leave it unevidenced. | C6 is in a Removed row, not an active claim. | Complete. |
| Give C2 a decision rule for the new audit design. | C2 requires 135 browser rows plus complete manual P/F/NA observations and no S3 failure on a supported route. | Rule complete; evidence Not evidenced. |
| Give C5 a decision rule for the optional observed researcher study. | C5 freezes success, time, assist/error, discrepancy, SEQ/SUS and second-coder evidence and prohibits significance tests. | Rule complete; study Not evidenced. |
| Make C7's definition hash checkable. | C7 requires canonical hash agreement, rejection of missing/stale Version 4 hashes and export-only reconstruction. | Local-pass; release verification pending. |
| Fill every evidence status, including Not evidenced. | `docs/AQP-EVALUATION-MATRIX-v6.md` v6.2 has a status for every active row. | Complete for the candidate state; update only after new evidence. |

## E. Latest feedback, section 4 — optional observed researcher protocol

| Requirement | Frozen resolution | Current status |
| --- | --- | --- |
| Define Qualtrics start/end state. | A frozen UCL Qualtrics template already contains the ten SUS items, values, required setting, one-question-per-page structure and checked Brooke scoring; participants do not type from scratch. Required end state is identical and independently checked. | Protocol-ready; template/version/account and final URL must be frozen before preregistration. |
| Counterbalance order. | Within-participant AQ/QA allocation, balanced before recruitment and recorded before each session. | Protocol-ready. |
| Six to eight participants; descriptive/per-participant reporting; no significance tests. | Per-participant rows plus n, median, minimum and maximum; no inferential test or general population claim. | Protocol-ready. |
| Define success, assist and error. | Operational definitions, 20-minute limit, end-state checklist, self-correction and critical-error rules are frozen in protocol v1.1. | Protocol-ready. |
| Fixed script, recording and independent coding. | Fixed observer script; screen/shared-window and session audio recorded with consent; second coder independently codes at least two sessions before consensus. | Protocol-ready; ethics/storage/coder activation fields blocked. |
| Mild deception and debrief. | General advance disclosure, sealed private source/altered definition, immediate exact debrief and seven-day withdrawal route. Exact discrepancy is not in the public repository. | Protocol-ready; amendment approval required. |

## F. Latest feedback, section 5 — ethics and dissertation boundary

| Requirement | Resolution | Current status |
| --- | --- | --- |
| Dissertation must stand without sessions. | Technical evaluation T1–T6 plus manual technical audit form the core; optional observed sessions cannot delay the draft. | Candidate technical CI complete; manual audit and 20 contrast determinations still NT. |
| Submit amendment by 11 August; if not approved by 18 August, omit sessions from 21 August draft. | Private template-based amendment pack and activation checklist prepared outside the public repository. | Draft pack ready; exact approval identity, route, storage, coder, retention alignment and signatures are blocked. |
| Record screens and disclose possible identifying capture, storage, retention and destruction. | PIS, consent, risk assessment and amendment narrative describe shared-window/session-audio recording, incidental identifiers, 24-hour RDSS transfer, deletion of working copies and proposed raw-recording destruction date. | Drafted; PI must confirm exact RDSS path and alignment with existing approval before submission. |

The uploaded `Project ID 1165` and Tianzhe Dong project title belong to a
different study and are explicitly excluded. The AQP approval ID and exact
approved title were not present in the supplied files; they must be copied from
the original AQP approval record or provided by the applicant/PI.

## G. Latest feedback, section 6 — repeated endpoint label

| Requirement | Implementation/test | Current status | Final gate |
| --- | --- | --- | --- |
| Keep the legend as the announced endpoint source; keep anchor row aria-hidden; suppress only an option label identical to its endpoint; retain distinct middle German labels. | `visibleResponseLabel` in `accessible-nasa-tlx.ts`; component regression and S27 real-browser case. | CI-pass on candidate `816e1c4`. | Deployed visual/accessibility-tree inspection. |

## Reproduction commands

From `source/`:

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

Candidate `816e1c4` result in CI run
[31377511113](https://github.com/SaSoup-YR/accessible-questionnaire-platform/actions/runs/31377511113):
20/20 files and 199/199 tests passed; 8
fidelity cases, 31 items and 234 comparisons with 0 mismatch; 12 adversarial
inputs with 0 silent alteration; 8/8 exports and 31/31 responses reconstructed;
5 data-only compatible imports, 96/96 shared contract executions and 16/16
allowlist checks. The rendered artefact contains 135/135 state/profile rows,
0 violations, 13 incomplete contrast results covering 20 nodes, 0 overflow
failures, 0 critical target-size failures and no missing row.

## Release-complete checklist

- [x] Push candidate `816e1c4` to Draft PR #68.
- [x] Obtain current-candidate CI with 135/135 rendered state/profile rows.
- [x] Retain quantified technical, rendered accessibility and cross-browser artefacts tied to the commit SHA (run `31377511113`, artifact IDs `9058573437` and `9058513218`).
- [ ] Inspect and record all 20 overlap-dependent axe contrast nodes; do not count them as automatic passes.
- [ ] Obtain review/merge authority and deploy that verified commit to Pages.
- [ ] Re-test F1–F4 and the German endpoint case on the deployment. F1 includes changing item 2 and cancelling before a separate Save run; verify answer, route, score, recovery record, focus and visible label command.
- [ ] Execute A01–A33 on R1–R4 and retain exact observations.
- [ ] Record failures honestly, fix them and re-run; do not convert NT/NA into pass.
- [ ] Update matrix statuses only from the resulting evidence.
- [ ] Send the deployed URL, immutable SHA, CI/artifact links, matrix v6.3 and completed audit to the supervisor.
