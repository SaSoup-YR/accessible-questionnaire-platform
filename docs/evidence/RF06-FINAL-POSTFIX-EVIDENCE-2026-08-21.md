# RF-06 speech-listening lifecycle repair evidence — 21 August 2026

Status: **closed. R2-A10, R3-A10 and R3-A13 passed post-fix manual testing; R4-A10 remains F after the final Voice Access candidate failed.**

## Identity

- Base main: `c9685f95d97cf45ab517911c91eba0cdc454e2b3`.
- Branch: `agent/fix-rf06-speech-listening-lifecycle`.
- Proven R3-A13 production-announcer runtime: `050fff9a811198d5c6348cb56e1feb50c889b898`.
- Canonically verified R3-A13 evidence head: `656c112e85c4be449ee9b94becc8c7e2508460ec`.
- R3-A13 canonical run: `32478383479` — **success**.
- Failed R4 Escape-candidate runtime: `f6917d08527e0c8276db90ea46995c73da4fd74a`.
- Failed R4 preview path: `/rf06-r4-escape-preview/`.
- Final retained source removes the failed Escape candidate and keeps only the mechanisms supported by successful manual evidence.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Frozen defect boundary

RF-06 targets only the application-level speech-listening lifecycle failures recorded at **R2-A10, R3-A10, R4-A10 and R3-A13**:

- R2-A10: Listening feedback/cancellation was not sufficiently prompt and recoverable;
- R3-A10: Safari/VoiceOver could remain in Listening for minutes with no dedicated cancel action;
- R4-A10: the direct built-in-recognition route exposed Listening but no reliably voice-operable cancel action while Windows Voice Access was also listening;
- R3-A13: no-speech did not terminate into a specific recoverable message.

This family does **not** claim to repair upstream recognition accuracy or to make two concurrent speech recognisers interoperable. Fixed-phrase recognition reliability remains a separate RF-07 evidence family.

## Retained implementation

The final RF-06 source:

- keeps the visible disabled `Listening…` state;
- exposes a separate **Stop voice input** button while recognition is active;
- leaves ordinary visible answer controls usable during Listening;
- adds an AQP-owned 15-second watchdog so an indefinitely active recogniser cannot leave the interface permanently Listening;
- states that no answer changed after manual Stop or no-speech termination;
- separates the AQP Listening mutation from Safari's own microphone-capture announcement;
- uses a stable body-level production announcer for no-speech errors;
- removes both the unsuccessful transcript-interception experiment and the unsuccessful Voice Access Escape candidate.

## Closed post-fix observations

### R2-A10 — NVDA + Chrome — **P**

The manual run announced `Listening for one answer.`, exposed an operable Stop button, returned to Start after stopping and stated that no answer was changed.

### R3-A10 — VoiceOver + Safari — **P**

The Safari preview produced an actual VoiceOver announcement of `Listening for one answer.` while the AQP panel visibly remained in Listening and exposed **Stop voice input**. Manual Stop then produced `Voice input stopped. No answer was changed. Try again, or use a visible answer button.` Safari's separate microphone-capture announcement did not suppress those later AQP status messages.

### R3-A13 — VoiceOver + Safari — **P**

Two component-local approaches failed first: a polite status region and then a pre-existing component-local `role=alert` both left VoiceOver announcing only Safari's `Current tab stopped capturing sound` message.

The final production-announcer implementation followed the stronger shared pattern used by Adobe React Aria and Angular CDK: a stable visually hidden body-level announcer, separate polite/assertive channels, and a fresh child appended for each message. In the exact silent-attempt retest, VoiceOver automatically announced:

> No speech was detected before the listening time limit. Voice input stopped. Try again, or use a visible answer button. No answer was changed.

The visible panel showed the same recovery and Start returned. This closes the historical R3-A13 failure on the tested Safari/VoiceOver configuration.

## R4-A10 — Windows Voice Access + Chrome — **F retained**

### Direct visible-button candidate

The first manual route reproduced a concurrent-recogniser race. While AQP Web Speech recognition was listening, the same spoken `Click Stop voice input` or overlay command intended for Windows Voice Access was also available to the in-page recogniser. A best-effort transcript-interception experiment did not provide reliable control and was removed.

### Final Escape candidate

A final materially different candidate added an Escape-key cancellation route, exposed `aria-keyshortcuts="Escape"`, detached recognition callbacks before cancellation and used `SpeechRecognition.abort()` when available. Automated tests proved the local keyboard mechanism and answer-state invariants, but automated evidence could not prove that Windows Voice Access would deliver the key while both recognisers were active.

The focused manual retest on 21 August 2026 failed:

1. Windows Voice Access displayed the recognised command `press escape` and the outcome `Pressed escape`.
2. In one retained screenshot, AQP nevertheless remained visibly in `Listening…` with **Stop voice input** still present.
3. In the next retained screenshot, AQP had consumed part of the spoken operating-system command and displayed: `No answer was selected. I heard “Press”. Try a short command such as “number four”, or use a visible answer button.`
4. The page recogniser therefore competed with Voice Access for the same utterance; the Escape route was not shown to be a reliable Voice Access cancellation mechanism.

Evidence: user-supplied screenshots `屏幕截图 2026-08-21 133441.png` and `屏幕截图 2026-08-21 133450.png`, captured on the immutable `/rf06-r4-escape-preview/` runtime.

### Final adjudication

**R4-A10 remains F.** The bounded finding is simultaneous Windows Voice Access plus in-page Web Speech recognition on the tested Chrome route. It is not a general failure of Voice Access with ordinary AQP controls.

Primary-source review found no standard browser API that can suspend Windows Voice Access or arbitrate between the operating-system recogniser and the page recogniser. Microsoft's own guidance describes switching between speech-access solutions rather than keeping both listening. No further transcript, timing, key-command or operating-system-control workaround will be added to RF-06.

## Automated evidence boundary

The failed Escape runtime passed its automated mechanism checks, including the local Escape key event, but the contradictory real-AT result takes precedence. The final retained source removes that unproven mechanism. A fresh generated-release synchronization and canonical read-only run are required before PR closure.

Automated evidence establishes code behaviour under the simulated browser boundary. It cannot override a real Windows Voice Access interoperability failure.

## Next repair family

The next family in the frozen repair order is **RF-09 / A33 support-setting feedback**, targeting historical R3-A33 and R4-A33. It is developed in a separate branch/PR and must provide one timely, accurate setting-change message without focus movement or questionnaire-answer change.

## Audit boundary

Historical q8 is never rewritten. Post-fix evidence closes R2-A10, R3-A10 and R3-A13 separately and retains R4-A10 as F. The post-fix evidence trail reports the failed candidates rather than replacing them with an all-green reconstruction.
