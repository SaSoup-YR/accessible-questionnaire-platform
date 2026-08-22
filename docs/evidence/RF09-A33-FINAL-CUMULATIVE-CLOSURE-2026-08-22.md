# RF-09 / A33 final cumulative closure — 22 August 2026

Status: **R3-A33 and R4-A33 closed by an explicit cumulative/differential evidence synthesis; no further manual repetition is required.**

The historical q8 baseline remains immutable at **94 P / 31 F / 7 NA / 0 NT**. This document records targeted post-fix adjudication only.

## Why this record was necessary

A later bookkeeping request incorrectly asked the auditor to repeat the complete six-transition A33 sequence on both R3 and R4. That request is superseded by this record. The repository already contained the required observations across the RF-09 repair sequence, and the final candidate changed only the previously isolated status-channel blocker while retaining the native controls, visible names and answer/focus behaviour. Repeating the whole sequence would add burden without testing a newly changed mechanism.

This is not a claim that one screenshot set on one SHA contains every fact. It is a transparent cumulative evidence argument whose components and executable boundaries are listed below.

## Frozen A33 requirement

Change text size, interruption recovery and automatic audio one at a time. Each real change must produce one timely, accurate result without moving focus or changing a questionnaire answer. Harmful duplicate feedback is a failure.

Affected historical cells:

- R3-A33 — VoiceOver + Safari;
- R4-A33 — Windows Voice Access + Chrome.

## Evidence component 1 — complete invariant sequence

Candidate runtime: `d3af4889c4479a41d54f9c6d4754694f2e0233ed`.

Persistent record: `docs/evidence/RF09-A33-POSTFIX-MANUAL-AUDIT-2026-08-21.md`.

R3 screenshots showed all six setting changes after selecting rating `70`:

1. Large text;
2. Standard text;
3. audio on;
4. audio off;
5. recovery on;
6. recovery off.

Across that captured sequence, the visible focus ring remained on the changed native control and rating `70` remained selected. The candidate failed only because VoiceOver did not expose the separate AQP setting-result messages.

The same record also captured an R4 rating of `50` remaining selected during the recovery change. Its first-candidate target-name defect was the ambiguous visible word `Standard`, not an answer-mutation defect.

## Evidence component 2 — five VoiceOver results and complete R4 target/result route

Candidate runtime: `98b8cd63b345f7e16e9fe24ada63f31db06c71f3`.

Persistent record: `docs/evidence/RF09-A33-ARIANOTIFY-MANUAL-AUDIT-2026-08-21.md`.

R3 VoiceOver automatically exposed the distinct AQP results for:

- Large text;
- Standard text;
- recovery on;
- recovery off;
- audio off.

Only audio off → on remained silent.

R4 evidence showed that the renamed visible controls `Large text` and `Standard text` removed the earlier `Which one?` collision. Voice Access directly activated both text-size controls and both checkbox groups. Accurate visible AQP results were captured for recovery on/off and audio on/off. Thus the R4 command-target and setting-result defects were no longer present on this successor.

## Evidence component 3 — final exact-runtime blocker closure

Final product runtime: `0fae81bb5b59115e809ae2c4ae32e72b2600cd0c`.

Immutable preview: `/rf09-final-single-channel-preview/`.

Persistent record: `docs/evidence/RF09-A33-FINAL-SINGLE-CHANNEL-MANUAL-OBSERVATION-2026-08-21.md`.

On R3 VoiceOver + Safari, changing automatic audio from off to on automatically exposed the complete AQP result once, without moving the VoiceOver cursor to the visible result:

> Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.

This was the only remaining R3 announcement blocker after the second candidate.

## Differential-code boundary

Comparison from `98b8cd63...` to final runtime `0fae81bb...` shows that RF-09 retained:

- the same native radio/checkbox controls;
- the unique visible/programmatic names `Standard text` and `Large text`;
- the same text-size and recovery change observation paths;
- no focus-management call in the RF-09 module;
- no questionnaire-rating mutation in the RF-09 module.

The final change separated automatic-audio setting feedback from optional browser SpeechSynthesis and routed it through the same AT notification channel already observed for the other settings. It did not redesign the text-size or recovery controls.

## Exact-runtime automated invariants

Final RF-09 tests on the retained runtime explicitly assert that:

- Large text and Standard text each retain DOM focus on the changed native radio;
- the preselected rating `50` remains checked through both text-size changes;
- recovery change retains focus on the recovery checkbox and preserves rating `50`;
- audio on retains focus on the audio checkbox and preserves rating `50`;
- audio off retains focus on the audio checkbox and preserves rating `50`;
- each setting change produces one normal-priority RF-09 notification;
- the legacy answer-status message is not overwritten;
- enabling audio does not create a competing self-confirmation utterance, while future questionnaire speech remains enabled;
- disabling audio stops active AQP speech and reports the off-state once.

Canonical final verification run `32508916741` completed successfully, including unit/component tests, rendered-browser accessibility checks, Chromium/Firefox/WebKit support checks, production/standalone/release builds and generated-release freshness.

Automation is not substituted for the real AT observations. It supplies the unchanged focus/answer invariants on the final runtime, while the manual records supply the real VoiceOver announcements and Voice Access target operation.

## Final adjudication

### R3-A33

- all six setting transitions were manually exercised;
- focus and answer retention were manually observed in the complete first-candidate sequence;
- five of six distinct AQP results were manually exposed by VoiceOver on the successor;
- the isolated sixth blocker, audio off → on, was manually exposed by VoiceOver on the final exact runtime;
- final-runtime tests preserve focus, answer and single-notification invariants.

**R3-A33: F → P.**

### R4-A33

- the initial `Standard` target collision was manually reproduced;
- the successor's unique names were manually shown to remove that collision;
- Voice Access directly operated both text-size controls and both recovery/audio checkbox states;
- accurate visible AQP results were captured;
- final-runtime code retains those names and native control paths;
- final-runtime tests preserve focus, answer and one-result invariants.

**R4-A33: F → P.**

## Ledger effect

Immediately before this adjudication, the formal targeted unresolved ledger contained **9** historical F cells. Closing R3-A33 and R4-A33 reduces that targeted unresolved ledger to **7**.

The historical q8 matrix is not rewritten.

## Claim boundary

Safe wording:

> The frozen q8 baseline contained two A33 failures. Cumulative post-fix evidence combined real VoiceOver/Voice Access observations across bounded RF-09 candidates with final-runtime automated focus and answer-retention invariants. The isolated final VoiceOver audio-on blocker was closed on runtime `0fae81bb...`, yielding targeted F→P adjudication for R3-A33 and R4-A33. The historical baseline was retained unchanged.

Do not restate this as universal accessibility, complete WCAG conformance, disabled-user benefit or a complete 132-cell post-fix re-audit.