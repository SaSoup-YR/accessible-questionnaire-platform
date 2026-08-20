# RF-01 / A26 automated repair candidate — 20 August 2026

Status: **automated repair verified; post-fix manual audit recorded; R3 VoiceOver/Safari remains Fail; clean-connect smoke pending**

## Identity

- Base main: `c9685f95d97cf45ab517911c91eba0cdc454e2b3`.
- Branch: `agent/fix-rf01-qualtrics-connection-alert`.
- Retained runtime under manual test: `64a936ea50b70413bd9a6d780c28d5f376ff7d13`.
- Canonical verification run for that runtime: `32403350892` — **success**.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Retained implementation

`integrations/qualtrics/qualtrics-question.js` uses state-dependent semantics on the single collection-status element:

- normal informational states: `role="status"`;
- initial Connecting live region is primed before the message is inserted on a later task;
- quiet connected/waiting states: `role="status"` with `aria-live="off"` when intentionally quiet;
- blocking errors: `role="alert"`, `data-severity="error"`, `aria-live="assertive"`;
- later informational calls restore `role="status"` rather than leaving the shared element stuck as an alert.

The A26 8-second missing-connection timeout explicitly enters the error path. Other blocking package/connection setup failures also enter the same error path.

## Automated guard

`source/tests/rf01-qualtrics-connection-alert.test.ts` checks the primed Connecting status, blocking error transition, no false connected claim, hidden participant iframe before verification, and normal connected-state restoration.

Existing RF-03/A27/A28 tests remain part of the repository-wide verification gate.

## Automated verification

Canonical workflow run `32403350892` completed successfully on exact runtime head `64a936ea50b70413bd9a6d780c28d5f376ff7d13`:

- 22 test files / 213 automated tests passed, including RF-01 2/2;
- 12/12 rendered-browser regression tests passed;
- 9/9 Chromium/Firefox/WebKit support tests passed;
- production, standalone and release builds passed;
- generated-release freshness passed;
- npm audit reported 0 vulnerabilities.

This is automated technical evidence only. It does not replace the frozen A26 assistive-technology observations.

## Post-fix manual result

See `docs/evidence/RF01-POSTFIX-MANUAL-AUDIT-2026-08-20.md`.

Forced wrong-origin route:

- R1 NVDA + Firefox: Connecting and later blocking alert were automatically announced; no participant AQP Start and no false connected claim — forced-failure path passes.
- R2 NVDA + Chrome: Connecting and later blocking alert were automatically announced; no participant AQP Start and no false connected claim — forced-failure path passes.
- R3 VoiceOver + Safari: visible Connecting was **not** automatically announced (`[no announcement]`), although the later failure alert was announced and gating remained safe — **A26 remains Fail on R3**.
- R4 Windows Voice Access + Chrome: voice-control target/gating behavior passes; Voice Access is not treated as evidence of screen-reader live-region speech.

Two non-retained R3 diagnostics (1000 ms delay and a Safari urgency shim) also failed to produce an automatic Connecting announcement. No further timing/urgency tuning is retained because it did not establish a working route and would risk changing correct semantics merely to force speech.

## Remaining gate

Restore the normal child origin and run one short clean smoke on R1–R4:

`connected visible -> participant AQP Start available -> Start opens item 1`

No questionnaire completion/submission is required for this smoke. R3-A26 remains F even if that smoke passes. Historical q8 is never rewritten.
