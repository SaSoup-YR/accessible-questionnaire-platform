# AQP Evidence Index

Date: 22 August 2026  
Immutable final prototype release: `v0.8.0`  
Final product merge commit: `ef3f46614bc3b40d02de1665a2901d017a5e00ab`  
Repository-curation release in preparation: `v0.8.1`

This index maps final dissertation and release claims to persistent repository records. It separates the immutable pre-repair baseline, targeted post-fix evidence, final integrated implementation, later public-entry curation, and residual limitations.

## Reading Rules

- Historical audit files are not rewritten to make later repairs appear at baseline.
- A repair branch or passing automated workflow is not manual assistive-technology evidence.
- Real NVDA, VoiceOver, and Windows Voice Access observations determine the corresponding manual route result.
- Archived files are retained for provenance but are not current instructions.
- `v0.8.0` remains immutable. `v0.8.1` does not move or replace that tag.

## Contribution and Architecture

| Claim | Primary implementation or evidence | Safe interpretation |
| --- | --- | --- |
| One participant runner can execute compatible loaded definitions. | `source/src/questionnaire-definition.ts`; `source/src/accessible-nasa-tlx.ts`; `questionnaires/questionnaire-definition.schema.json`; `docs/AQP-FINAL-CONTRIBUTION-v2.md` | Bounded reuse across the documented profile, not arbitrary questionnaire independence. |
| Configuration and results carry a canonical definition fingerprint and definition snapshot. | `source/src/study.ts`; `source/src/result-sink.ts`; `source/tests/study.test.ts`; `source/tests/result-sink.test.ts`; `docs/SOURCE-VERIFICATION-A1-F4.md` | Integrity and reconstruction mechanism, not a digital signature or proof of authorship. |
| QSF, LSS, LSG, and LSQ conversion is review-first and fail-closed. | `source/src/platform-questionnaire-import.ts`; `source/tests/platform-questionnaire-import.test.ts`; `docs/INSTRUMENT-DEFINITION-GUIDE.md`; `docs/CUSTOM-QUESTIONNAIRE-TEST.md` | Supports the named ordered-rating subset only. Unsupported content is not silently converted. |
| Result staging and recovery avoid a false durable-recording claim. | `source/src/result-sink.ts`; `integrations/qualtrics/`; `docs/QUALTRICS-INTEGRATION.md`; PR #69; PR #70 | Page-side staging is not represented as durable Qualtrics recording. |
| Review editing is transactional. | `source/src/accessible-nasa-tlx.ts`; `source/tests/component.test.ts`; `source/tests/e2e/browser-accessibility.spec.ts` | Cancel preserves committed answer, route, score, and stored progress; Save commits the provisional answer. |
| The public root represents the platform rather than one default questionnaire. | `source/src/landing.ts`; `source/src/main.ts`; `source/index.html`; `source/tests/landing.test.ts`; `source/tests/e2e/landing.spec.ts` | `v0.8.1` adds a platform landing page and three configured local demonstrations without moving `v0.8.0`. |

## Immutable Baseline

| Evidence | Identity | Use |
| --- | --- | --- |
| Manual AT audit matrix | `docs/manual-audit/AQP-MANUAL-AT-AUDIT-v1.0.md` | Frozen pre-repair route/check evidence. |
| Baseline totals | 132 cells: 94 Pass, 31 Fail, 7 Not applicable, 0 Not tested | Report unchanged. Targeted post-fix results are not a new full matrix. |
| Historical q10 boundary | `docs/archive/legacy/FINAL-EVIDENCE-FREEZE-2026-08-18.md` | Archived pre-final record that separates executed identities and claims. |

## Targeted Repair Evidence

### RF-01: Qualtrics Connection Status and Safe Gating

