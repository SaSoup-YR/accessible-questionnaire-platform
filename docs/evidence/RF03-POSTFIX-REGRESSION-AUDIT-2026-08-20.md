# RF-03 post-fix regression audit — 20 August 2026

Status: **manual regression gate closed for RF-03; A18/A25 preserved, A26 known RF-01 failure retained without new RF-03 regression, A27 q10 recovery preserved**

## Scope

This record covers the canonical RF-03 post-repair regressions A18, A25, A26 and A27 after the A28 repair. It does not rewrite the historical q8 matrix.

Product/release repair commit: `b7f215f99d2df2b59008a71c79c6d202c9297f39`. Pull request: #73.

## A18 — submit reviewed local result

Frozen purpose: completion/storage wording must remain truthful; a failed or unconfirmed save must not look like success.

- R1 NVDA + Firefox: **P regression**. `Result prepared` was announced; the completion state said `Saved on this device`, distinguished browser-local storage from server collection, and retained JSON/CSV backups.
- R2 NVDA + Chrome: **P regression**. Same truthful local-completion state and backup controls retained.
- R3 VoiceOver + Safari: **P regression**. VoiceOver evidence exposed `Result prepared`; visible state retained truthful browser-local storage wording and JSON/CSV backups.
- R4 Windows Voice Access + Chrome: **P regression**. Voice Access activated `Calculate and submit responses`; the same truthful local-completion state and backup controls were retained.

Result: **A18 4/4 P regression.**

## A25 — reopen same local participant link after completion

Frozen purpose: a recovered local backup must be distinguished from confirmed Qualtrics collection, with JSON and CSV recovery available.

- R1: **P regression**. Reload exposed `A completed backup was found on this device`; wording explicitly stated that the local copy does not prove Qualtrics recorded the response; repeat-warning text and recovered JSON/CSV controls were present.
- R2: **P regression**. Same distinction and recovery controls retained.
- R3: **P regression**. Same completed-backup warning, explicit non-confirmation wording and recovered JSON/CSV controls retained.
- R4: **P regression**. Same distinction and recovery controls retained after Voice Access reload.

Result: **A25 4/4 P regression.**

## A26 — Qualtrics connecting state and frozen bridge-failure route

Historical q8 status: **F on R1-R4; repair family RF-01, not RF-03.** This regression does not reclassify A26. It checks whether RF-03 introduced a new regression into the already-failing connection path.

Fault used: wrong `childOrigin`, preserving the canonical A26 fault type.

Observed behavior:

- R1 NVDA + Firefox: connection failure remained explicit; the participant frame did not falsely report connected.
- R2 NVDA + Chrome: NVDA exposed `The questionnaire connection did not start...`; no false connected claim appeared.
- R3 VoiceOver + Safari: supplemental VoiceOver evidence exposed the connecting/failure sequence; no false connected state appeared. The earlier pointer/VoiceOver instability remains a validity note but does not prevent this bounded regression conclusion.
- R4 Windows Voice Access + Chrome: the same connection-failure state was retained.

The auditor then confirmed on **all four A26 routes** that the native Qualtrics `Next page` was available after the connection-failure state and could be activated to reach the Qualtrics End-of-Survey page (`Your response has been recorded`). This confirms no new RF-03 navigation regression on A26. It does **not** convert A26 to P because the historical A26 failures concern the separate connection/status/alert semantics owned by RF-01.

A26 conclusion for RF-03: **no new RF-03 regression observed on R1-R4; historical A26 remains F on all four routes and is still owned by RF-01.**

## A27 — staged response followed by forced Qualtrics advance failure

Frozen purpose: before Qualtrics confirmation, no recorded-success claim; watchdog failure must expose actionable recovery, preserve completed result/backups, avoid resetting the participant to intro, and restore a usable native Qualtrics Next.

Fault: only the `question.clickNextButton();` line inside `continueStagedResponse()` was disabled; validation, staging, receipt and the 6000 ms watchdog remained active.

Retained observations across the named routes:

- Submission entered the truthful waiting state (`Waiting for Qualtrics`).
- No premature `recorded` success claim was observed before host confirmation.
- The watchdog exposed `Qualtrics could not confirm this response...` and the participant-side `Qualtrics did not confirm this response` recovery state.
- Completed result/recovery content and JSON/CSV backups remained available; the participant did not reset to `Before you begin`.
- Screen-reader routes exposed the failure text; R4 retained Voice Access operation of the relevant controls.

### Native Next placement adjudication

An earlier manual observation incorrectly treated the native `Next page` as absent because the auditor searched below the preserved AQP recovery content. Follow-up inspection established that the control was restored at the **top of the outer Qualtrics page**, above the AQP block. This placement follows the q10 preservation strategy: the live AQP iframe remains mounted while the outer Qualtrics layout/navigation is restored.

The auditor then completed the actual-use check on the named browser/AT routes used for A27 (Firefox/NVDA, Chrome/NVDA and Voice Access, and Safari/VoiceOver): the restored top-level `Next page` was found and activated, and the flow continued to the Qualtrics End-of-Survey page showing `Your response has been recorded`.

Therefore the earlier `no Next found` observation is adjudicated as a **discoverability/location error during manual inspection, not a missing-control regression**.

A27 conclusion: **P regression on R1-R4 under the frozen q10 criterion.** Truthful waiting/failure semantics, recovery state, backups and usable native Qualtrics Next were retained.

## VoiceOver environment incident

The R3 route was frozen as macOS 15.4.1 + Safari 18.4 + built-in VoiceOver. During part of the RF-03 regression session, VoiceOver interfered with normal pointer use. Supplemental VoiceOver screenshots and the completed A27 route later provided usable AT evidence. The incident remains a test-environment threat note and does not justify substituting Safari without VoiceOver or rewriting earlier R3 results.

## RF-03 regression conclusion

- **A18:** 4/4 P regression.
- **A25:** 4/4 P regression.
- **A26:** no new RF-03 regression on R1-R4; historical RF-01 A26 failures remain unchanged.
- **A27:** 4/4 P regression; earlier native-Next discrepancy resolved as top-of-page placement/discoverability rather than absence.

The RF-03 manual regression gate is therefore **closed**. Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.
