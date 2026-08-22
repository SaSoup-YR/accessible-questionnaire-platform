# AQP final evidence index

Date: 22 August 2026  
Software version: `0.8.0`  
Integrated product revision: `e00a737de964e120ffec38c5030d4ad212cbff5d`

This index maps the final dissertation/release claims to persistent repository records. It distinguishes the immutable pre-repair baseline, targeted post-fix evidence, integrated implementation evidence and residual limitations.

## Reading rule

- Historical audit files are not rewritten to make later repairs look as though they existed at baseline.
- A repair branch or passing CI run is not, by itself, manual assistive-technology evidence.
- Real NVDA, VoiceOver and Voice Access observations determine the corresponding manual route result.
- Later documentation-only commits do not alter the identified integrated product revision; the release tag is the authoritative final repository snapshot.

## Contribution and architecture

| Claim | Primary implementation/evidence | Safe interpretation |
| --- | --- | --- |
| One participant runner can execute compatible loaded definitions. | `source/src/questionnaire-definition.ts`; `source/src/accessible-nasa-tlx.ts`; `questionnaires/questionnaire-definition.schema.json`; `docs/AQP-FINAL-CONTRIBUTION-v2.md` | Bounded reuse across the documented schema/profile, not questionnaire independence for arbitrary instruments. |
| Configuration and results carry a canonical definition fingerprint and definition snapshot. | `source/src/study.ts`; `source/src/result-sink.ts`; `source/tests/study.test.ts`; `source/tests/result-sink.test.ts`; `docs/SOURCE-VERIFICATION-A1-F4.md` | Integrity and reconstruction mechanism, not a digital signature or proof of authorship. |
| QSF/LSS/LSG/LSQ conversion is review-first and fail-closed. | `source/src/platform-questionnaire-import.ts`; `source/tests/platform-questionnaire-import.test.ts`; `docs/INSTRUMENT-DEFINITION-GUIDE.md`; `docs/CUSTOM-QUESTIONNAIRE-TEST.md` | Supports the named ordered-rating subset only; unsupported content is not silently converted. |
| Result staging and recovery avoid a false durable-recording claim. | `source/src/result-sink.ts`; `integrations/qualtrics/`; `docs/QUALTRICS-INTEGRATION.md`; PR #69 and PR #70 evidence records | A page-side staging receipt is not represented as durable Qualtrics recording. |
| Review editing is transactional. | `source/src/accessible-nasa-tlx.ts`; `source/tests/component.test.ts`; `source/tests/e2e/browser-accessibility.spec.ts` | Cancel preserves committed answer/route/score/storage; Save commits the provisional answer. |

## Immutable baseline

| Evidence | Identity | Use |
| --- | --- | --- |
| Manual AT audit matrix | `docs/manual-audit/AQP-MANUAL-AT-AUDIT-v1.0.md` | Frozen pre-repair route/check evidence. |
| Baseline totals | 132 cells: 94 Pass, 31 Fail, 7 Not applicable, 0 Not tested | Report unchanged; do not substitute targeted post-fix totals as a new complete matrix. |
| Final q10 evidence boundary | `docs/FINAL-EVIDENCE-FREEZE-2026-08-18.md` | Separates exact executed product/evidence identities and claim limits. |

## Targeted repair evidence

### RF-01 — Qualtrics connection status and safe gating

- implementation/evidence head: `b173707024bf4b3b6caa7ddfa99357571d571190`;
- manual adjudication: `docs/evidence/RF01-POSTFIX-MANUAL-AUDIT-2026-08-20.md`;
- result: R1 Pass, R2 Pass, R3 Fail retained, R4 Pass;
- residual: R3-A26 initial `Connecting` status was visible but not automatically exposed by VoiceOver + Safari.

### RF-02 / A27 — truthful staging and advance-failure recovery

- PR #69: truthful pre-host submission states;
- PR #70: preserve the live iframe/recovery state after Qualtrics advance failure;
- persistent closure: `docs/FINAL-EVIDENCE-FREEZE-2026-08-18.md` and related A27 records;
- result: targeted R1–R4 A27 closure without relabelling page-side staging as durable host recording.

### RF-03 / A28 — browser-storage and result-sink refusal recovery

- merged product/evidence family: PR #73;
- records:
  - `docs/evidence/RF03-AUTOMATED-REPAIR-CANDIDATE-2026-08-20.md`;
  - `docs/evidence/RF03-POSTFIX-MANUAL-AUDIT-2026-08-20.md`;
  - `docs/evidence/RF03-POSTFIX-REGRESSION-AUDIT-2026-08-20.md`;
  - `docs/evidence/RF03-FINAL-EVIDENCE-FREEZE-2026-08-20.md`;
- result: four historical A28 failures received targeted post-fix Pass evidence.

### RF-04 — saved-session focus and direct resume

- first retained direct-resume repair: PR #72;
- final native-dialog candidate: `0444d6f8a3a77f7cb9409d79c01a75ff42d9471d`;
- final evidence head integrated here: `fcaa0a7ba471c545f2c9ad84ffc4a6e607e073b6`;
- records:
  - `docs/evidence/RF04-POSTFIX-MANUAL-AUDIT-2026-08-20.md`;
  - `docs/evidence/RF04-FINAL-EVIDENCE-FREEZE-2026-08-20.md`;
  - `docs/evidence/RF04-NATIVE-DIALOG-SUCCESSOR-PLAN-2026-08-22.md`;
  - `docs/evidence/RF04-NATIVE-DIALOG-POSTFIX-MANUAL-AUDIT-2026-08-22.md`;
