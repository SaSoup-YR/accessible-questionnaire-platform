# RF-09 / A33 speech-start failover candidate — 21 August 2026

Status: **source repair and focused automated tests implemented; generated release / immutable preview / final real-AT adjudication still required**

## Why the second candidate was not sufficient

Candidate `98b8cd63b345f7e16e9fe24ada63f31db06c71f3` correctly announced text-size changes, recovery on/off and audio off in the supplied Safari + VoiceOver evidence, but audio on was silent.

The implementation error was an evidence error as much as a code error: RF-09 treated `component.audioGuidance === true` as proof that the browser's speech-synthesis confirmation was the active spoken channel and therefore suppressed `ariaNotify()`.

That assumption is not supported by the Web Speech API:

- `SpeechSynthesis.speak()` adds an utterance to the queue; it does not prove audible start: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak
- `SpeechSynthesisUtterance` fires `start` only when the utterance has actually begun to be spoken: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/start_event
- `SpeechSynthesis.speaking` is true while an utterance is actually in the process of being spoken: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- `SpeechSynthesis.pending` means an as-yet-unspoken utterance remains queued: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/pending

WebKit also has a reopened Safari speech-synthesis regression in which a `speak()` request with an unset voice can produce no speech in some locale/voice configurations. That issue is relevant evidence that an accepted `speak()` call cannot be used as proof of output, but it is **not** claimed as the proven root cause of this exact auditor machine:

- https://bugs.webkit.org/show_bug.cgi?id=243055

## Open-source / platform comparison

The notification fallback remains the commit-pinned GitHub ARIA Notification polyfill already retained in this branch:

- `github/arianotify-polyfill`
- pinned source commit: `15d720f075fbe12583e2cc0dab72956384e5c5ef`
- upstream: https://github.com/github/arianotify-polyfill

GitHub states that this polyfill is used in production on github.com. It uses native `ariaNotify()` when available and an ARIA live-region emulation otherwise. AQP retains the upstream queue, scoped region, registration delay and repeated-message workaround under the upstream MIT notice.

The bounded fix therefore does **not** replace native form controls, focus behavior, answers, scoring or the GitHub notification implementation. It changes only the condition under which AQP suppresses that fallback.

## Successor algorithm

For a support-setting result:

1. The visible blue AQP result is updated immediately, as before.
2. If built-in AQP audio is not expected, request one normal-priority `ariaNotify()` after 400 ms, as in the verified second candidate.
3. If built-in AQP audio is expected, do not assume the queued Web Speech request was audible. Observe `speechSynthesis.speaking` every 50 ms for a bounded 800 ms grace period.
4. If speech actually starts, stop: browser speech remains the sole AQP spoken channel and no AT fallback is generated.
5. If speech never starts, cancel a still-pending/paused late utterance before fallback so it cannot begin after the AT message and create a duplicate; then issue exactly one normal-priority `ariaNotify()` containing the same setting result.

This is fail-safe rather than fail-open: a silent queued speech request can no longer suppress the only assistive-technology status channel.

## Why 800 ms is bounded rather than an accessibility claim

The 800 ms value is not presented as a WCAG threshold and is not evidence of universal AT timing. It is an engineering grace period chosen to let a normally starting local speech engine become `speaking` while still delivering a timely setting result if it remains silent. The actual Safari + VoiceOver route remains the acceptance gate.

## Focused automated evidence

Source repair commits:

- RF-09 failover implementation: `00191c1d566c13debeea9635957e772767db3e6f`
- deterministic unit coverage for started and silent-pending speech paths: `7490a485552a0e5ca1770c27d71afc1a9d22fbd7`

Focused tests now distinguish two cases instead of treating `speak()` as success:

- browser speech actually starts → no `ariaNotify()` duplicate;
- speech is queued/pending but never becomes `speaking` → pending speech is cancelled and one normal-priority `ariaNotify()` is emitted.

The first full CI attempt showed **23/23 test files and 220/220 unit/component tests passing** and **12/12 rendered-browser accessibility tests passing**. Its cross-browser RF-09 expectation still encoded the old rule that audio-on must never create a notification, so that test correctly failed after the product behavior changed. This was a test-contract mismatch, not grounds to declare the product candidate verified.

The cross-browser test is being updated to permit the two standards-consistent platform outcomes without mocking native speech: either browser speech starts and no fallback is recorded, or exactly one audio-on fallback is recorded. Unit tests remain responsible for deterministically exercising both internal branches.

## Audit boundary

- This source change does not reclassify A33.
- The failed `/rf09-arianotify-preview/` remains immutable and must not be overwritten.
- A new immutable preview must be built from the synchronized successor and given a distinct path.
- Only the affected Safari + VoiceOver audio-on path needs immediate diagnostic re-test; final cell closure must still satisfy the frozen A33 invariants on the exact retained candidate.
- Historical q8 remains unchanged.
