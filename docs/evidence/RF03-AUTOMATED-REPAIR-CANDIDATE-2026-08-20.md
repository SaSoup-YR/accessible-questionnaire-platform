# RF-03 automated repair candidate — 20 August 2026

Status: **implementation + automated regression candidate complete; manual A28 adjudication still required**

## Historical evidence boundary

The frozen q8 manual audit remains immutable at **94 P / 31 F / 7 NA / 0 NT** across 132 route-cells. RF-03 maps to A28 and contained four historical failures: R1-A28, R2-A28, R3-A28 and R4-A28.

This document does not reclassify those four cells. A28 can change only after the same frozen manual procedure is rerun on R1–R4.

## Source identity

- Base main after RF-04 closure: `8af24abff80ef53cfa996f4328cb05e7afeb7731`.
- RF-03 product/release repair commit: `b7f215f99d2df2b59008a71c79c6d202c9297f39`.
- Exact automated-evidence head (adds rendered A28 regression only): `9fa28d2806680f9b0d1ef30b4695dbd4b5471589`.
- Pull request: #73, `agent/fix-rf03-stable-failure-recovery`.

The test-only commit after `b7f215f...` does not alter the generated participant runtime.

## Frozen A28 requirement

Both adverse branches must preserve an actionable failure state:

1. sink / Qualtrics staging refusal; and
2. browser-storage failure while saving the completed record.

For either branch, answers must remain reviewable; Retry, Change, JSON and CSV recovery routes must remain available; failure must remain distinct from success; the participant must not be sent to a thank-you page before recovery can be used; and the failure must not be hidden behind a generic saved-session offer.

## Retained repair

### Participant runner

When completed-record browser storage fails:

- the participant remains on Review;
- the study platform is not contacted;
- the error summary states that the completed record could not be stored and that the study platform has not been contacted;
- the error summary receives programmatic focus through the existing error path;
- the in-progress recovery copy is retained;
- the recovery section exposes `Retry saving and submitting responses`, per-item Change controls, `Download JSON backup` and `Download CSV backup`;
- retry can proceed normally after storage becomes writable again.

When the configured result sink rejects:

- the participant remains on Review;
- the saved answers and completed local backup remain available;
- the recovery section exposes `Retry submission`, per-item Change controls, JSON and CSV backup controls;
- retry can proceed after the sink becomes available.

### Qualtrics parent bridge

When record staging itself fails before `AQP_ACCEPTED=1`:

- the failure status is explicit and marked as an error;
- the live participant iframe is preserved instead of being reparented/recreated;
- the rejected staging receipt is sent to the participant runner;
- native Qualtrics Next is **not** exposed as a bypass of the unresolved staging failure;
- the participant remains able to use the live AQP Retry / Change / JSON / CSV recovery actions.

The existing A27 q10 post-staging advance-failure path is separate and remains unchanged: after a response has staged successfully but Qualtrics cannot advance, that path may restore native Next for retry.

## Regression tests

Existing unit/component tests were changed from the old A28-violating expectations into inverse safety gates. They now assert, among other things, that:

- invalid/partial Qualtrics staging does not expose native Next;
- a rejected staging receipt and error status remain visible;
- host failure retains Review, Retry submission, Change and both backup actions;
- browser-storage failure keeps Review, focuses the error, does not contact the sink, preserves the in-progress recovery copy, exposes Retry/Change/JSON/CSV, and succeeds after storage is restored and Retry is used.

A new rendered Chromium file, `source/tests/e2e/rf03-failure-recovery.spec.ts`, runs both A28 adverse branches through the production SUS configuration. It verifies stable Review recovery, focused error summary, absence of a completion page and saved-session mask, Retry/Change/JSON/CSV controls, and successful retry after the injected fault is removed.

## Exact-head automated verification

Standard repository workflow run **`32317012935`** completed **success** at exact head `9fa28d2806680f9b0d1ef30b4695dbd4b5471589`.

The successful workflow includes:

- locked dependency installation;
- automated unit/component tests;
- quantified technical report;
- production build;
- real-browser accessibility regression, including both new RF-03 rendered adverse-branch tests;
- Chromium / Firefox / WebKit capability matrix;
- rendered evidence publication;
- production / standalone / release build; and
- confirmation that committed deployment files are current.

Retained workflow artifacts:

- quantified technical evaluation: `9388436847`;
- rendered accessibility evidence: `9388494114`.

## Manual evidence still required

Automation does **not** change any A28 route-cell from F to P. Before RF-03 can be closed, the frozen A28 procedure must be rerun for both adverse branches on:

- R1 NVDA + Firefox;
- R2 NVDA + Chrome;
- R3 VoiceOver + Safari; and
- R4 Windows Voice Access + Chrome.

Affected regressions required by the canonical repair plan: A18, A25, A26 and A27.

## Claim boundary

Safe status before manual retest:

> RF-03 has an implementation and automated-regression candidate that preserves an actionable Review recovery state under injected sink and browser-storage failures. The four historical A28 failures remain unresolved until post-fix manual R1–R4 adjudication is completed.

Do not describe RF-03 as closed, do not recalculate the global q8 totals, and do not infer improved accessibility or disabled-user benefit from the automated evidence.