- final result: R3-A14 Fail to Pass; R3-A15 Pass retained; all six historical RF-04 A14/A15 failures have targeted closure evidence;
- submitted screenshot SHA-256 values:
  - `6c647eb672d1d667dbcc4ae6c000f4e3f2035621fd742bf3368a9a081e4a22ae`;
  - `7e8998213f37832099f9a220c3da4d90fe78c224605c9f1f1652b9a64465833c`.

### RF-05 — 320 CSS-pixel reflow

- retained head: `84b39af34b5914847156d0a13a6353bee5b1b003`;
- record: `docs/evidence/RF05-AUTOMATED-REPAIR-CANDIDATE-2026-08-20.md`;
- result: R1-A22 and R4-A22 Fail to Pass on the frozen narrow-view procedure; separate normal full-screen 200% checks retained.

### RF-06 — voice listening lifecycle and recovery

- retained cumulative source incorporated through `1e0f5bcf360b3b27322c831247159fe9808cb041`;
- record: `docs/evidence/RF06-REPAIR-PLAN-2026-08-21.md`;
- retained passes include named NVDA/VoiceOver listening and no-speech recovery routes;
- residual: R4-A10 Fail retained because simultaneous Windows Voice Access and page-level Web Speech did not reliably deliver the stop command.

### RF-07 — speech proposal and negation safety

- retained head: `1e0f5bcf360b3b27322c831247159fe9808cb041`;
- records:
  - `docs/evidence/RF07-A11-A12-REPAIR-PLAN-2026-08-21.md`;
  - `docs/evidence/RF07-FINAL-EVIDENCE-FREEZE-2026-08-21.md`;
- retained implementation: strict exact parsing, cross-alternative negation veto, bounded contextual hints, visible transcript/proposal and explicit confirmation;
- residual: R3-A11, R3-A12, R4-A11 and R4-A12 remain Fail because the live recognizer did not reliably return the frozen two-word phrases;
- excluded successors: command-model and dictation-quality experiments that did not close the frozen route remain unmerged/closed evidence, not final executable behavior.

### RF-08 — smiley Voice Access targetability

- retained cumulative source incorporated through `1e0f5bcf360b3b27322c831247159fe9808cb041`;
- records:
  - `docs/evidence/RF08-A29-REPAIR-CANDIDATE-2026-08-21.md`;
  - `docs/evidence/RF08-A29-POSTFIX-MANUAL-AUDIT-2026-08-21.md`;
- result: native smiley radios retain their names/values while exposing real on-screen geometry for label and number-overlay operation; precise-scale fallback remains.

### RF-09 — support-setting feedback

- retained cumulative source incorporated through `1e0f5bcf360b3b27322c831247159fe9808cb041`;
- records:
  - `docs/evidence/RF09-A33-POSTFIX-MANUAL-AUDIT-2026-08-21.md`;
  - `docs/evidence/RF09-A33-ARIANOTIFY-MANUAL-AUDIT-2026-08-21.md`;
  - `docs/evidence/RF09-A33-FINAL-SINGLE-CHANNEL-MANUAL-OBSERVATION-2026-08-21.md`;
  - `docs/evidence/RF09-A33-FINAL-CUMULATIVE-CLOSURE-2026-08-22.md`;
- result: R3-A33 and R4-A33 Fail to Pass through cumulative manual evidence plus final-runtime focus/answer invariants.

## Final integrated candidate

| Evidence | Exact identity/result |
| --- | --- |
| Integrated product revision | `e00a737de964e120ffec38c5030d4ad212cbff5d` |
| Integration preflight | `docs/evidence/FINAL-INTEGRATION-PREFLIGHT-2026-08-22.md` |
| Canonical read-only run | `32544006644` — success on documentation head `2c183b3a2dc2333feeace48dcd4638c344c14b17` |
| Unit/component | 26/26 files; 230/230 tests |
| Rendered-browser | 12/12 tests |
| Cross-browser support | 18/18 tests across Chromium, Firefox and Playwright WebKit |
| Builds | production, standalone, synchronized release and committed-output freshness passed |
| Dependency audit | 0 reported vulnerabilities in the locked installation |
| Quantified artifact | ID `9467917456`; archive SHA-256 `e5f1df4693c76d0ee3bc651803a1ec563ea9b5d5f26417d381a7d86b4260d5d1` |
| Rendered artifact | ID `9467954426`; archive SHA-256 `b5ca8b8e5175bc06a8f511190ff89deed5847025deba5d9eabd4eb3e432881b6` |

## Final residual and claim boundary

Primary records:

- `docs/evidence/PROTOTYPE-FREEZE-AND-RESIDUAL-LIMITATIONS-PLAN-2026-08-22.md`;
- `docs/evidence/FINAL-PROTOTYPE-FREEZE-2026-08-22.md`;
- `RELEASE-NOTES.md`;
- `BUILD-INFO.json`.

Safe final statement:

> The immutable pre-repair audit contained 31 failures across 132 route/check cells. Targeted remediation and exact-route retesting closed 25 historical failures. Six configuration-specific failures remained: one VoiceOver + Safari embedded connection-status exposure cell, one simultaneous Windows Voice Access/Web Speech control cell, and four live browser speech-recognition cells. The remaining failures were retained rather than hidden, inferred or converted to passes from automated evidence.

Do not use this repository to claim a disabled-user benefit study, universal accessibility, complete WCAG conformance or psychometric equivalence.
