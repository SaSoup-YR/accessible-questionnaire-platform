# RF-07 successor / on-device command-recognition candidate — 21 August 2026

Status: **component integration and generated release complete; canonical full workflow and live Windows-Chrome adjudication still required**.

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**. No historical A11/A12 failure is reclassified by this document.

## Exact candidate

- Draft PR: `#81` — Retry RF-07 with on-device command recognition.
- Branch: `agent/retry-rf07-on-device-speech`.
- Exact synchronized product/runtime source SHA: `53be7fe8e93cf6f02ea55638ec0bdb85f1a9f5da`.
- Stacked base: prior RF-07 safety candidate `1e0f5bcf360b3b27322c831247159fe9808cb041`.

## Materially different mechanism

The preceding RF-07 candidate could not reconstruct words omitted by the upstream Windows-Chrome recognizer and correctly retained fail-safe no-answer behavior. This successor changes the recognition route rather than the parser:

- prefer browser-managed on-device Web Speech when the unprefixed static API is available;
- check local English in the order `en-GB`, then `en-US`;
- request the specification's short-phrase `command` quality where implemented, with one compatibility retry without the newer quality option;
- install a downloadable language pack only after the participant explicitly activates Start voice input;
- show a truthful `installed` / `downloading` message and require a fresh Start action rather than silently continuing;
- fall back to the established remote `en-GB` route when local recognition is unavailable, blocked or fails;
- retry remotely exactly once when a reportedly available local language is rejected at start.

## Safety boundary retained

The successor leaves these controls unchanged:

- one-shot final recognition;
- up to five ranked alternatives;
- contextual phrases as probabilistic hints rather than a constrained grammar;
- exact/bounded parsing and cross-alternative negation veto;
- visible heard transcript and proposed answer;
- no answer commit until explicit Confirm;
- Reject and visible native-answer controls remain available;
- no fuzzy matching, inferred missing words or invented confidence threshold;
- no scoring, response-value, storage, Qualtrics or submission change.

The existing synchronous remote path is deliberately preserved for prefixed browsers and implementations without the new static local-language API, avoiding timing/focus regressions on unaffected routes.

## One-time integration verification

One-time branch-scoped workflow `32536325776` completed successfully before committing the exact candidate:

- **26 test files / 237 tests passed**;
- new pure on-device route tests: **10/10**;
- new component-integration tests: **3/3**;
- previous RF-07 hint/negation tests: **4/4**;
- all existing questionnaire, scoring, recovery, RF-06 and RF-09 regressions passed;
- locked dependency audit reported 0 vulnerabilities;
- TypeScript/Vite production build passed;
- standalone and generated release synchronization passed.

The workflow used `GITHUB_TOKEN` to create runtime commit `53be7fe8...`, so GitHub correctly did not recursively launch another pull-request workflow from that bot commit. This documentation commit is the human-authored trigger for the canonical read-only full workflow on the exact synchronized tree.

## Remaining gates

1. canonical repository workflow must pass unit/component, rendered-browser accessibility, Chromium/Firefox/WebKit support, production/standalone/release build and committed-release freshness on the final head;
2. an immutable SUS launcher must be published from the exact verified standalone artifact;
3. live R4 Windows Chrome must report whether local `en-GB`, local `en-US`, downloading, unavailable or remote fallback is used;
4. from an empty or known non-4 state, `not four` must not propose or record 4;
5. `number four` must create an uncommitted proposal for 4;
6. Reject must preserve the previous answer, and only a repeated proposal followed by Confirm may record 4.

R3 Safari is not silently reclassified because Safari may not expose the new Chromium local-recognition architecture.

## Claim boundary

Availability, installation and automated parser tests do not establish live recognition accuracy. Only exact-device manual evidence may change the frozen A11/A12 route cells. This successor does not claim universal speech-recognition reliability, accessibility benefit, usability, psychometric equivalence or complete WCAG conformance.
