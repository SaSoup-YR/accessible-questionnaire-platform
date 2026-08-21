# RF-06 speech-listening lifecycle repair evidence — 21 August 2026

Status: **second-round manual evidence collected; R2-A10 and R3-A10 pass; R4-A10 retained as an interoperability failure; R3-A13 requires the exact timeout/no-speech announcement to be confirmed before closure**

## Identity

- Base main: `c9685f95d97cf45ab517911c91eba0cdc454e2b3`.
- Branch: `agent/fix-rf06-speech-listening-lifecycle`.
- Retained synchronized runtime: `e8ccd11909b2d3e6f6600d95bdc88a6e04374eb3`.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Frozen defect boundary

RF-06 targets only the application-level speech-listening lifecycle failures recorded at **R2-A10, R3-A10, R4-A10 and R3-A13**:

- R2-A10: Listening feedback/cancellation was not sufficiently prompt and recoverable;
- R3-A10: Safari/VoiceOver could remain in Listening for minutes with no dedicated cancel action;
- R4-A10: the direct built-in-recognition route exposed Listening but no usable cancel action;
- R3-A13: no-speech did not terminate into a specific recoverable message.

This family does **not** attempt to prove or repair upstream speech-recognition accuracy. Fixed-phrase recognition reliability remains a separate RF-07 evidence family.

## Retained implementation direction

The RF-06 lifecycle module keeps a pre-existing `role=status`, `aria-live=polite`, `aria-atomic=true` status region; keeps the visible `Listening…` state; exposes a separate **Stop voice input** control; leaves visible questionnaire answer controls usable; and adds an AQP-owned 15-second watchdog so an indefinitely active recogniser cannot leave the UI permanently Listening.

A second-round Safari/VoiceOver adjustment separates the AQP live-region mutations from Safari's own microphone-capture announcements. This change is supported by the post-fix Safari observation below.

A recogniser-side best-effort interpretation of the spoken phrase `stop voice input` was explored for Windows Voice Access. The manual R4 route showed that it did **not** solve the underlying concurrent-recogniser race. That experimental transcript workaround and its dedicated test were therefore removed from the retained runtime rather than being used to manufacture a Pass.

## Automated evidence

The focused RF-06 automated tests cover:

- delayed Listening status mutation;
- explicit Stop and no-answer-change behaviour;
- AQP watchdog termination;
- native no-speech recovery;
- safe lifecycle cleanup.

The retained-runtime synchronization job passed repository tests and release generation after removing the unproven Voice Access transcript workaround. A fresh canonical read-only verification run is required on the evidence head after this document update. Automated evidence does not override the manual AT result.

## Post-fix manual evidence

### R2-A10 — NVDA + Chrome — **P**

The first post-fix manual run exposed and announced `Listening for one answer.`, provided an operable Stop control, returned to Start after stopping, and stated that no answer was changed. This closes the historical R2-A10 failure on the tested configuration.

### R3-A10 — VoiceOver + Safari — **P**

The second-round Safari preview produced an actual VoiceOver announcement of **`Listening for one answer.`** while the AQP panel visibly remained in Listening and exposed **Stop voice input**. A subsequent stop produced an actual VoiceOver announcement of **`Voice input stopped. No answer was changed. Try again, or use a visible answer button.`** The browser's separate `Current tab started capturing sound` announcement was also observed, but it did not suppress the later AQP status announcement in this candidate.

This closes the historical R3-A10 failure on the tested Safari/VoiceOver configuration: Listening is exposed, an explicit stop path exists, the attempt terminates, and stopping does not silently change an answer.

### R3-A13 — VoiceOver + Safari — **PENDING exact-message confirmation**

The supplied screenshots prove the AQP Listening announcement and the manual-stop recovery announcement. They do **not**, by themselves, show the distinct watchdog/native no-speech message beginning `No speech was detected...` required by frozen A13. Do not infer A13 Pass from the manual-stop screenshot. A13 closes only if the already-performed silent attempt actually produced the specific no-speech/time-limit announcement with a safe next action and no answer change.

### R4-A10 — Windows Voice Access + Chrome — **F retained**

The second-round manual run reproduced the concurrency problem: while AQP Web Speech recognition is listening, the same spoken control command intended for Windows Voice Access is also available to the in-page recogniser. The two speech systems therefore race over the same utterance, and `Stop voice input` cannot be shown to be reliably voice-operable through Voice Access while AQP recognition remains active.

This is not treated as a general failure of Windows Voice Access or of the visible questionnaire controls. Voice Access can still operate ordinary visible questionnaire controls when the in-page recogniser is not concurrently consuming the utterance. The failure is bounded to **simultaneous Windows Voice Access + in-page Web Speech recognition** on the tested route.

Microsoft's own Voice Access guidance states that Voice Access in Listening mode listens to spoken input and that, when another speech-access technology is also present, the supported interaction model uses distinct wake words to switch between solutions **without having both listening at the same time**. The Web Speech API exposes control of the page's own recogniser (`start`, `stop`, `abort`) but no standard web API for suspending Windows Voice Access. Therefore no further recogniser-side command-parsing hack is credited as an RF-06 repair.

## Audit boundary

Historical q8 is never rewritten. Post-fix evidence closes R2-A10 and R3-A10 separately, may close R3-A13 only after its exact no-speech announcement is confirmed, and retains R4-A10 as a tested interoperability limitation.
