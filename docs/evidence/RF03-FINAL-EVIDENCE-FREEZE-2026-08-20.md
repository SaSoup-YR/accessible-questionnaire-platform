# RF-03 final evidence freeze — 20 August 2026

Status: **RF-03 implementation and targeted evaluation complete; 4/4 historical A28 failures have post-fix Pass evidence; required regressions closed**

## Identity and scope

- Repair family: **RF-03 — A28 stable failure recovery**.
- Historical q8 A28 cells: R1-A28 F, R2-A28 F, R3-A28 F, R4-A28 F.
- Historical q8 matrix remains immutable at **94 P / 31 F / 7 NA / 0 NT**.
- Base main after RF-04 closure: `8af24abff80ef53cfa996f4328cb05e7afeb7731`.
- RF-03 product/release repair commit: `b7f215f99d2df2b59008a71c79c6d202c9297f39`.
- Exact automated-evidence runtime head: `9fa28d2806680f9b0d1ef30b4695dbd4b5471589`.
- Standard automated run: `32317012935` — success.
- Pull request: #73, `agent/fix-rf03-stable-failure-recovery`.

Later commits on the branch add tests/protocol/evidence records; they do not change the participant runtime introduced by the RF-03 product repair.

## Retained repair

### Browser-storage failure

If the completed-record local backup cannot be written:

- remain on Review;
- do not contact the configured study platform for that failed attempt;
- expose a focused truthful error stating that the browser could not save the completed record and that the study platform has not been contacted;
- retain the in-progress recovery copy;
- retain Retry, per-item Change, JSON and CSV recovery actions;
- allow normal completion after the injected fault is removed and Retry is used.

### Sink / Qualtrics staging refusal

If record staging fails before acceptance:

- expose an explicit error and rejected staging receipt;
- preserve the live participant iframe/review state;
- retain Retry, Change, JSON and CSV recovery actions;
- do not expose native Qualtrics Next as a bypass while staging itself remains unresolved;
- keep this path separate from A27, where staging has succeeded but native advance later fails.

## Automated evidence

Run `32317012935` passed at exact automated-evidence head `9fa28d2806680f9b0d1ef30b4695dbd4b5471589` and included:

- unit/component regression tests;
- production build;
- rendered Chromium A28 sink-refusal and browser-storage-failure tests;
- rendered accessibility regression;
- Chromium / Firefox / WebKit capability matrix;
- release build; and
- generated-file synchronization.

Retained artifacts:

- quantified technical evaluation: `9388436847`;
- rendered accessibility evidence: `9388494114`.

Automation is supporting evidence only and did not itself reclassify A28 route-cells.

## Manual A28 adjudication

The frozen two-branch A28 procedure was rerun on:

- R1 — NVDA + Firefox;
- R2 — NVDA + Chrome;
- R3 — VoiceOver + Safari;
- R4 — Windows Voice Access + Chrome.

For each route, both sink/staging refusal and browser-storage failure retained an actionable Review/recovery state, truthful failure wording, Retry, Change, JSON and CSV recovery, and avoided premature success/thank-you or saved-session masking. Storage-failure Retry completed normally after the one-shot injected fault cleared.

Targeted result:

- R1-A28: **P**
- R2-A28: **P**
- R3-A28: **P**
- R4-A28: **P**

**RF-03 targeted closure = 4/4 historical A28 failures.**

Manual record: `docs/evidence/RF03-POSTFIX-MANUAL-AUDIT-2026-08-20.md`.

## Required regression gate

Canonical affected regressions were A18, A25, A26 and A27.

### A18

**4/4 P regression.** Local completion/storage wording remained truthful and recoverable.

### A25

**4/4 P regression.** Reopening a completed local participant link continued to distinguish a local backup from confirmed Qualtrics collection and retained recovered JSON/CSV actions.

### A26

A26 remains the historical **RF-01** failure family and is not reclassified here. R1-R4 showed no new RF-03 regression in the connection-failure path. The auditor additionally confirmed that native Qualtrics `Next page` remained operable after the A26 failure state and could reach the End-of-Survey page on all named routes.

### A27

**4/4 P regression under the frozen q10 rule.** Waiting/failure semantics remained truthful; completed recovery and backups were retained; no reset to the intro occurred; and native Qualtrics Next remained available and usable.

An apparent `no Next found` discrepancy was resolved during manual adjudication. The restored native `Next page` was located at the **top of the outer Qualtrics page**, above the preserved AQP recovery block, rather than below the AQP content. The auditor completed actual-use checks on Firefox/NVDA, Chrome/NVDA and Voice Access, and Safari/VoiceOver, continuing through the restored `Next page` to the Qualtrics End-of-Survey recorded page. The earlier observation was therefore a location/discoverability error, not absence of the control.

Regression record: `docs/evidence/RF03-POSTFIX-REGRESSION-AUDIT-2026-08-20.md`.

## VoiceOver environment note

During part of the R3 session, VoiceOver interfered with pointer use on the frozen macOS/Safari environment. Supplemental VoiceOver evidence and completed route checks were later obtained. Keep this as a validity/test-environment note; do not substitute Safari without VoiceOver and do not retroactively rewrite earlier R3 evidence solely because of the incident.

## Claim boundary

Safe conclusion:

> The q8 baseline contained four RF-03/A28 failures. After a targeted failure-recovery revision, all four A28 route-cells passed separate post-fix retesting under the frozen two-branch procedure. Required A18/A25/A27 regressions were preserved; A26 remained a separate pre-existing RF-01 failure family with no new RF-03 regression observed. The original q8 matrix remains unchanged as historical evidence.

Do not infer improved accessibility, usability, comprehension, disabled-user benefit, complete WCAG conformance or psychometric equivalence from this repair evidence.

## Next repair family

After RF-03 closure, the next planned family is **RF-01 / A26**, containing four remaining historical failures (R1-A26, R2-A26, R3-A26, R4-A26).
