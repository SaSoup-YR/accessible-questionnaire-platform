# RF-03 / A28 post-fix manual audit — 20 August 2026

Status: **A28 targeted manual adjudication complete: 4/4 route-cells pass; RF-03 merge gate remains open for required regressions A18/A25/A26/A27.**

## Evidence source and boundary

Primary retained human evidence: the auditor's document `第二次修f(1).docx`, containing contemporaneous notes, NVDA speech transcripts, VoiceOver/Voice Access screenshots, failure-state screenshots, Change/Cancel checks, and retry outcomes for R1–R4.

Product runtime under test was last changed in commit `b7f215f99d2df2b59008a71c79c6d202c9297f39`. The exact automated-evidence head `9fa28d2806680f9b0d1ef30b4695dbd4b5471589` passed standard workflow run `32317012935`. Later commits add rendered tests, evidence or protocol and do not alter the participant runtime.

The historical q8 matrix remains immutable at **94 P / 31 F / 7 NA / 0 NT**. This record does not overwrite q8; it records targeted post-fix F → P evidence for A28.

## Frozen A28 rule

A route-cell passes only when both adverse branches satisfy the observable recovery requirements:

- sink / Qualtrics staging refusal; and
- browser-storage failure while saving the completed record.

The failure must remain distinct from success; Review and answer correction must remain available; Retry, JSON and CSV recovery actions must remain usable; staging refusal must not jump to the thank-you/recorded state or be replaced by a generic saved-session offer; storage failure must stop before contacting the study platform and must permit normal retry once the injected fault is removed.

## Important interpretation corrections

1. **Retry during sink refusal is expected to fail again while `maximumRawChunks = 0` remains active.** Remaining on the same Review/problem state after Retry is therefore correct recovery behaviour, not a new failure. The criterion is that Retry remains available and the failure remains stable/truthful without data loss or premature success.
2. In the R1 notes the field `Saved questionnaire found masked failure` was entered as `Yes`, but the retained screenshots show the opposite: the staging failure remains visible as `There is a problem`, `Review your responses`, and `The study platform has not confirmed this response`. The adjudicated value is therefore **No masking observed**.
3. R4 direct speech targeting of some Change controls was inconsistent, but Windows Voice Access `Show numbers` successfully exposed and activated the control. A28 is not the A21 one-command visible-label test, so number-overlay activation is an admissible Voice Access route for A28 operability.

## R1 — NVDA + Firefox

### Sink / staging refusal

Observed:
- Review remained present and actionable.
- NVDA exposed the parent staging error and the participant alert. Retained transcript includes: `The questionnaire record is larger than the approved Qualtrics field allocation. The response was not staged. Keep the questionnaire open and use its Retry, Change, JSON or CSV recovery actions.`
- NVDA then exposed `There is a problem` and the participant recovery message stating that answers remain on the page and Retry/backup routes are available.
- `Retry submission` was exercised; because the injected `maximumRawChunks = 0` fault remained active, the same truthful Review/problem state was retained.
- Change was exercised on Item 2 and cancelled; the original answer remained unchanged.
- JSON and CSV backup controls remained available.
- No premature Qualtrics thank-you/recorded state was observed.
- Retained screenshots show the staging failure remained visible and was not replaced by `Saved questionnaire found`.
- No native Qualtrics Next bypass is visible in the retained failure-state screenshots.

Result: **P**.

### Browser-storage failure

Observed:
- Review remained present.
- NVDA exposed `There is a problem` and: `The browser could not save the completed record. The study platform has not been contacted. Your answers remain reviewable. Retry saving, change an answer, or download a JSON or CSV backup before leaving this page.`
- The recovery panel exposed JSON/CSV, Item Change controls and `Retry saving and submitting responses`.
- After the one-shot storage fault cleared, Retry proceeded through `Submitting response` / `Waiting for Qualtrics` and then the normal Qualtrics thank-you page.
- No answer mutation was observed during the Change/Cancel and retry sequence.

Result: **P**.

**R1-A28 post-fix result: P.**

## R2 — NVDA + Chrome

### Sink / staging refusal

