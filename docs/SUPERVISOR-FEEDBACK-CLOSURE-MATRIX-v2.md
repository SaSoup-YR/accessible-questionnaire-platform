# Supervisor feedback closure matrix v2

Version: 2.5\
Frozen: 2026-08-10\
Candidate branch: `feat/researcher-wizard`\
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
| F1 | Review shows the item statement, selected answer meaning and one direct Change control per item. | `source/src/accessible-nasa-tlx.ts`: review records; a declared label for the selected value or, when no such label exists, the declared scale endpoints without invented wording; unique visible **Change item N answer** labels; gaze targets; direct edit and focus return; transactional pending value/input route. | Component and rendered-browser routes use Brooke's `5, 1, 4, 2, 3, 5, 1, 4, 2, 3` vector and directly assert Mark's Item 3 = 4 case. They also test direct Save and real Cancel-after-selection. Before Save, recovery storage remains on Review with the original value, input route and score; Cancel retains them; Save alone commits. A failure includes a missing prompt, missing declared selected label/endpoint context, invented label, non-unique or non-targetable Change control, opening the wrong item, false cancellation, premature storage, changing another answer or failing to return focus. | CI-pass on candidate `9a8c849` in run `31392425368`. Manual A16/A17/A21 and final deployment acceptance remain pending. | Execute A16/A17/A21; then merge only with authority, deploy and smoke-test Item 3 = 4 plus both Save and Cancel on the public build. |
| F2 | Participant code is prefilled from the generated link and remains editable as fallback. | `source/src/study.ts` and `study-conductor.ts`: per-link pseudonymous code, validation, hash-navigation reload and committed-session precedence; the Skip link preserves the application hash. | Component and rendered-browser routes cover distinct generated links, same-tab P001 → P002 replacement without a test-only reload, missing/manual/invalid codes, committed correction recovery, Skip focus/hash preservation and final-record identity. | CI-pass on candidate `9a8c849` in run `31392425368`. Manual A02 and final deployment acceptance remain pending. | Execute A02; after an authorised deployment, open two distinct generated links, confirm distinct editable codes and no first-screen validation error, exercise Skip, reload and confirm the same identity/session. |
| F3 | Participant introduction is minimal; full audio guidance appears once, not before every item. | Intro/support disclosure and compact in-question controls in `accessible-nasa-tlx.ts`; the full audio-guidance panel is confined to **Accessibility and audio options (optional)** on the introduction. | Real-browser regression requires the optional disclosure to start collapsed, one intro `.audio-guidance`, fewer than 160 visible intro words, and no `.process-overview`, `.factor-reference` or `.study-details`; `.audio-guidance` must be absent after Start and on Review. Component coverage also checks the NASA-TLX rating, pairwise and review route. | CI-pass on candidate `9a8c849` in run `31392425368`. This proves bounded removal of AQP-owned boilerplate and repetition, not reduced cognitive burden or short researcher-supplied `introPrompt` content. Manual A01/A03/A04 and final deployment acceptance remain pending. | Execute A01/A03/A04; after an authorised deployment, inspect intro/item/pairwise/review. Treat the word limit as a regression threshold, not evidence of cognitive accessibility. |
| F4 | Canonical definition hash is in configuration and result and is verified at load and submission. | Version 4 configuration/result schemas, canonical SHA-256, immutable result definition snapshot, CSV/Qualtrics fields and fail-closed checks. The Qualtrics parent requires a valid fingerprint plus matching snapshot metadata and writes `AQP_ACCEPTED = 1` only after every staged field succeeds. | Missing/stale hash link, submission and stored-result tamper tests; export reconstruction; missing/malformed runtime fingerprint and missing snapshot rejection; injected `AQP_RAW_05` staging failure with no acceptance marker. | CI-pass on candidate `4fe422c` in run `31399712181`: 208/208 deterministic tests, 9/9 rendered-browser tests, 3/3 browser-support routes and release synchronisation passed. | Re-test tampered link/submission and one fresh synthetic Qualtrics row after an authorised deployment. Confirm `AQP_ACCEPTED = 1`, a valid definition hash and reconstructable raw record. The fingerprint proves internal consistency and identifiability, not authenticated authorship or resistance to replacement of both unsigned definition and hash. |
| F5 | Real-browser axe scans run in CI and publish a report. | Playwright specification, `verify.yml`, JSON/HTML publisher and uploaded Playwright traces/results. | Frozen S01–S27 inventory × five profiles = 135 required rows; missing rows, violations, incomplete checks, overflow and target-size failures are reported. | CI-pass on candidate `816e1c4`: 135/135 rows, 0 violations, 0 overflow failures, 0 critical target-size failures and 0 missing combinations. Thirteen incomplete `color-contrast` scan results involving 20 gaze-state node occurrences are listed with targets/failure summaries and remain inspection items; a target may recur across state/profile rows. | Manually determine and record every overlap-dependent contrast occurrence; repeat the automated run on final main/release SHA. |

