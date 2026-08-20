# RF-03 post-fix regression audit — 20 August 2026

Status: **partial manual regression closure recorded; R3 VoiceOver environment fault blocks final merge adjudication**

## Scope

This record covers the canonical RF-03 post-repair regressions A18, A25, A26 and A27 after the A28 repair. It does not rewrite the historical q8 matrix.

Product/release repair commit remains `b7f215f99d2df2b59008a71c79c6d202c9297f39`. PR: #73.

## A18 — submit reviewed local result

Frozen purpose: completion/storage wording must remain truthful; a failed/unconfirmed save must not look like success.

Manual evidence reviewed from the auditor's retained screenshots/AT logs:

- R1 NVDA + Firefox: **P regression**. `Result prepared` was announced; visible completion state says `Saved on this device`, states that the completed record is stored only in the browser and has not been sent to GitHub or to a server, and exposes JSON/CSV backups.
- R2 NVDA + Chrome: **P regression**. Same truthful local-completion state and recovery controls retained.
- R3 VoiceOver + Safari: **P regression for A18**. This run was completed before the later VoiceOver/mouse environment malfunction. Retained screenshot shows VoiceOver announcing `Result prepared`; visible state says `Saved on this device`, local-browser-only storage, no server claim, and JSON/CSV backups.
- R4 Windows Voice Access + Chrome: **P regression**. Voice Access successfully activated `Calculate and submit responses`; the same truthful local-completion state and backup controls were retained.

Result: **A18 4/4 regression checks passed.**

## A25 — reopen same local participant link after completion

Frozen purpose: a recovered local backup must be distinguished from confirmed Qualtrics collection, with JSON and CSV recovery available.

- R1: **P regression**. Reload showed `A completed backup was found on this device`; text explicitly says the local copy does not prove Qualtrics recorded the response; repeat-warning text and recovered JSON/CSV controls were visible.
- R2: **P regression**. Same completed-backup distinction and recovered JSON/CSV controls retained.
- R3: **P regression for A25**. This run was completed before the later VoiceOver/mouse environment malfunction. Retained screenshot shows the completed-backup warning, explicit `does not prove that Qualtrics recorded the response` wording, repeat warning, and recovered JSON/CSV controls.
- R4: **P regression**. Same completed-backup distinction and recovery controls retained after Voice Access reload.

Result: **A25 4/4 regression checks passed.**

## A26 — Qualtrics connecting state and frozen bridge-failure route

Historical q8 status: **F on R1-R4; repair family RF-01, not RF-03.** This regression is therefore not an attempt to reclassify A26 to P. It checks whether RF-03 introduced a new regression into the already-failing connection path.

Fault used: wrong `childOrigin`, preserving the canonical A26 fault type.

Observed retained behavior:

- R1 NVDA + Firefox: connecting state appeared visually; after the fixed timeout the page showed `The questionnaire connection did not start. Do not collect a real response. Regenerate and replace the complete HTML and JavaScript, then test again.` Start remained unavailable because the participant frame never connected. No false `connected` state was shown. The historical alert-role deficiency is not claimed repaired.
- R2 NVDA + Chrome: NVDA exposed the same connection-failure text. Start did not become available and there was no false connected claim. Historical A26 remains F.
- R4 Windows Voice Access + Chrome: same connection-failure state was retained. A native Qualtrics `Next page` remained separately available and Voice Access could activate it; this does not convert A26 to P because the frozen A26 criterion concerns the connection failure/Start semantics. Historical A26 remains F.
- R3 VoiceOver + Safari: **manual regression observation not valid for adjudication** because VoiceOver began interfering with normal pointer use during this part of testing. The auditor reports restart did not fix the environment. Retained screenshot confirms VoiceOver was on, but the AT environment was no longer stable enough to treat the route as a controlled A26 regression observation.

A26 conclusion for RF-03: **R1/R2/R4 show no new RF-03 regression; historical A26 remains F. R3 is environment-limited/pending and no new A26 claim is made.**

## A27 — staged response followed by forced Qualtrics advance failure

Frozen purpose: before Qualtrics confirmation, no recorded-success claim; watchdog failure must expose actionable recovery, preserve completed result/backups, avoid resetting the participant to intro, and restore usable native Qualtrics Next.

Fault: only the `question.clickNextButton();` line inside `continueStagedResponse()` was disabled; staging/receipt and watchdog remained active.

Observed retained evidence:

- R1 NVDA + Firefox: **failure-state regression passed.** NVDA announced submission to Qualtrics, then `Qualtrics could not confirm this response...`, followed by the participant-side `Qualtrics did not confirm this response` heading/alert. Completed result and JSON/CSV recovery remained visible. No premature recorded-success wording is present in the retained log.
- R2 NVDA + Chrome: **failure-state regression passed.** Same truthful failure announcement and retained recovery state/backup controls. No premature recorded-success wording is present in the retained log.
- R3 VoiceOver + Safari: visible waiting state and visible post-watchdog failure/recovery state were captured, but **the named VoiceOver route cannot be validly adjudicated** because the VoiceOver/mouse environment malfunction was present. Do not classify R3-A27 regression P or F from visual evidence alone.
- R4 Windows Voice Access + Chrome: waiting and post-watchdog failure/recovery states were captured and Voice Access successfully activated `Calculate and submit responses`. The retained evidence file does not contain a documented post-failure `Click Next page` command/End-of-Survey observation for this RF-03 regression run, so final R4-A27 manual regression closure is **pending documentation/confirmation of actual Next usability** rather than inferred from visibility.

A27 conclusion: **R1/R2 failure-state behavior preserved; R3 pending due AT environment malfunction; R4 final native-Next operability evidence pending.**

## VoiceOver environment incident

The Mac route was originally frozen as macOS 15.4.1 + Safari 18.4 + built-in VoiceOver. During the RF-03 regression session, the auditor reported that enabling VoiceOver caused pointer/mouse use to conflict and that restarting the Mac did not resolve it. This incident occurred after the R3 A18/A25 regression evidence had already been captured, but affected the later A26/A27 work.

Do not silently substitute Safari without VoiceOver: that would no longer be the frozen R3 route. Do not retroactively change earlier R3 outcomes solely because of the later environment incident. The incident should be retained as a test-environment threat until configuration is checked or the route is rerun.

## Current RF-03 merge gate

RF-03 remains **Draft / unmerged**. Current manual regression status:

- A18: 4/4 P regression.
- A25: 4/4 P regression.
- A26: R1/R2/R4 known historical F retained with no new RF-03 regression observed; R3 environment-limited/pending.
- A27: R1/R2 failure-state regression preserved; R3 environment-limited/pending; R4 native-Next actual-use evidence pending.

Do not mark RF-03 merge-complete until the remaining R3 environment issue is resolved or explicitly bounded, and R4 A27 Next operability is confirmed from retained/manual evidence.
