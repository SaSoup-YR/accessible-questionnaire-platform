# RF-06 speech-listening lifecycle repair evidence — 21 August 2026

Status: **R2-A10 and R3-A10 closed by post-fix manual evidence; R4-A10 retained as an interoperability failure; two component-local R3-A13 candidates failed; final production-announcer candidate verified automatically and awaiting one focused Safari/VoiceOver retest**

## Identity

- Base main: `c9685f95d97cf45ab517911c91eba0cdc454e2b3`.
- Branch: `agent/fix-rf06-speech-listening-lifecycle`.
- Production-announcer runtime and immutable preview source: `050fff9a811198d5c6348cb56e1feb50c889b898`.
- Canonically verified evidence-only head: `656c112e85c4be449ee9b94becc8c7e2508460ec`.
- Later commits after that head are documentation only and do not alter the tested runtime.
- Final canonical read-only run: `32478383479` — **success**.
- Immutable preview path: `/rf06-announcer-preview/`.
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

The Safari preview produced an actual VoiceOver announcement of `Listening for one answer.` while the AQP panel visibly remained in Listening and exposed **Stop voice input**. Manual Stop then produced `Voice input stopped. No answer was changed. Try again, or use a visible answer button.` Safari's separate microphone-capture announcement did not suppress those later AQP status messages.

### R4-A10 — Windows Voice Access + Chrome — **F retained**

The manual route reproduced a concurrent-recogniser race. While AQP Web Speech recognition was listening, the same spoken control command intended for Windows Voice Access was also consumed by the in-page recogniser. The visible Stop control therefore could not be shown to be reliably voice-operable through Voice Access while AQP recognition remained active.

This is bounded to **simultaneous Windows Voice Access + in-page Web Speech recognition** on the tested route. It is not a general failure of Voice Access with ordinary questionnaire controls. Microsoft's Voice Access guidance describes switching between speech-access solutions without having both listen at once. The Web Speech API controls only the page's recogniser and provides no standard API for suspending Windows Voice Access. No further recogniser-side command-parsing workaround is credited.

## R3-A13 candidate history

### Component-local polite status — **F**

During the silent attempt, VoiceOver announced Safari's `Current tab stopped capturing sound` and then ended. It did not announce the AQP recovery beginning `No speech was detected...`.

### Component-local pre-existing `role=alert` — **F**

The next candidate routed only no-speech recovery to a pre-existing empty alert node inside the voice component. The exact silent-attempt retest again produced Safari's capture-stop message but no AQP recovery announcement. Visible text and automated DOM assertions cannot override this real-AT result.

## Final production-announcer candidate

The component-local alert was standards-aligned but was not the strongest implementation pattern available in mature open-source accessibility libraries. A source review therefore compared the failed approach with:

- W3C Technique ARIA19, which requires the live/error container to exist before the error is injected;
- Adobe React Aria's `LiveAnnouncer`, which creates stable body-level polite and assertive logs and appends a fresh child for each announcement;
- Angular CDK's `LiveAnnouncer`, which centralises announcements in a persistent visually hidden body-level element and separates clearing from later message insertion.

The final candidate adopts the shared production pattern rather than adding another arbitrary delay:

- `source/src/accessibility-announcer.ts` creates one visually hidden body-level announcer before speech recognition starts;
- separate polite and assertive `role=log` channels use `aria-live` plus `aria-relevant=additions`;
- each no-speech recovery is a newly appended child, retained for seven seconds, rather than a text replacement in a rerendered component subtree;
- the recovery remains visibly present in the voice panel;
- ordinary Listening and manual Stop continue through the existing polite component status and are not promoted to assertive urgency;
- focus is not moved and no questionnaire answer changes.

Focused tests establish the DOM mechanism, message routing, one-child-per-error behaviour, seven-second cleanup, returned Start route and answer invariance.

## Final automated verification

Canonical run `32478383479` completed successfully on evidence head `656c112e85c4be449ee9b94becc8c7e2508460ec`, with the product runtime unchanged from `050fff9a811198d5c6348cb56e1feb50c889b898`. It recorded:

- npm audit: **0 vulnerabilities**;
- **22/22** Vitest files and **215/215** tests passed, including RF-06 **4/4**;
- production TypeScript/Vite build passed;
- rendered-browser accessibility regression: **12/12 passed**;
- cross-browser support matrix: **9/9 passed** across Chromium, Firefox and WebKit;
- production, standalone and release builds passed;
- generated-release freshness passed.

## Final manual gate

One focused Safari/VoiceOver silent-attempt retest is required. If VoiceOver still announces only Safari's capture-stop message and not the appended AQP error, **R3-A13 remains F and RF-06 stops here**. No further timing, urgency, focus or duplicated-speech experiments will be pursued.

## Next repair family

Once this final R3-A13 observation is adjudicated, the next code family in the frozen repair order is **RF-09 / A33 support-setting feedback**, targeting historical R3-A33 and R4-A33. Its implementation must centralise accurate feedback for text-size, interruption-recovery and audio-guidance state changes, preserve focus, and prove scored-answer invariance. It will be researched and developed in a separate branch/PR after RF-06 is closed; RF-06 and RF-09 will not be mixed.

## Audit boundary

Historical q8 is never rewritten. Post-fix evidence closes R2-A10 and R3-A10 separately, retains R4-A10 as a tested interoperability limitation and may close R3-A13 only if the production-announcer message is actually announced by VoiceOver in Safari.
