# RF-01 / A26 repair plan — 20 August 2026

Status: **repair family opened; source diagnosis complete; implementation not yet adjudicated**

## Identity

- Base main: `c9685f95d97cf45ab517911c91eba0cdc454e2b3` (RF-03 merged and verified).
- Branch: `agent/fix-rf01-qualtrics-connection-alert`.
- Historical q8 matrix remains immutable: **94 P / 31 F / 7 NA / 0 NT**.
- RF-01 maps to **A26** with four historical failures: R1-A26, R2-A26, R3-A26 and R4-A26.

## Frozen A26 criterion

The canonical A26 procedure checks the Qualtrics connection state and a deterministic wrong-child-origin bridge-failure fixture.

Pass only if:

1. Connecting is exposed as a status;
2. connection failure is exposed as an alert;
3. participant Start remains unavailable while the bridge is not verified;
4. no false connected claim appears.

Canonical post-fix check: rerun A26 on R1-R4 and run one normal connect -> connected -> Start smoke test. The normal/status role must be restored after recovery/normal connection.

## Historical route failures

- **R1 NVDA + Firefox:** visible connection-failure text existed and no false connected state occurred, but retained NVDA output did not usefully announce the failure.
- **R2 NVDA + Chrome:** historical frozen evidence recorded a false connected condition; exact wording was not retained. Later RF-03 regression work did not reproduce a new false-connected claim, but the historical A26 cell remains F until RF-01 post-fix adjudication.
- **R3 VoiceOver + Safari:** visible failure existed, but the retained VoiceOver record did not expose it as a useful alert.
- **R4 Windows Voice Access + Chrome / DOM inspection:** visible failure, no false connected claim and unavailable Start passed, but the failure element remained `role="status"` / polite rather than an alert.

## Current source diagnosis

`integrations/qualtrics/question-html-template.html` defines the shared collection message as:

```html
<p id="accessible-questionnaire-collection-status" role="status" aria-live="polite">
```

Current `integrations/qualtrics/qualtrics-question.js` `setStatus(message, quiet, severity)` changes text, `data-quiet`, `data-severity` and `aria-live`, but does **not** change the ARIA role.

The A26 connection-timeout branch currently calls `setStatus(..., false)` without error severity. Therefore the deterministic bridge failure remains a normal/polite status at source level even though it is a blocking connection failure.

## Minimal repair hypothesis

Keep one shared message element but make its semantics state-dependent:

- normal Connecting / informational states -> `role="status"`;
- quiet connected/waiting state -> `role="status"`, `aria-live="off"` when intentionally quiet;
- blocking failure -> `role="alert"` and assertive error semantics;
- subsequent normal/informational calls must restore `role="status"` so the element cannot remain stuck as an alert.

The A26 timeout must explicitly enter the error path. Do not make the initial Connecting state an alert.

This repair should be implemented in the shared `setStatus` path plus the A26 timeout call, rather than adding a second competing connection message.

## Required automated guards

Add a focused RF-01 bridge test that proves:

1. initial Connecting sets `role=status` and does not expose Start;
2. deterministic connection timeout switches the same element to `role=alert`, uses error semantics, exposes the truthful failure text, keeps AQP Start unavailable and does not claim connected;
3. normal verified child handshake clears the timeout path and restores/retains normal status semantics;
4. existing RF-03 staging-failure and q10 A27 error paths remain alerts and their recovery behavior is unchanged.

Run the repository's existing full verification workflow after the source change.

## Required manual post-fix adjudication

Use the same named routes:

- R1 — NVDA + Firefox;
- R2 — NVDA + Chrome;
- R3 — VoiceOver + Safari;
- R4 — Windows Voice Access + Chrome.

For each route run the fixed wrong-child-origin A26 fault and record exact visible/AT failure evidence, Start state and any false-connected text. Then run one clean normal connect -> connected -> Start smoke on the affected environments.

A26 may be reclassified only from a separate post-fix record. Never rewrite q8.

## Regression boundary

Because the repaired `setStatus` helper is shared with later Qualtrics failure states, recheck the already-frozen RF-03/A27/A28 error-state semantics in automation. Do not infer those regressions from source inspection alone.

## Claim boundary

Safe status before implementation/manual retest:

> RF-01 has a source-level diagnosis and frozen repair plan. The four historical A26 failures remain unresolved until the repair is implemented and the R1-R4 post-fix procedure is completed.
