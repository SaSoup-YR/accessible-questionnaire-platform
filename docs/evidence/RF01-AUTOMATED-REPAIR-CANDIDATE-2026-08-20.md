# RF-01 / A26 automated repair candidate — 20 August 2026

Status: **implementation and repository-wide automated verification complete; manual A26 adjudication still required**

## Identity

- Base main: `c9685f95d97cf45ab517911c91eba0cdc454e2b3`.
- Branch: `agent/fix-rf01-qualtrics-connection-alert`.
- Verified runtime head before this evidence-only documentation update: `7356aa2b2ec74f7db7080523128a6e5f3ea3356f`.
- Final canonical verification run for that runtime head: `32394900756` — **success**.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.
- RF-01 contains four historical A26 failures: R1, R2, R3 and R4.

## Retained implementation

`integrations/qualtrics/qualtrics-question.js` now uses state-dependent semantics on the single collection-status element:

- normal informational states: `role="status"`;
- quiet connected/waiting states: `role="status"` with `aria-live="off"` when intentionally quiet;
- blocking errors: `role="alert"`, `data-severity="error"`, `aria-live="assertive"`;
- later informational calls restore `role="status"` rather than leaving the shared element stuck as an alert.

The A26 8-second missing-connection timeout explicitly enters the error path. Other blocking package/connection setup failures also enter the same error path. Initial Connecting remains informational.

Implementation commit: `dc54eeab892ded977140e7710746dc4ba6b3eedd`.

## Automated guard

New test: `source/tests/rf01-qualtrics-connection-alert.test.ts`.

It checks:

1. Connecting is `role=status`, polite/informational, with participant iframe still hidden;
2. a deterministic missing bridge timeout becomes `role=alert`, assertive/error, with no connected claim and participant iframe still unrevealed;
3. a verified child handshake leaves/restores `role=status`, quiet connected semantics and reveals the participant iframe.

Existing RF-03/A27/A28 tests remain part of the repository-wide verification gate.

## Final automated verification

Canonical workflow run `32394900756` completed successfully on runtime head `7356aa2b2ec74f7db7080523128a6e5f3ea3356f` after the canonical verification workflow had been restored. It recorded:

- 22 test files / 213 automated tests passed, including both focused RF-01 tests;
- 12/12 rendered-browser regression tests passed;
- 9/9 Chromium/Firefox/WebKit support tests passed;
- production, standalone and release builds passed;
- the generated-release freshness gate passed, proving the committed deployment files matched the source-generated outputs.

This is automated technical evidence only. It does not replace the frozen A26 assistive-technology observations.

## Evidence boundary

This implementation and automation do **not** reclassify A26. R1-A26, R2-A26, R3-A26 and R4-A26 remain historical F until the same wrong-child-origin post-fix route is manually rerun with NVDA+Firefox, NVDA+Chrome, VoiceOver+Safari and Windows Voice Access+Chrome, followed by the required clean connect -> connected -> Start smoke.
