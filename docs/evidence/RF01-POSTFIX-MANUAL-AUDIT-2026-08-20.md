# RF-01 / A26 post-fix manual audit — 20 August 2026

Status: **forced-failure route complete; final clean-connect smoke still pending**

## Evidence identity

- Retained runtime under manual test: `64a936ea50b70413bd9a6d780c28d5f376ff7d13`.
- Bridge file: `integrations/qualtrics/qualtrics-question.js`.
- Historical q8 is immutable and remains **94 P / 31 F / 7 NA / 0 NT**. This file is separate post-fix evidence and does not rewrite q8.
- Frozen A26 requirement: Connecting is exposed as status; blocking connection failure is exposed as alert; participant AQP Start stays unavailable while unverified; no false connected claim appears; normal connected state must restore/retain status semantics.

Exact OS / browser / AT version strings still need to be copied into the final audit record from the test machines; do not invent them here.

## Forced wrong-origin route

The Qualtrics bridge was tested with `childOrigin` deliberately changed to `https://example.invalid` in the synthetic audit survey. Qualtrics native **Next page** returning after the timeout is expected recovery navigation and is not the participant AQP **Start** control.

| Route | Forced-failure result | Observation |
| --- | --- | --- |
| R1 — NVDA + Firefox / Windows | **P for forced-failure path** | NVDA automatically announced `Connecting questionnaire package 0.8.10-q10 to this Qualtrics response.` Then it announced `alert The questionnaire connection did not start. Do not collect a real response. Regenerate and replace the complete HTML and JavaScript, then test again.` Participant AQP Start was not available and no false connected claim appeared. |
| R2 — NVDA + Chrome / Windows | **P for forced-failure path** | NVDA automatically announced `Connecting questionnaire package 0.8.10-q10 to this Qualtrics response.` It then announced the connection-failure message and exposed it as an alert. Participant AQP Start was not available and no false connected claim appeared. The failure text was spoken more than once, but not to the point of making the state unusable. |
| R3 — VoiceOver + Safari / macOS | **F** | The Connecting text was visibly rendered but VoiceOver did **not** automatically announce it: `[no announcement]`. The later blocking connection-failure alert **was** automatically spoken. Participant AQP Start was unavailable and no false connected claim appeared. Because the frozen A26 requirement includes exposure of Connecting as a status, R3 remains Fail. |
| R4 — Windows Voice Access + Chrome | **P for the voice-control observable portion of the forced-failure path** | Command used: `Show numbers`. Voice Access labelled the available interactive targets normally. No participant AQP Start target was exposed before verified connection and no false connected claim appeared. Qualtrics native Next may appear after the timeout. Voice Access is not a screen reader, so it is not treated as evidence that live-region speech occurred; the status/alert semantics are covered separately by source/automated verification. |

## R3 diagnostic follow-ups — not retained in the product

Two narrow diagnostics were run only to determine whether Safari/VoiceOver silence was a timing or live-urgency issue:

1. Experimental commit `84617ceaafaa9f7433d9b2437c82d22ac0a3fd1f` delayed the Connecting update from 50 ms to 1000 ms. VoiceOver still did not automatically announce Connecting.
2. An isolated Safari diagnostic shim temporarily increased the Connecting live-region urgency. VoiceOver still did not automatically announce Connecting.

These diagnostics did **not** establish a working Safari/VoiceOver fix and are not retained in PR #74. The product branch remains on the 50 ms implementation that passed R1 and R2. Further timing/urgency tuning is not justified by the observed evidence and risks changing semantics merely to force speech.

## Adjudication boundary

- R1 and R2 forced-failure paths: pass.
- R3: fail because the visible Connecting status is not automatically exposed by VoiceOver + Safari, although the later error alert is exposed correctly.
- R4: manual voice-control gating behavior passes; Voice Access itself is not evidence of screen-reader announcement behavior.
- No claim is made that this establishes universal accessibility, usability, disabled-user benefit, or complete WCAG conformance.

## Final remaining action

Restore `childOrigin` to `https://sasoup-yr.github.io` and run one short clean smoke on each required route:

`connected visible -> participant AQP Start available -> Start opens item 1`

No questionnaire completion or submission is required for this smoke. Record the result per route below.

| Route | Clean connect -> connected -> Start -> item 1 |
| --- | --- |
| R1 NVDA + Firefox | **Pending** |
| R2 NVDA + Chrome | **Pending** |
| R3 VoiceOver + Safari | **Pending** |
| R4 Voice Access + Chrome | **Pending** |

R3-A26 remains F even if the clean smoke passes, because the forced-failure Connecting status was not automatically announced by VoiceOver. Do not change product semantics to `role=alert` merely to make an advisory Connecting message more forceful.