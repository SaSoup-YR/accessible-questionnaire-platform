# RF-03 post-fix regression audit — 20 August 2026

Status: **A18/A25 regression closed; A26 known RF-01 failure retained without observed new RF-03 regression; A27 native-Next regression remains open**

## Scope

This record covers the canonical RF-03 post-repair regressions A18, A25, A26 and A27 after the A28 repair. It does not rewrite the historical q8 matrix.

Product/release repair commit remains `b7f215f99d2df2b59008a71c79c6d202c9297f39`. PR: #73.

## A18 — submit reviewed local result

Frozen purpose: completion/storage wording must remain truthful; a failed/unconfirmed save must not look like success.

Manual evidence reviewed from the auditor's retained screenshots/AT logs:

- R1 NVDA + Firefox: **P regression**. `Result prepared` was announced; visible completion state says `Saved on this device`, states that the completed record is stored only in the browser and has not been sent to GitHub or to a server, and exposes JSON/CSV backups.
- R2 NVDA + Chrome: **P regression**. Same truthful local-completion state and recovery controls retained.
- R3 VoiceOver + Safari: **P regression**. Retained VoiceOver evidence exposes `Result prepared`; visible state says `Saved on this device`, local-browser-only storage, no server claim, and JSON/CSV backups.
- R4 Windows Voice Access + Chrome: **P regression**. Voice Access successfully activated `Calculate and submit responses`; the same truthful local-completion state and backup controls were retained.

Result: **A18 4/4 regression checks passed.**

## A25 — reopen same local participant link after completion

Frozen purpose: a recovered local backup must be distinguished from confirmed Qualtrics collection, with JSON and CSV recovery available.

- R1: **P regression**. Reload showed `A completed backup was found on this device`; text explicitly says the local copy does not prove Qualtrics recorded the response; repeat-warning text and recovered JSON/CSV controls were visible.
- R2: **P regression**. Same completed-backup distinction and recovered JSON/CSV controls retained.
- R3: **P regression**. Retained screenshot shows the completed-backup warning, explicit `does not prove that Qualtrics recorded the response` wording, repeat warning, and recovered JSON/CSV controls.
- R4: **P regression**. Same completed-backup distinction and recovery controls retained after Voice Access reload.

Result: **A25 4/4 regression checks passed.**

## A26 — Qualtrics connecting state and frozen bridge-failure route

Historical q8 status: **F on R1-R4; repair family RF-01, not RF-03.** This regression is therefore not an attempt to reclassify A26 to P. It checks whether RF-03 introduced a new regression into the already-failing connection path.

Fault used: wrong `childOrigin`, preserving the canonical A26 fault type.

Observed retained behavior:

- R1 NVDA + Firefox: connecting state appeared; after the fixed timeout the page showed `The questionnaire connection did not start. Do not collect a real response. Regenerate and replace the complete HTML and JavaScript, then test again.` The participant frame did not connect and no false `connected` state was shown. The historical alert-role deficiency is not claimed repaired.
- R2 NVDA + Chrome: NVDA exposed the same connection-failure text. No false connected claim appeared. Historical A26 remains F.
- R3 VoiceOver + Safari: a supplemental rerun retained VoiceOver output during the Connecting/failure sequence. The connection failure remained visible and did not become a false connected state. The earlier pointer/VoiceOver instability is retained as an environment threat, but the supplemental evidence is sufficient to show that RF-03 did not introduce a new connection-state regression. Historical A26 remains F; no RF-01 closure is claimed.
- R4 Windows Voice Access + Chrome: same connection-failure state was retained. A native Qualtrics `Next page` was separately exposed; Voice Access `Click next page` was retained as `Left clicked Next page`, followed by the Qualtrics End-of-Survey page (`Your response has been recorded`). This does not convert A26 to P because the frozen A26 criterion concerns connection-failure/Start semantics. Historical A26 remains F.

A26 conclusion for RF-03: **no new RF-03 regression observed on R1-R4; historical A26 remains F on all four routes and is still owned by RF-01.**