- retained implementation/evidence head: `b173707024bf4b3b6caa7ddfa99357571d571190`;
- manual adjudication: `docs/evidence/RF01-POSTFIX-MANUAL-AUDIT-2026-08-20.md`;
- result: R1 Pass, R2 Pass, R3 Fail retained, R4 Pass;
- residual: R3-A26 initial `Connecting` status was visible but not automatically exposed by VoiceOver with Safari;
- archived development records: `docs/archive/evidence/RF01-AUTOMATED-REPAIR-CANDIDATE-2026-08-20.md` and `docs/archive/evidence/RF01-REPAIR-PLAN-2026-08-20.md`.

### RF-02 / A27: Truthful Staging and Advance-Failure Recovery

- PR #69: truthful pre-host submission states;
- PR #70: preserve the live iframe and recovery state after Qualtrics advance failure;
- archived historical boundary: `docs/archive/legacy/FINAL-EVIDENCE-FREEZE-2026-08-18.md`;
- result: targeted R1-R4 A27 closure without describing page-side staging as durable host recording.

### RF-03 / A28: Storage and Result-Sink Refusal Recovery

- merged product/evidence family: PR #73;
- current records:
  - `docs/evidence/RF03-POSTFIX-MANUAL-AUDIT-2026-08-20.md`;
  - `docs/evidence/RF03-POSTFIX-REGRESSION-AUDIT-2026-08-20.md`;
  - `docs/evidence/RF03-FINAL-EVIDENCE-FREEZE-2026-08-20.md`;
- archived development records:
  - `docs/archive/evidence/RF03-AUTOMATED-REPAIR-CANDIDATE-2026-08-20.md`;
  - `docs/archive/evidence/RF03-MANUAL-RETEST-PROTOCOL-2026-08-20.md`;
- result: four historical A28 failures received targeted post-fix Pass evidence.

### RF-04: Saved-Session Focus and Direct Resume

- first retained direct-resume repair: PR #72;
- final native-dialog candidate: `0444d6f8a3a77f7cb9409d79c01a75ff42d9471d`;
- final evidence head integrated into the release: `fcaa0a7ba471c545f2c9ad84ffc4a6e607e073b6`;
- records:
  - `docs/evidence/RF04-POSTFIX-MANUAL-AUDIT-2026-08-20.md`;
  - `docs/evidence/RF04-FINAL-EVIDENCE-FREEZE-2026-08-20.md`;
  - `docs/evidence/RF04-NATIVE-DIALOG-SUCCESSOR-PLAN-2026-08-22.md`;
  - `docs/evidence/RF04-NATIVE-DIALOG-POSTFIX-MANUAL-AUDIT-2026-08-22.md`;
- final result: R3-A14 Fail to Pass, R3-A15 Pass retained, and all six historical RF-04 A14/A15 failures have targeted closure evidence.

### RF-05: 320 CSS-Pixel Reflow

- retained head: `84b39af34b5914847156d0a13a6353bee5b1b003`;
- record: `docs/evidence/RF05-AUTOMATED-REPAIR-CANDIDATE-2026-08-20.md`;
- result: R1-A22 and R4-A22 Fail to Pass on the frozen narrow-view procedure, with separate normal full-screen 200% checks retained.

### RF-06: Voice Listening Lifecycle and Recovery

- retained cumulative source incorporated through `1e0f5bcf360b3b27322c831247159fe9808cb041`;
- record: `docs/evidence/RF06-REPAIR-PLAN-2026-08-21.md`;
- residual: R4-A10 Fail retained because simultaneous Windows Voice Access and page-level Web Speech did not reliably deliver the stop command.

### RF-07: Speech Proposal and Negation Safety

- retained head: `1e0f5bcf360b3b27322c831247159fe9808cb041`;
- records:
  - `docs/evidence/RF07-A11-A12-REPAIR-PLAN-2026-08-21.md`;
  - `docs/evidence/RF07-FINAL-EVIDENCE-FREEZE-2026-08-21.md`;