## B. Latest feedback, section 1 — manual technical accessibility audit

| Requirement | Evidence artefact | Current status | Completion rule |
| --- | --- | --- | --- |
| NVDA/Firefox, NVDA/Chrome, VoiceOver/Safari and one OS voice-control walkthrough. | `docs/manual-audit/AQP-MANUAL-AT-AUDIT-v1.0.md` (protocol v1.3). | Manual-NT on all four routes. | Record exact OS/browser/AT versions and replace every applicable NT with P/F/NA plus evidence ID. |
| Cover every participant state, including pairwise, review, error, voice listening/pending and saved-progress offer. | S01–S27 maps to A01–A33 in `docs/PARTICIPANT-RUNNER-STATE-INVENTORY-v1.md`. | Protocol-ready; observations NT. | Run A01–A33 on the applicable routes; an untested state cannot be inferred from source or axe. |
| Report by WCAG criterion with exact announcements and treat unusable markup as fail. | WCAG route summary, exact-speech fields, P/F/NA/NT rules and S1–S3 issue log in the audit. | Protocol-ready; observations NT. | Transcribe actual speech, including `[no announcement]`; zero NT before calling the audit complete. |
| Publish a versioned audit and bound the claim. | Audit publication wording and matrix C2. | Document ready; C2 Not evidenced. | Publish only after execution; state technical audit only and no disabled-user benefit evidence. |

## C. Latest feedback, section 2 — quantified technical evaluation

| ID | Required evaluation | Reproducible artefact | Current quantified result | Status/gap |
| --- | --- | --- | --- | --- |
| T1 | Programmatic fidelity round trip against independent truth for built-ins and every QSF/LSS/LSG/LSQ fixture. | `docs/evidence/fidelity-source-of-truth.json`, `source/tests/technical-evaluation.test.ts`, generated JSON/HTML report. | 8 cases, 31 items, 234 field comparisons, 0 mismatches. | CI-pass on candidate `816e1c4`. Only three distributable built-ins are present; UEQ-S is excluded pending redistribution permission. This is a disclosed scope shortfall, not a fourth pass. |
| T2 | Twelve-row adversarial battery and zero silently altered. | Same technical test/report. | 12 inputs: 10 specific refusals, 2 generic XML refusals, 0 accepted losses, 0 silently altered. | CI-pass on candidate `816e1c4`; final main/release reproduction pending. |
| T3 | Every runner state at 1280, 768, 320 and 200% zoom, with build artefact. | Frozen state inventory, Playwright/axe spec, CI workflow and report publisher. | 135/135 required state/profile rows; 0 violations; 13 incomplete `color-contrast` scan results involving 20 node occurrences; 0 overflow failures; 0 critical target-size failures; and 0 missing rows. | CI-pass on candidate `816e1c4`. Deterministic fixtures are labelled where external host/hardware callbacks are simulated. Incomplete contrast occurrences require recorded inspection and are not automatic passes. |
| T4 | Cross-browser support matrix and explicit Firefox/Web Speech limitation. | `source/tests/e2e-support/cross-browser-support.spec.ts` and `docs/CROSS-BROWSER-SUPPORT-MATRIX.md`. | Capability test passed the production runner smoke route in Chromium, Firefox and Playwright WebKit; SpeechRecognition present in Chromium and absent in Firefox/WebKit. | CI-pass on candidate `816e1c4`; WebKit/Linux is not Safari/VoiceOver evidence and OS voice control remains not assessed. |
| T5 | Reconstruct definition, response set and score from export alone. | Technical evaluation reconstruction rows and self-contained result definition. | 8/8 exports and 31/31 responses reconstructed, 0 mismatches. | CI-pass on candidate `816e1c4`; final main/release reproduction pending. |
| T6 | Quantify definition-driven reuse rather than assume it. | Technical evaluation reuse/allowlist rows. | 5 compatible imports admitted as data with 0 instrument-specific production files; 96/96 shared contract executions with 0 test copies; 16/16 allowlist combinations match. | CI-pass on candidate `816e1c4`. A new scorer/response structure remains an executable boundary and is not a data-only pass. |

