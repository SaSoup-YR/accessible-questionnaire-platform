# RF-06 speech-listening lifecycle repair evidence — 21 August 2026

Status: **R2-A10 and R3-A10 closed by post-fix manual evidence; R4-A10 retained as an interoperability failure; the previous R3-A13 candidate failed and one final standards-aligned alert candidate awaits a focused Safari/VoiceOver retest**

## Identity

- Base main: `c9685f95d97cf45ab517911c91eba0cdc454e2b3`.
- Branch: `agent/fix-rf06-speech-listening-lifecycle`.
- Final A13 alert-candidate runtime: `434729b55b8746e684129dab81a00518dbb42532`.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Frozen defect boundary

RF-06 targets only the application-level speech-listening lifecycle failures recorded at **R2-A10, R3-A10, R4-A10 and R3-A13**:

- R2-A10: Listening feedback/cancellation was not sufficiently prompt and recoverable;
- R3-A10: Safari/VoiceOver could remain in Listening for minutes with no dedicated cancel action;
- R4-A10: the direct built-in-recognition route exposed Listening but no usable cancel action;
- R3-A13: no-speech did not terminate into a specific recoverable message.

This family does **not** attempt to prove or repair upstream speech-recognition accuracy. Fixed-phrase recognition reliability remains a separate RF-07 evidence family.

## Retained lifecycle implementation

The RF-06 lifecycle module:

- keeps the visible disabled `Listening…` state;
- exposes a separate **Stop voice input** control while recognition is active;
- leaves ordinary visible answer controls usable during Listening;
- adds an AQP-owned 15-second watchdog so an indefinitely active recogniser cannot leave the interface permanently Listening;
- states that no answer changed after manual Stop or no-speech termination;
- separates the AQP Listening mutation from Safari's own microphone-capture announcement;
- removes the unproven Voice Access transcript-interception experiment.

## Post-fix manual evidence

### R2-A10 — NVDA + Chrome — **P**

The manual run announced `Listening for one answer.`, exposed an operable Stop control, returned to Start after stopping and stated that no answer was changed.

### R3-A10 — VoiceOver + Safari — **P**

The second-round Safari preview produced an actual VoiceOver announcement of `Listening for one answer.` while the AQP panel visibly remained in Listening and exposed **Stop voice input**. Manual Stop then produced `Voice input stopped. No answer was changed. Try again, or use a visible answer button.` Safari's separate microphone-capture announcement did not suppress those later AQP status messages.

### R4-A10 — Windows Voice Access + Chrome — **F retained**

The manual route reproduced a concurrent-recogniser race. While AQP Web Speech recognition was listening, the same spoken control command intended for Windows Voice Access was also consumed by the in-page recogniser. The visible Stop control therefore could not be shown to be reliably voice-operable through Voice Access while AQP recognition remained active.

This is bounded to **simultaneous Windows Voice Access + in-page Web Speech recognition** on the tested route. It is not a general failure of Voice Access with ordinary questionnaire controls. Microsoft documents that Voice Access in Listening mode listens to spoken input and describes switching between speech-access solutions without having both listen at once. The Web Speech API controls only the page's recogniser and provides no standard API for suspending Windows Voice Access. No further recogniser-side command-parsing workaround is credited.

### R3-A13 — VoiceOver + Safari — **previous candidate F**

During the silent attempt, VoiceOver announced Safari's `Current tab stopped capturing sound` and then ended. It did **not** announce the AQP recovery beginning `No speech was detected...`. The visible message and automated DOM assertions do not substitute for an actual AT announcement, so that candidate fails frozen A13.

## Final bounded A13 alert candidate

The final candidate does not add another timing delay. Instead it keeps ordinary Listening and manual Stop in the existing polite `role=status` region and routes **only no-speech/time-limit recovery errors** to a second, pre-existing empty `role=alert` region. Both live-region containers exist before the recovery text is inserted.

This follows W3C technique ARIA19, which identifies `role=alert` or an error live region as a sufficient technique for notifying assistive technologies when an error is injected, while preserving `role=status` for ordinary non-error application state. The candidate therefore does not promote Listening or successful/manual status information to alert urgency.

Focused automated tests verify that:

- Listening and manual Stop remain in the status region;
- the alert container is present and initially empty;
- watchdog, native end and native `no-speech` recovery populate the alert region;
- no answer is changed and the visible Start route returns.

The source/release synchronization and preview publication job passed. A fresh canonical read-only workflow run is required on the documentation head, followed by one focused R3 silent-attempt retest.

If VoiceOver still announces only Safari's capture-stop message and not the AQP no-speech alert, **R3-A13 remains F and RF-06 stops here**. No further timing or urgency experiments will be pursued.

## Audit boundary

Historical q8 is never rewritten. Post-fix evidence closes R2-A10 and R3-A10 separately, retains R4-A10 as a tested interoperability limitation and may close R3-A13 only if the final alert candidate is actually announced by VoiceOver in Safari.
