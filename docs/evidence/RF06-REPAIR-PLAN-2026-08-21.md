# RF-06 speech-listening lifecycle repair evidence — 21 August 2026

Status: **implementation and generated release synchronized; final canonical verification rerun pending; manual A10/A13 adjudication required**

## Identity

- Base main: `c9685f95d97cf45ab517911c91eba0cdc454e2b3`.
- Branch: `agent/fix-rf06-speech-listening-lifecycle`.
- Synchronized runtime head before this evidence-only commit: `27a596d8a35dec20046e6018ba7a7883c176539a`.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Frozen defect boundary

RF-06 targets only the application-level speech-listening lifecycle failures recorded at **R2-A10, R3-A10, R4-A10 and R3-A13**:

- R2-A10: Listening feedback/cancellation was not sufficiently prompt and recoverable;
- R3-A10: Safari/VoiceOver could remain in Listening for minutes with no dedicated cancel action;
- R4-A10: the direct built-in-recognition route exposed Listening but no usable cancel action;
- R3-A13: no-speech did not terminate into a specific recoverable message.

This family does **not** attempt to prove or repair upstream speech-recognition accuracy. Fixed-phrase recognition reliability remains a separate RF-07 evidence family.

## Retained implementation

A small lifecycle policy module, `source/src/rf06-speech-lifecycle.ts`, is loaded after the existing participant component and wraps only its established speech lifecycle. This follows the repository's existing post-definition policy-module pattern and avoids altering scoring, questionnaire definitions or answer parsing.

The retained candidate:

- keeps one pre-existing `role=status`, `aria-live=polite`, `aria-atomic=true` status container in the rendered voice panel;
- preserves the existing disabled `Listening…` start-control state for compatibility;
- exposes a separate **Stop voice input** control whenever recognition is active;
- leaves the standard visible answer buttons enabled during Listening;
- adds an AQP-owned **15 second** watchdog so a recogniser that never fires a result/error/end event cannot leave the UI indefinitely Listening;
- manual Stop explicitly states that voice input stopped and no answer changed, then restores focus to Start;
- native no-speech end gives a specific safe next action and explicitly states that no answer changed;
- watchdog timeout gives a specific time-limit/no-speech message, stops recognition and explicitly states that no answer changed;
- clears the watchdog whenever the established recognition release path runs, so result, error, navigation, visible-answer selection, manual stop and teardown cannot leave a stale timer.

## Focused automated regression

`source/tests/rf06-speech-lifecycle.test.ts` uses a fake recogniser that can remain indefinitely active. Three focused tests verify:

1. the primed live status becomes `Listening for one answer`, the disabled `Listening…` state is present, **Stop voice input** is enabled, visible rating controls remain enabled and no answer is selected merely by starting recognition;
2. manual Stop calls recognition stop, restores the start route, states that no answer changed and leaves the questionnaire unanswered;
3. a recogniser that never ends is stopped by the 15-second watchdog with a specific no-speech/time-limit recovery message, while a native `onend` path gives a specific no-speech next action and cancels the watchdog.

## Verification history

Canonical run `32468441663` established that the focused RF-06 tests and repository unit tests were sound: **22/22 test files and 214/214 tests passed**, including RF-06 **3/3**; TypeScript/production build passed; cross-browser support **9/9** passed. Its rendered-browser gate failed only because the first RF-06 presentation changed the historical disabled start-button label from `Listening…` to `Start voice input`, while the existing rendered regression correctly expected `Listening…`.

The implementation was therefore narrowed to preserve the existing disabled `Listening…` UI contract and add the separate Stop control. Follow-up canonical run `32468717320` then passed the repository unit tests, production build, rendered-browser regression and cross-browser support matrix. It failed only at the final generated-release freshness gate because the new participant module changed compiled deployment assets.

Generated release output was then rebuilt by CI and synchronized at runtime head `27a596d8a35dec20046e6018ba7a7883c176539a`. The temporary write-enabled synchronization workflow restored the canonical read-only workflow before committing; `.github/workflows/verify.yml` is byte-identical to main and is not part of the final PR changed-file set.

A fresh canonical read-only workflow run on this synchronized runtime/evidence head is required before automated closure.

## Manual evidence boundary

Automation cannot reclassify A10/A13. After final canonical CI is green, rerun only the affected manual observations:

- **R2 A10 — NVDA + Chrome:** Listening must be announced promptly; Stop must be exposed and operable; standard answer controls remain available; stopping must not change the answer.
- **R3 A10 — VoiceOver + Safari:** the attempt must not remain indefinitely Listening; Stop must be available and operable; no answer changes on stop.
- **R3 A13 — VoiceOver + Safari:** start one attempt and remain silent; by the AQP watchdog limit the Listening state must end with specific understandable no-speech feedback and a safe next action, with no answer changed.
- **R4 A10 — Windows Voice Access + Chrome:** `Stop voice input` must be a directly targetable visible control; activation must stop Listening while visible answer controls remain available and no answer changes.

Firefox remains capability-unavailable for the built-in Web Speech recognition route and does not need an RF-06 built-in-recognition retest.

Only separate post-fix manual evidence may support any F→P conversion. Historical q8 is never rewritten.