Observed:
- NVDA exposed the same explicit staging-refusal message and the participant alert.
- Retry was exercised and, with the fault still active, correctly retained the Review/problem state.
- Item 2 Change/Cancel was exercised and returned to Review without changing the committed answer.
- Recovery actions remained visible; the retained screenshots show JSON/CSV and no saved-session masking or premature thank-you state.

Result: **P**.

### Browser-storage failure

Observed:
- NVDA exposed the explicit browser-storage failure and `study platform has not been contacted` statement.
- Review, per-item Change, JSON, CSV and `Retry saving and submitting responses` remained available.
- After the one-shot storage fault cleared, Retry proceeded through the normal submitting state and to the Qualtrics thank-you page.

Result: **P**.

**R2-A28 post-fix result: P.**

## R3 — VoiceOver + Safari

The auditor did not transcribe every R3 utterance into the text notes, so this route is retained with a lower documentation grade than R1/R2. The embedded screenshots nevertheless preserve the route state and VoiceOver overlay.

### Sink / staging refusal

Observed in retained screenshots/notes:
- Safari remained on the explicit staging-failure Review state.
- VoiceOver was active and exposed the error/alert context while the visible page contained the staging-refusal message, `There is a problem`, `Review your responses`, local backup state, JSON/CSV recovery, and per-item Change controls.
- Retry with the sink fault still active remained on Review, as expected.
- No premature thank-you/recorded state was shown during the fault.

Result: **P**, with documentation caveat that the complete exact VoiceOver sentence was not typed into the notes.

### Browser-storage failure

Observed in retained screenshots/notes:
- VoiceOver + Safari exposed the explicit browser-storage failure state while Review and recovery controls remained visible.
- The visible message stated that the browser could not save the completed record and that the study platform had not been contacted.
- After Retry, the route proceeded to the normal Qualtrics thank-you page.

Result: **P**, with the same exact-speech documentation caveat.

**R3-A28 post-fix result: P.**

## R4 — Windows Voice Access + Chrome

### Sink / staging refusal

Observed:
- Voice Access successfully activated `Calculate and submit responses`; the page retained the explicit staging-refusal Review state.
- The recovery panel remained visible with JSON/CSV and per-item Change controls.
- Direct recognition of the spoken Change label was inconsistent on one attempt, but `Show numbers` exposed a numbered target and the auditor successfully activated Item 2 Change through the number overlay.
- `Cancel change and return to review` was successfully activated by Voice Access.
- `Retry submission` was successfully activated by Voice Access and correctly retained the same Review/problem state while the sink fault remained active.
- No premature thank-you/recorded page was shown during staging refusal.

Result: **P**.

### Browser-storage failure

Observed:
- Voice Access successfully activated Calculate/Submit and the browser-storage failure remained on Review.
- The visible failure stated that the browser could not save the completed record and that the study platform had not been contacted.
- Voice Access successfully activated Item 2 Change, then `Cancel change and return to review`.
- Voice Access successfully activated `Retry saving and submitting responses`.
- Retry proceeded to `Submitting response` / `Waiting for Qualtrics` and then the normal Qualtrics thank-you page.

Result: **P**.

**R4-A28 post-fix result: P.**

## Targeted A28 closure

| Route | Sink refusal | Storage failure | A28 post-fix |
|---|---|---|---|
| R1 NVDA + Firefox | P | P | **P** |
| R2 NVDA + Chrome | P | P | **P** |
| R3 VoiceOver + Safari | P | P | **P** |
| R4 Voice Access + Chrome | P | P | **P** |

Targeted historical closure: **4/4 A28 failures now have post-fix manual Pass evidence.**

This changes the running targeted-closure accounting from 9 closed historical F cells to **13 closed historical F cells** (RF-02/A27 = 4, RF-04 = 5, RF-03/A28 = 4), leaving **18 historical F cells without post-fix closure evidence**. The frozen q8 baseline itself is not recalculated or rewritten.

## Remaining RF-03 gate before merge

The canonical repair plan requires regressions on **A18, A25, A26 and A27** after RF-03. Those regressions are not evidenced in this manual document and therefore remain open.

Safe status now:

> RF-03 closed all four targeted A28 historical failures in post-fix manual retesting, but the repair family is not yet merge-complete because the required A18/A25/A26/A27 regression gate remains open.

Do not merge PR #73 or call RF-03 fully frozen until that regression gate is recorded.