## D. Latest feedback, section 3 — matrix v6

| Requirement | Resolution | Current status |
| --- | --- | --- |
| Remove C6 rather than leave it unevidenced. | C6 is in a Removed row, not an active claim. | Complete. |
| Give C2 a decision rule for the new audit design. | C2 requires 135 browser rows plus complete manual P/F/NA observations and no S3 failure on a supported route. | Rule complete; evidence Not evidenced. |
| Give C5 a decision rule for the optional observed researcher study. | C5 freezes success, time, assist/error, discrepancy, SEQ/SUS and second-coder evidence and prohibits significance tests. | Rule complete; study Not evidenced. |
| Make C7's definition hash checkable. | C7 requires canonical hash agreement, rejection of missing/stale Version 4 hashes and export-only reconstruction. Qualtrics host acceptance additionally requires a schema-complete definition snapshot and a last-write acceptance marker. | CI-pass on candidate `4fe422c` in run `31399712181`; deployment and fresh synthetic Qualtrics-row verification remain pending. |
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
| Dissertation must stand without sessions. | Technical evaluation T1–T6 plus manual technical audit form the core; optional observed sessions cannot delay the draft. | Candidate technical CI complete; manual audit and overlap-dependent contrast determinations still NT. |
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

Candidate `4fe422c` result in CI run
[31399712181](https://github.com/SaSoup-YR/accessible-questionnaire-platform/actions/runs/31399712181):
20/20 files and 208/208 tests passed; 8
fidelity cases, 31 items and 234 comparisons with 0 mismatch; 12 adversarial
inputs with 0 silent alteration; 8/8 exports and 31/31 responses reconstructed;
5 data-only compatible imports, 96/96 shared contract executions and 16/16
allowlist checks. The rendered artefact contains 135/135 state/profile rows,
0 violations, 13 incomplete contrast results involving 20 node occurrences, 0 overflow
failures, 0 critical target-size failures and no missing row.

## Release-complete checklist

- [x] Push candidate `4fe422c` to Draft PR #68.
- [x] Obtain current-candidate CI with 135/135 rendered state/profile rows.
- [x] Retain quantified technical, rendered accessibility and cross-browser artefacts tied to the commit SHA (run `31399712181`; rendered artifact `9067181758`, SHA-256 `52b4631a98d03857d10356632bf09a3c7ac3627a1f7dca822b9052f2a02a8adb`; quantified artifact `9067100601`, SHA-256 `10bc877be89e9ed32c397e4d15a36aae324389a871386280661e3b74f4cd8686`).
- [ ] Inspect and record all 20 reported overlap-dependent axe contrast occurrences; do not count them as 20 unique defects or as automatic passes.
- [ ] Obtain review/merge authority and deploy that verified commit to Pages.
- [ ] Re-test F1–F4 and the German endpoint case on the deployment. F1 includes changing item 2 and cancelling before a separate Save run; verify answer, route, score, recovery record, focus and visible label command.
- [ ] Execute A01–A33 on R1–R4 and retain exact observations.
- [ ] Record failures honestly, fix them and re-run; do not convert NT/NA into pass.
- [ ] Update matrix statuses only from the resulting evidence.
- [ ] Send the deployed URL, immutable SHA, CI/artifact links, matrix v6.3 and completed audit to the supervisor.