## A27 — staged response followed by forced Qualtrics advance failure

Frozen purpose: before Qualtrics confirmation, no recorded-success claim; watchdog failure must expose actionable recovery, preserve completed result/backups, avoid resetting the participant to intro, and restore a usable native Qualtrics Next.

Fault: only the `question.clickNextButton();` line inside `continueStagedResponse()` was disabled; staging/receipt and watchdog remained active.

Observed retained evidence:

- R1 NVDA + Firefox: **failure-state regression passed.** NVDA announced submission to Qualtrics, then `Qualtrics could not confirm this response...`, followed by the participant-side `Qualtrics did not confirm this response` heading/alert. Completed result and JSON/CSV recovery remained visible. No premature recorded-success wording is present in the retained log. A post-failure native-Next activation/End-of-Survey observation is not separately retained in this RF-03 run, so that operability sub-check remains unclosed.
- R2 NVDA + Chrome: **failure-state regression passed.** Same truthful failure announcement and retained recovery state/backup controls. No premature recorded-success wording is present in the retained log. A post-failure native-Next activation/End-of-Survey observation is not separately retained in this RF-03 run, so that operability sub-check remains unclosed.
- R3 VoiceOver + Safari: supplemental screenshots retain VoiceOver output during the A27 sequence: the waiting state is visible, the watchdog failure is visible, and VoiceOver exposes the failure text (`Qualtrics could not confirm this response...`). This resolves the earlier uncertainty about whether the failure state itself was available to the named AT route. However no separate retained observation proves that the restored native Qualtrics Next was present and actually usable after this failure, so the final A27 operability sub-check remains open.
- R4 Windows Voice Access + Chrome: waiting and post-watchdog failure/recovery states were retained and Voice Access successfully activated `Calculate and submit responses`. In the supplemental manual record the auditor explicitly reports that, after A27 failure and scrolling through the recovery page, **no native `Next page` control was found**. The retained screenshot shows the completed recovery card/JSON/CSV state without a visible native Next in the inspected lower state. Therefore the current R4 A27 regression does **not** satisfy the frozen native-Next operability criterion.

A27 conclusion: **truthful failure/recovery behavior is preserved on the observed routes, but the native-Next part of the frozen q10 criterion is not closed. R4 is an observed regression failure for that sub-check; R1/R2/R3 lack retained actual-use evidence.**

## VoiceOver environment incident

The Mac route was originally frozen as macOS 15.4.1 + Safari 18.4 + built-in VoiceOver. During the first RF-03 regression attempt, enabling VoiceOver interfered with normal pointer use and restarting the Mac did not initially resolve it. Supplemental screenshots later retained VoiceOver output during A26 and A27, so the environment incident no longer blocks interpretation of the R3 failure-state observations. It remains a validity/threat note because pointer interaction was unstable during part of the session.

Do not substitute Safari without VoiceOver for the named R3 route, and do not retroactively rewrite earlier R3 evidence solely because of this later environment incident.

## Code/evidence mismatch requiring investigation

The retained PR source still calls `question.showNextButton()` in `recoverFailedAdvance()`, and the q10 unit/layout regression also asserts that this API call occurs. The R4 manual A27 observation nevertheless found no usable native Next. Therefore the discrepancy is **not yet attributed** to RF-03 source, Qualtrics runtime/layout, or the manual fixture. Do not merge or add another timing workaround until the actual rendered/native navigation state is diagnosed.

## Current RF-03 merge gate

RF-03 remains **Draft / unmerged**.

- A18: 4/4 P regression.
- A25: 4/4 P regression.
- A26: R1-R4 historical RF-01 failures retained; no new RF-03 regression observed.
- A27: failure/recovery semantics retained, but native-Next operability is not closed; R4 currently fails the observable Next criterion and R1/R2/R3 do not have retained actual-use proof in this regression run.

Do **not** mark RF-03 merge-complete until the A27 native-Next discrepancy is diagnosed and the affected manual regression is rerun on the exact repaired revision.
