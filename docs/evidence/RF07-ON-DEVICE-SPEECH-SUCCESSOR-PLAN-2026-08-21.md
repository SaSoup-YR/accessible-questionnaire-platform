# RF-07 successor / on-device speech-recognition plan — 21–22 August 2026

Status: **command-quality candidate manually failed the frozen phrase; dictation-quality successor implemented; no F→P claim until exact live retest**.

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**. The earlier RF-07 parser candidate remains retained as fail-safe application logic; no parser weakening is proposed.

## Why RF-07 was reopened

The original RF-07 investigation established that Windows desktop Chrome often returned incomplete transcripts: `not four` surfaced as `Not`, and `number four` surfaced as `Number`; AQP did not infer or record 4. The same route was reported to work in Edge on the same computer and in Chrome on a phone and iPad. Further parser relaxation was rejected because omitted words cannot be reconstructed truthfully.

A materially different browser architecture became available through `SpeechRecognition.processLocally`, static `available()` / `install()` language-pack management, and declared local-model quality floors.

## Command-quality candidate and live result

The first on-device successor requested the default/`command` quality floor, checked local `en-GB` before `en-US`, and retained the remote `en-GB` fallback. Its exact SHA `f4c60d3b70a9b86fa06bb3071ba6a2155be4963b` passed the complete repository workflow.

Live Windows-Chrome testing reached the genuine local route:

`Listening for one answer using on-device English recognition (en-GB).`

However, the installed command model usually returned only `Number` for `number <value>`. Bare single numbers were recognised and safely produced proposals, but the frozen A11/A12 action remained unreliable. Full details and screenshot hashes are in:

`docs/evidence/RF07-ON-DEVICE-COMMAND-MANUAL-OBSERVATION-2026-08-22.md`.

The command candidate therefore closed **zero** historical RF-07 cells. Bare-number success is supplementary product evidence, not a replacement for frozen `number four` test data.

## Primary standards/platform basis for the final successor

The current Web Speech API distinguishes model capability floors:

- `command`: short isolated phrases, limited vocabulary and one speaker;
- `dictation`: continuous speech, moderate background noise and one primary speaker;
- `conversation`: higher-complexity multi-speaker recognition.

`SpeechRecognition.available()` and `install()` accept the requested `quality` level. MDN's current on-device example explicitly checks and installs a `dictation`-quality pack before starting recognition, and falls back remotely if that floor is unavailable. The APIs remain experimental and can be blocked by the `on-device-speech-recognition` Permissions Policy.

Primary references:

- https://webaudio.github.io/web-speech-api/
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/install_static
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
- https://developer.chrome.com/release-notes/150

## Open-source comparison

GitHub search still finds the quality-aware local API mainly in the Web Speech specification, MDN, Web Platform Tests and recent browser demonstrations. Mature browser speech wrappers generally expose provider fallback and command matching, but no application-side library can reconstruct a value omitted by the recognizer.

A large in-browser Whisper/Parakeet/Vosk dependency was rejected for this dissertation candidate because it would introduce a separate model-distribution, performance, privacy, CSP and cross-origin architecture disproportionate to one residual manual cell. The native API plus strict fallback remains the smallest auditable option.

## Retained dictation-quality design

The final bounded successor:

1. uses the unprefixed static API only when `available()` exists;
2. requests **`quality: "dictation"`** as a hard local-capability floor;
3. prefers local `en-US`, matching Chrome's documented local-English examples, then tries local `en-GB`;
4. does **not** retry without `quality`, because that would silently return to the manually failed command/default model;
5. sets `processLocally=true` only after the relevant dictation-quality pack reports `available`;
6. when a pack is `downloadable`, requests installation only after the participant explicitly activates Start, changes no answer, and requires another Start action;
7. reports `downloading` truthfully without duplicate installation;
8. falls back to the existing remote `en-GB` route when the quality-aware API is absent, blocked, throws, no dictation pack exists or installation fails for both local candidates;
9. retries remotely once if a prepared local start reports `language-not-supported`;
10. states the selected local language and `dictation-quality model` in the visible route message;
11. retains one-shot recognition, up to five alternatives, contextual bias, exact parsing, cross-alternative negation veto, transcript/proposal display, Confirm/Try again and visible answer buttons;
12. never auto-commits a speech result.

## Regression gates

Automation must show:

- local `en-US` dictation available → local mode and `processLocally=true`;
- local `en-US` unavailable but `en-GB` dictation available → bounded fallback;
- downloadable dictation pack → one installation request, no recognition start and no answer mutation;
- downloading → no duplicate install/start;
- quality option unsupported/blocked → remote route, not silent command-model downgrade;
- local start failure → one remote retry without a loop;
- all prior negation, proposal, rejection, scoring, storage, browser and release tests remain green.

## Final manual stopping rule

Priority route remains **Windows desktop Chrome**. Begin from an empty or known non-4 SUS answer and record the exact route message.

1. If the page reports a dictation model was installed or is downloading, that is preparation only; activate Start again when ready.
2. `not four` must not propose or record 4.
3. `number four` must produce an uncommitted proposal for 4.
4. Try again/Reject must preserve the prior answer.
5. Repeated `number four` plus Confirm may then record 4.

If the exact dictation-quality successor still truncates the two-word phrase or falls back to the previously unreliable remote route without closing the frozen sequence, RF-07 returns to residual-F and stops. Bare-number operation may be retained as a supplementary route, but the historical cell must not be changed by moving the goalposts.

R3 Safari is not silently relabelled: this Chromium-specific architecture can directly adjudicate only the named Windows-Chrome route unless Safari independently exposes and passes the same capability.

## Stop rules

Do not:

- map incomplete `Number` or `Not` transcripts to 4;
- rewrite the frozen phrase as a bare-number test merely because bare numbers work;
- add unrestricted fuzzy matching or an invented confidence threshold;
- download a model before explicit participant action;
- hide the local/remote route;
- loop installation, locale or local/remote retries;
- claim improved accuracy from feature availability or CI;
- remove visible answer buttons;
- alter scoring, response values, storage, Qualtrics or submission semantics.
