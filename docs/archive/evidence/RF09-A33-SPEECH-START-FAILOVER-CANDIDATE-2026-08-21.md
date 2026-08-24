# RF-09 / A33 speech-start failover candidate — 21 August 2026

Status: **synchronized successor built and fully automated-verified; immutable preview published; final real-AT adjudication still required**

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

## Automated evidence

Source and test commits:

- RF-09 failover implementation: `00191c1d566c13debeea9635957e772767db3e6f`
- deterministic unit coverage for started and silent-pending speech paths: `7490a485552a0e5ca1770c27d71afc1a9d22fbd7`
- rendered cross-browser contract updated without mocking native speech: `9accd09d3dcedda7d9a200360f9d616f77dccf4d`

Focused tests distinguish two cases instead of treating `speak()` as success:

- browser speech actually starts → no `ariaNotify()` duplicate;
- speech is queued/pending but never becomes `speaking` → pending speech is cancelled and one normal-priority `ariaNotify()` is emitted.

The first full CI attempt correctly exposed one stale cross-browser expectation: it still required audio-on to produce no notification in every browser, even when native speech never started. That was a test-contract mismatch after the product behavior changed. The browser-support test was then updated to permit the two valid platform outcomes without feature mocks; deterministic unit tests remain responsible for exercising both internal branches.

## Synchronized retained runtime and immutable preview

- Synchronized product runtime: `d2c8ca5a2beba06bb281ed3db222a7a302f17702`.
- New immutable preview: `/rf09-speech-failover-preview/`.
- Preview URL: `https://sasoup-yr.github.io/accessible-questionnaire-platform/rf09-speech-failover-preview/?candidate=d2c8ca5a`.
- `rf09-speech-failover-preview/SOURCE-SHA.txt` on `gh-pages` contains exactly `d2c8ca5a2beba06bb281ed3db222a7a302f17702`.
- The failed `/rf09-arianotify-preview/` remains untouched as retained manual failure evidence.

The preview publisher copied the synchronized standalone artifact byte-for-byte and wrote the exact runtime SHA. Its successful one-time publish run was `32504498896`. Temporary write-enabled publisher workflows were then removed from the branch; they are not part of the retained product design.

## Canonical read-only verification

Canonical workflow run `32504611260` on head `a2405a4e993b36954244bb51a924a5f84a6a954e` completed **successfully** after the synchronized runtime and temporary-workflow removal.

It recorded:

- locked install / npm audit: **0 vulnerabilities**;
- Vitest: **23/23 files, 220/220 tests passed**;
- focused RF-09 unit suite: **5/5 passed**;
- rendered-browser accessibility regression: **12/12 passed**;
- cross-browser support matrix: **12/12 passed**, including the RF-09 support-setting path in Chromium, Firefox and WebKit;
- production build: passed;
- standalone/release generation: passed;
- committed generated-release freshness: passed.

This automation verifies implementation structure and browser behavior available to the test harness. It does **not** prove that VoiceOver actually announces the result on the auditor's Safari build.

## Manual gate

The immediate next diagnostic is intentionally narrow because the second candidate already produced the required separate AQP result for Large text, Standard text, recovery on/off and audio off in R3, and the successor change is specifically the silent-browser-speech suppression condition.

On the new immutable preview, test only **R3 VoiceOver + Safari, audio off → audio on** first:

1. Keep `Read new questions and feedback aloud` off.
2. With VoiceOver running, activate its visible label once using the ordinary pointer/label route.
3. Do not move the VoiceOver cursor to the blue result; wait about two seconds.
4. Record the exact automatic AQP result or `[no automatic announcement]`, and whether the result was spoken once or duplicated.

Expected AQP result:

`Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.`

Either of two spoken mechanisms is acceptable for this bounded requirement: browser speech may actually start, or the normal-priority `ariaNotify()` fallback may expose the same result to VoiceOver. The result must be timely, accurate and non-duplicated. Real R3 evidence remains decisive.

## Audit boundary

- This source change does not itself reclassify A33.
- Historical q8 remains unchanged.
- Do not overwrite either previous immutable RF-09 preview.
- Do not repeat already-established R3 Large/Standard/recovery/audio-off observations merely to prove the new audio-on diagnostic.
- R4's former `Standard` target-name collision is already resolved by the retained `Standard text` / `Large text` names; final complete R4-A33 closure still requires the frozen answer-retention/focus invariants on the exact retained candidate rather than inference from cropped screenshots.
