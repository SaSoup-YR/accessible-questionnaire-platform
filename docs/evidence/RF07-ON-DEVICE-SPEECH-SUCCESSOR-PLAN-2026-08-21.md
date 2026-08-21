# RF-07 successor / on-device command recognition plan — 21 August 2026

Status: **materially different successor started; no F→P claim until exact live retest**.

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**. The previous RF-07 candidate remains frozen as fail-safe application logic with a residual browser/device-dependent recognition limitation.

## Why reopening is justified

The preceding RF-07 investigation established that the AQP parser behaved safely when Windows desktop Chrome returned incomplete transcripts: `not four` surfaced as `Not`, and `number four` surfaced as `Number`; AQP did not infer or record 4. The same route was reported to work in Edge on the same computer and in Chrome on a phone and iPad. Further parser relaxation was rejected because omitted words cannot be reconstructed truthfully.

A materially different browser architecture is now available: current Web Speech specifications and Chromium expose on-device recognition through `processLocally`, static `available()` and `install()` methods, and an approximate `command` quality level for short isolated phrases. This changes the recognition engine/service path rather than weakening answer parsing.

## Primary platform and standards basis

- Chrome 139 introduced on-device recognition for the Web Speech API, including language-resource availability checks, installation and explicit local/cloud selection.
- The current Web Speech API defines `available`, `downloadable`, `downloading` and `unavailable` states for local language resources.
- The specification defines `command` quality for short phrases, one speaker and limited vocabulary — the closest declared use case to AQP's `number four`, visible endpoint labels and pair-choice names.
- `SpeechRecognition.available()` and `install()` remain experimental and may be blocked by the `on-device-speech-recognition` Permissions Policy.
- Starting a local recognizer without an installed language pack can produce `language-not-supported`, so availability and installation must be checked before `start()`.
- On-device language availability is user-agent dependent. The current Web Speech explainer lists Chrome on-device English support as `en-US`; therefore the successor must first preserve `en-GB` when locally available, then transparently try `en-US` only as the documented Chrome local-English fallback, and finally retain the existing remote `en-GB` route.

Primary references:

- https://developer.chrome.com/blog/new-in-chrome-139/
- https://webaudio.github.io/web-speech-api/
- https://github.com/WebAudio/web-speech-api/blob/main/explainers/on-device-speech-recognition.md
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/available_static
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/install_static
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API

## Open-source comparison

GitHub code search found the new local-recognition API concentrated in the Web Speech specification/explainers, MDN examples, Web Platform Tests and recent Chromium demonstrations rather than a mature cross-browser questionnaire component. No open-source implementation can guarantee recovery of a negation omitted by the recognizer.

The retained design therefore follows the primary specification/MDN state machine and keeps the mature safety principles from `react-speech-recognition`: feature detection, graceful fallback, one-shot user-triggered recognition and no unrestricted fuzzy matching.

## Bounded candidate design

The successor will:

1. use the unprefixed `SpeechRecognition` static API only when `available()` exists;
2. query local English command recognition in the order `en-GB`, then `en-US`;
3. request `quality: "command"`, with a compatibility retry without `quality` if an older implementation rejects that option;
4. set `processLocally = true` only after the relevant local language pack reports `available`;
5. when a pack is `downloadable`, call `install()` only in response to the participant's explicit Start voice input action, display a truthful preparation message, change no answer and require a fresh Start action after installation;
6. when a pack is already `downloading`, display that state and change no answer;
7. fall back to the existing remote `en-GB` route when local recognition is unavailable, blocked or fails to install;
8. retry once through the existing remote route if a supposedly prepared local start reports `language-not-supported`;
9. state which route is being used (`on-device` or `browser speech service`) without claiming recognition accuracy;
10. retain `maxAlternatives = 5`, contextual phrase biasing, exact parsing, cross-alternative negation veto, visible transcript/proposal, Confirm/Reject and visible-answer fallback;
11. never auto-commit a speech result.

## Regression gates

Automation must show:

- local `en-GB` available → local mode and `processLocally=true`;
- local `en-GB` unavailable but `en-US` available → transparent local-English fallback;
- `downloadable` → one installation attempt, no recognition start and no answer mutation;
- `downloading` → no duplicate install/start and no answer mutation;
- unsupported/blocked/throwing static API → ordinary remote `en-GB` route remains usable;
- a local `language-not-supported` start failure retries remotely once rather than looping;
- `not four`, `note four`, `knot four`, `naught four` and `nought four` remain rejected;
- a proposal remains uncommitted until Confirm and Reject preserves the prior response;
- the complete unit/component, rendered-browser, Chromium/Firefox/WebKit and generated-release gates remain green.

## Manual stopping rule

The exact successor may change a historical cell only after live retesting in the named environment.

Priority gate: **R4 Windows Chrome**, because that is where remote recognition was intermittent and the new local engine can be exercised. The frozen SUS sequence remains:

1. begin from no answer or a known non-4 answer;
2. `not four` must not propose or record 4;
3. `number four` must produce an uncommitted proposal for 4;
4. Reject must preserve the prior answer;
5. a repeated `number four` followed by Confirm may then record 4;
6. record whether AQP reports on-device `en-GB`, on-device `en-US`, remote fallback, downloading or unavailable.

R3 Safari must not be silently relabelled because Safari may not expose this Chromium API. If no local route is available, the previous residual status remains.

## Stop rules

Do not:

- map incomplete `Number` or `Not` transcripts to 4;
- add fuzzy matching or an invented confidence threshold;
- download a model before an explicit participant action;
- hide the local/remote route;
- loop installation or local/remote retries;
- claim improved accuracy from feature availability or CI;
- remove visible answer buttons;
- alter scoring, response values, storage, Qualtrics or submission semantics.