- retained implementation: strict exact parsing, cross-alternative negation veto, bounded contextual hints, visible transcript/proposal, and explicit confirmation;
- residual: R3-A11, R3-A12, R4-A11, and R4-A12 remain Fail because the live recognizer did not reliably return the frozen two-word phrases.

### RF-08: Smiley Voice Access Targetability

- retained cumulative source incorporated through `1e0f5bcf360b3b27322c831247159fe9808cb041`;
- records:
  - `docs/evidence/RF08-A29-REPAIR-CANDIDATE-2026-08-21.md`;
  - `docs/evidence/RF08-A29-POSTFIX-MANUAL-AUDIT-2026-08-21.md`;
- result: native smiley radios retain names and values while exposing real on-screen geometry for label and number-overlay operation; the precise-scale fallback remains.

### RF-09: Support-Setting Feedback

- retained cumulative source incorporated through `1e0f5bcf360b3b27322c831247159fe9808cb041`;
- current records:
  - `docs/evidence/RF09-A33-POSTFIX-MANUAL-AUDIT-2026-08-21.md`;
  - `docs/evidence/RF09-A33-ARIANOTIFY-MANUAL-AUDIT-2026-08-21.md`;
  - `docs/evidence/RF09-A33-FINAL-SINGLE-CHANNEL-MANUAL-OBSERVATION-2026-08-21.md`;
  - `docs/evidence/RF09-A33-FINAL-CUMULATIVE-CLOSURE-2026-08-22.md`;
- result: R3-A33 and R4-A33 Fail to Pass through cumulative manual evidence plus final-runtime focus and answer invariants;
- superseded candidates are retained under `docs/archive/evidence/`.

## Immutable v0.8.0 Release

| Evidence | Exact identity or result |
| --- | --- |
| Software version/tag | `v0.8.0` |
| Final exact PR head | `d4a99cd4426c95d6f60d24d4f7f9d2f2aef1b223` |
| Final exact PR workflow | `32545032524` - success |
| Merge commit | `ef3f46614bc3b40d02de1665a2901d017a5e00ab` |
| Final documentation/provenance head before v0.8.1 work | `fbbdad5e78c22c26c5c5b020d24b1b876b352b91` |
| Unit/component | 26/26 files; 230/230 tests |
| Rendered-browser | 12/12 tests |
| Cross-browser support | 18/18 tests across Chromium, Firefox, and Playwright WebKit |
| Builds | production, standalone, synchronized release, and committed-output freshness passed |
| Dependency audit | 0 reported vulnerabilities in the locked installation |
| Quantified artifact | ID `9468227978` |
| Rendered artifact | ID `9468264597` |
| Publication record | `docs/evidence/MAIN-RELEASE-PUBLICATION-2026-08-22.md`; `docs/evidence/V0.8.0-RELEASE-PUBLICATION.json`; `docs/evidence/PUBLIC-PAGES-SMOKE-2026-08-22.json` |

`v0.8.0` is not moved during the `v0.8.1` curation release.

## Final Residual and Claim Boundary

Primary current records:

- `docs/evidence/FINAL-PROTOTYPE-FREEZE-2026-08-22.md`;
- `RELEASE-NOTES.md`;
- `BUILD-INFO.json`.

Archived planning record:

- `docs/archive/evidence/PROTOTYPE-FREEZE-AND-RESIDUAL-LIMITATIONS-PLAN-2026-08-22.md`.

Safe final statement:

> The immutable pre-repair audit contained 31 failures across 132 route/check cells. Targeted remediation and exact-route retesting closed 25 historical failures. Six configuration-specific failures remained: one VoiceOver and Safari embedded connection-status exposure cell, one simultaneous Windows Voice Access and Web Speech control cell, and four live browser speech-recognition cells. The remaining failures were retained rather than hidden, inferred, or converted to passes from automated evidence.

Do not use this repository to claim a disabled-user benefit study, universal accessibility, complete WCAG conformance, or psychometric equivalence.
