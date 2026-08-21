# RF-06 speech-listening lifecycle repair evidence — 21 August 2026

Status: **R2-A10, R3-A10 and R3-A13 closed by post-fix manual evidence; R4-A10 has one final standards- and platform-supported Escape-cancellation candidate awaiting manual Voice Access retest**

## Identity

- Base main: `c9685f95d97cf45ab517911c91eba0cdc454e2b3`.
- Branch: `agent/fix-rf06-speech-listening-lifecycle`.
- Proven R3-A13 production-announcer runtime: `050fff9a811198d5c6348cb56e1feb50c889b898`.
- Canonically verified R3-A13 evidence head: `656c112e85c4be449ee9b94becc8c7e2508460ec`.
- R3-A13 canonical run: `32478383479` — **success**.
- Synchronized R4 Escape-candidate runtime and immutable preview source: `f6917d08527e0c8276db90ea46995c73da4fd74a`.
- Immutable R4 preview path: `/rf06-r4-escape-preview/`.
- A fresh canonical read-only run is required on this documentation-only successor before manual testing is credited.
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
- uses a stable body-level production announcer for no-speech errors;
- removes the unproven Voice Access transcript-interception experiment.

## Closed post-fix observations

### R2-A10 — NVDA + Chrome — **P**

The manual run announced `Listening for one answer.`, exposed an operable Stop control, returned to Start after stopping and stated that no answer was changed.

### R3-A10 — VoiceOver + Safari — **P**

The Safari preview produced an actual VoiceOver announcement of `Listening for one answer.` while the AQP panel visibly remained in Listening and exposed **Stop voice input**. Manual Stop then produced `Voice input stopped. No answer was changed. Try again, or use a visible answer button.` Safari's separate microphone-capture announcement did not suppress those later AQP status messages.

### R3-A13 — VoiceOver + Safari — **P**

Two component-local approaches failed first: a polite status region and then a pre-existing component-local `role=alert` both left VoiceOver announcing only Safari's `Current tab stopped capturing sound` message.

The final production-announcer implementation followed the stronger shared pattern used by Adobe React Aria and Angular CDK: a stable visually hidden body-level announcer, separate polite/assertive channels, and a fresh child appended for each message. In the exact silent-attempt retest, VoiceOver automatically announced:

> No speech was detected before the listening time limit. Voice input stopped. Try again, or use a visible answer button. No answer was changed.

The visible panel showed the same recovery, Start returned, and no questionnaire answer changed. This closes the historical R3-A13 failure on the tested Safari/VoiceOver configuration.

## R4-A10 research and candidate history

### Direct visible-button command — **F in the tested candidate**

The manual Voice Access route reproduced a concurrent-recogniser race. While AQP Web Speech recognition was listening, the same spoken `Click Stop voice input` or overlay command intended for Windows Voice Access was also available to the in-page recogniser. A best-effort recogniser-side transcript interception was tested and removed after it failed to provide reliable control.

### External evidence review

The final R4 review used primary platform/API sources and open-source code search:

- Microsoft states that Voice Access in Listening mode listens to everything said and executes recognised commands.
- Microsoft's Voice Access FAQ describes switching between voice-access solutions with distinct wake words **without having both listening at the same time**.
- Microsoft documents the general `Press <key>` Voice Access command, including Escape-key operation.
- The Web Speech API exposes control only over the page's recogniser. `SpeechRecognition.abort()` cancels listening without attempting to return a recognition result; there is no standard web API that suspends Windows Voice Access.
- W3C keyboard-trap guidance supports providing an explicit keyboard mechanism to escape an active interaction state.
- GitHub/open-source searches found many application-level Stop/Escape patterns but no mature web implementation or browser API that coordinates Windows Voice Access and in-page Web Speech Recognition as two simultaneous recognisers.

The direct-button failure is therefore not repaired by another transcript-parsing heuristic. The only materially different, platform-supported route still worth testing is a keyboard cancellation command that Voice Access itself can issue.

## Final bounded R4 Escape candidate

The candidate adds a normal keyboard escape route rather than attempting to control the operating-system recogniser:

- while AQP is Listening, **Escape** cancels the page recogniser;
- the visible Stop button exposes `aria-keyshortcuts="Escape"`;
- the interface visibly states `Press Escape to stop without choosing or changing an answer.`;
- cancellation uses `SpeechRecognition.abort()` when available, with `stop()` only as compatibility fallback;
- result/error/end handlers are detached before cancellation, so the spoken Voice Access command cannot be committed as a questionnaire answer through this route;
- the existing answer remains unchanged, Start returns, and the ordinary status says that voice input stopped and no answer changed;
- the Escape listener exists only while the exact recogniser is active and is removed on every release path.

Focused automated tests cover manual Stop, Escape cancellation, `aria-keyshortcuts`, abort semantics, retained prior answer, returned Start, no-speech watchdog and page-level error announcement.

The manual R4 retest must use Windows Voice Access + Chrome and say **`Press Escape`** after AQP enters Listening. If the command reliably ends Listening, returns Start and preserves the answer, R4-A10 may close on that tested configuration. If Voice Access and Web Speech still race so that the Escape key is not delivered reliably, **R4-A10 remains F and RF-06 stops here**. No further transcript, timing or operating-system-control workaround will be credited.

## Automated evidence boundary

The prior R3-A13 runtime passed 22/22 Vitest files, 215/215 tests, 12/12 rendered-browser tests, 9/9 cross-browser support tests, build/release and generated freshness. The Escape candidate source/tests and generated release have been synchronized; a fresh canonical run must pass before the preview is treated as the final automated candidate.

Automated evidence establishes the implemented mechanism and invariants. It cannot override a contradictory real Voice Access result.

## Next repair family

Once the final R4-A10 observation is adjudicated, the next code family in the frozen repair order is **RF-09 / A33 support-setting feedback**, targeting historical R3-A33 and R4-A33. It will be researched and developed in a separate branch/PR; RF-06 and RF-09 will not be mixed.

## Audit boundary

Historical q8 is never rewritten. Post-fix evidence closes R2-A10, R3-A10 and R3-A13 separately. R4-A10 closes only if the final Escape route is actually operable through Windows Voice Access on the named Chrome configuration.
