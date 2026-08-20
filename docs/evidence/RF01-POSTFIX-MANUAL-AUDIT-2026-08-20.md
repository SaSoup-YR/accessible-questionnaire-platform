# RF-01 / A26 post-fix manual audit — 20 August 2026

Status: **manual adjudication complete — R1 P, R2 P, R3 F, R4 P; clean-connect smoke passed on all four routes**

## Evidence identity

- Retained runtime under manual test: `64a936ea50b70413bd9a6d780c28d5f376ff7d13`.
- Bridge file: `integrations/qualtrics/qualtrics-question.js`.
- Canonical automated verification for that runtime: workflow run `32403350892` — success.
- Historical q8 is immutable and remains **94 P / 31 F / 7 NA / 0 NT**. This file is separate post-fix evidence and does not rewrite q8.
- Frozen A26 requirement: Connecting is exposed as status; blocking connection failure is exposed as alert; participant AQP Start stays unavailable while unverified; no false connected claim appears; normal connected state must restore/retain status semantics.

Exact OS / browser / AT version strings still need to be copied into the final audit record from the test machines; they are not invented here.

## Forced wrong-origin route

The Qualtrics bridge was tested with `childOrigin` deliberately changed to `https://example.invalid` in the synthetic audit survey. Qualtrics native **Next page** returning after the timeout is expected recovery navigation and is not the participant AQP **Start** control.

| Route | Post-fix A26 adjudication | Observation |
| --- | --- | --- |
| R1 — NVDA + Firefox / Windows | **P** | NVDA automatically announced `Connecting questionnaire package 0.8.10-q10 to this Qualtrics response.` Then it announced `alert The questionnaire connection did not start. Do not collect a real response. Regenerate and replace the complete HTML and JavaScript, then test again.` Participant AQP Start was not available and no false connected claim appeared. The subsequent clean normal-connection smoke also passed. |
| R2 — NVDA + Chrome / Windows | **P** | NVDA automatically announced `Connecting questionnaire package 0.8.10-q10 to this Qualtrics response.` It then announced the connection-failure message and exposed it as an alert. Participant AQP Start was not available and no false connected claim appeared. The failure text was spoken more than once, but not to the point of making the state unusable. The subsequent clean normal-connection smoke also passed. |
| R3 — VoiceOver + Safari / macOS | **F** | The Connecting text was visibly rendered but VoiceOver did **not** automatically announce it: `[no announcement]`. The later blocking connection-failure alert **was** automatically spoken. Participant AQP Start was unavailable and no false connected claim appeared. The clean normal-connection smoke passed, but the frozen A26 requirement includes exposure of Connecting as a status, so R3 remains Fail. |
| R4 — Windows Voice Access + Chrome | **P** | Command used: `Show numbers`. Voice Access labelled the available interactive targets normally. No participant AQP Start target was exposed before verified connection and no false connected claim appeared. Qualtrics native Next may appear after the timeout. Voice Access is not a screen reader; status/alert role semantics are therefore supported by the retained source and automated verification, while this manual route establishes voice-control target/gating behavior. The subsequent clean normal-connection smoke also passed. |

## R3 diagnostic follow-ups — not retained in the product

Two narrow diagnostics were run only to determine whether Safari/VoiceOver silence was a timing or live-urgency issue:

1. Experimental commit `84617ceaafaa9f7433d9b2437c82d22ac0a3fd1f` delayed the Connecting update from 50 ms to 1000 ms. VoiceOver still did not automatically announce Connecting.
2. An isolated Safari diagnostic shim temporarily increased the Connecting live-region urgency. VoiceOver still did not automatically announce Connecting.

These diagnostics did **not** establish a working Safari/VoiceOver fix and are not retained in PR #74. The product branch remains on the 50 ms implementation that passed R1 and R2. Further timing/urgency tuning is not justified by the observed evidence and risks changing semantics merely to force speech.

## Clean normal-connection smoke

After restoring `childOrigin` to `https://sasoup-yr.github.io`, the short smoke was run on all four required routes. The required path was:

`connected visible -> participant AQP Start available -> Start opens item 1`

| Route | Clean connect -> connected -> Start -> item 1 |
| --- | --- |
| R1 NVDA + Firefox | **P** |
| R2 NVDA + Chrome | **P** |
| R3 VoiceOver + Safari | **P** |
| R4 Voice Access + Chrome | **P** |

The clean smoke confirms that the retained bridge returns to a usable normal connection state on every required route. It does **not** erase the R3 forced-route failure, because VoiceOver + Safari still failed to automatically expose the initial Connecting status.

## Final adjudication

- **R1-A26: P**.
- **R2-A26: P**.
- **R3-A26: F** — initial Connecting status visibly rendered but was not automatically announced by VoiceOver + Safari; later blocking alert and normal connection both worked.
- **R4-A26: P** — voice-control gating/target behavior passed, with status/alert semantics verified by the retained implementation and automated checks.
- Historical q8 remains unchanged at **94 P / 31 F / 7 NA / 0 NT**.
- No claim is made that this establishes universal accessibility, usability, disabled-user benefit, or complete WCAG conformance.

RF-01 is therefore **partially repaired, not universally closed**: the blocking error semantics and safe connection gating are repaired, but one route-specific VoiceOver + Safari status-announcement failure remains documented.
