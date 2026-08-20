# RF-01 / A26 automated repair candidate — 20 August 2026

Status: **implementation candidate ready for automated verification; manual A26 adjudication still required**

## Identity

- Base main: `c9685f95d97cf45ab517911c91eba0cdc454e2b3`.
- Branch: `agent/fix-rf01-qualtrics-connection-alert`.
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

## Evidence boundary

This implementation and automation do **not** reclassify A26. R1-A26, R2-A26, R3-A26 and R4-A26 remain historical F until the same wrong-child-origin post-fix route is manually rerun with NVDA+Firefox, NVDA+Chrome, VoiceOver+Safari and Windows Voice Access+Chrome, followed by the required clean connect -> connected -> Start smoke.
