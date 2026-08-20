# RF-03 / A28 manual post-fix retest protocol — 20 August 2026

Status: **frozen before manual adjudication; A28 adjudication completed separately**

## Purpose

Retest only RF-03 / A28 after the repair. Do not edit the historical q8 matrix. Record a separate post-fix result for each named route.

The repair candidate is PR #73. The participant runtime was last changed in `b7f215f99d2df2b59008a71c79c6d202c9297f39`; exact automated evidence at `9fa28d2806680f9b0d1ef30b4695dbd4b5471589` passed run `32317012935`.

If participant or Qualtrics runtime code changes after this point, bind the manual retest to the new exact revision and rerun affected evidence.

## Manual preview fixture

For manual A28 testing before PR #73 is merged, an isolated GitHub Pages wrapper is available at:

`https://sasoup-yr.github.io/accessible-questionnaire-platform/rf03-a28-preview.html`

The preview wrapper was added to `gh-pages` in commit `59a784b7cdbda2922dafabf6257d9cac68aaebc1`. It does not replace the production root page. It loads the RF-03 generated participant bundle `assets/participant-CKS_Pywj.js` from PR #73 exact head `20b687182215d30a216498f627968fb00253d314`; the participant runtime itself was last changed in `b7f215f99d2df2b59008a71c79c6d202c9297f39`.

When using the existing approved Qualtrics fixture, preserve the existing encoded `#study=...` configuration and participant parameter. Replace only the base URL before `#study=` with the preview URL above. This preserves the real Qualtrics `parentOrigin` encoded in the existing study configuration while testing the RF-03 participant runtime on the required `https://sasoup-yr.github.io` origin.

The preview is a bounded manual-test fixture, not evidence that PR #73 has been merged or deployed to the production root.

## Frozen routes

- R1 — NVDA + Firefox on Windows.
- R2 — NVDA + Chrome on Windows.
- R3 — VoiceOver + Safari on macOS.
- R4 — Windows Voice Access + Chrome.

Record exact OS, browser and AT versions/settings actually used. Do not infer missing versions.

## Fixed questionnaire state

Use the System Usability Scale (SUS) and the same fixed response vector used elsewhere in the release evidence:

`5, 1, 4, 2, 3, 5, 1, 4, 2, 3`

Reach **Review your responses** before injecting either adverse branch.

## A28 branch 1 — sink / Qualtrics staging refusal

Inject the frozen `sink-refusal` / staging-refusal condition before final submission.

Pass only if all of the following are observed on the named route:

1. the participant remains in an actionable Review/recovery state;
2. a distinct failure is visibly exposed and available to the named AT route;
3. the failure is not described as recorded/successful;
4. `Retry submission` is available;
5. per-item Change controls remain available;
6. `Download JSON backup` is available;
7. `Download CSV backup` is available;
8. the participant is not moved to the Qualtrics thank-you/recorded page before recovery is used;
9. the failure is not replaced by a generic `Saved questionnaire found` card;
10. native Qualtrics Next is not exposed as a bypass while staging itself remains unresolved.

Record exact screen-reader speech or exact Voice Access command/observed target where applicable.

## A28 branch 2 — browser-storage failure

Inject the frozen `browser-storage-failure` condition when the completed record is being saved.

Pass only if all of the following are observed on the named route:

1. Review remains available; the participant is not taken to completion;
2. the error clearly states that the browser could not save the completed record;
3. the study platform has not been contacted for that failed attempt;
4. the failure is available to the named AT route and the error receives the expected focus/attention behavior;
5. `Retry saving and submitting responses` is available;
6. per-item Change controls remain available;
7. `Download JSON backup` is available;
8. `Download CSV backup` is available;
9. the in-progress recovery copy remains recoverable;
10. the failure is not replaced by a generic saved-session card or success state.

After recording the failure state, remove the injected storage fault and use Retry. Record whether the normal completion path resumes without answer mutation.

## Adjudication rule

A route-cell A28 is P only if **both adverse branches** satisfy the frozen observable requirements on that route. If either branch fails, the A28 route-cell remains F.

Do not average the two branches and do not give partial credit within a route-cell.

## Required regressions after A28

The canonical repair plan requires regression checks for:

- A18;
- A25;
- A26; and
- A27.

In particular, RF-03 must not damage the already frozen A27 q10 behavior: a response that staged successfully but later fails during Qualtrics advance must still expose truthful failure/recovery and the existing retry route.

## Evidence to retain per route

For each R1–R4 route, record:

- exact revision tested;
- environment versions;
- branch tested (`sink-refusal` or `browser-storage-failure`);
- visible failure text;
- exact AT speech or exact voice command where applicable;
- focused/targeted element;
- Retry present/usable;
- Change present/usable;
- JSON present/usable;
- CSV present/usable;
- whether thank-you/recorded page appeared prematurely;
- whether `Saved questionnaire found` masked the failure;
- final P/F with a short reason.

## Evidence boundary

Before manual testing, the historical q8 A28 status remains:

- R1-A28 = F
- R2-A28 = F
- R3-A28 = F
- R4-A28 = F

Only a post-fix manual record may change these targeted statuses. Even if all four later pass, the original q8 matrix remains unchanged and must be reported as historical baseline plus separate post-fix closure evidence.

## Post-A28 regression environment incident

During the later A26/A27 regression work, the R3 Mac environment became unstable: with VoiceOver enabled, the auditor reported pointer/mouse interaction conflict that persisted after restarting the Mac. This happened after the retained R3 A18/A25 evidence had already been collected.

Do not replace R3 with Safari-without-VoiceOver. Any R3 A26/A27 regression observation made while this AT environment is unstable must be recorded as environment-limited/pending rather than silently adjudicated. See `docs/evidence/RF03-POSTFIX-REGRESSION-AUDIT-2026-08-20.md`.
