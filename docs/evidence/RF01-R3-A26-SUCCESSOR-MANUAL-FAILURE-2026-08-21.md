# RF-01 successor / R3-A26 final manual failure — 21 August 2026

Status: **R3-A26 remains F; successor repair stopped without merge.**

Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**. This is targeted post-fix evidence only.

## Exact candidate

- PR: `#80` — Retry R3-A26 with a dedicated Qualtrics connection announcer.
- Exact synchronized source head: `807b48702312d16408e7b0ff23475713f6b57895`.
- Canonical workflow: `32528990541` — success.
- Qualtrics bridge identifier: `0.8.10-q10`.
- Candidate JavaScript package SHA-256: `dc04d79b45d5ee9753982524ae0f57ffbb73f8e8ee6734e52051157d61bed07f`.

## Candidate boundary

The successor used a materially different mechanism from the earlier failed timing experiments:

- one empty, persistent, body-level polite status announcer created before its first message;
- the visible `Connecting…` status retained as a semantic status but with automatic live behavior disabled, so only one advisory channel attempted automatic speech;
- blocking failures retained as visible assertive alerts;
- pending advisory cancellation on verified connection or blocking error;
- no focus movement, Safari sniffing, browser speech synthesis, response/scoring/storage/submission change or external runtime dependency.

Automation proved the intended DOM/timer/error behavior, but could not establish actual VoiceOver speech.

## Manual observation

The auditor copied the exact candidate JavaScript into the synthetic/copied Qualtrics test question and used the adverse-origin fixture by changing the relevant origin to `example.invalid`.

On macOS Safari with VoiceOver running, the initial visible `Connecting questionnaire package 0.8.10-q10 to this Qualtrics response.` advisory was **not automatically spoken**.

This observation fails the conjunctive frozen A26 requirement regardless of whether the later blocking error path remains intact: the initial Connecting state itself must be automatically exposed on the R3 route.

The exact macOS, Safari and VoiceOver version strings were not captured with this observation and are not invented here.

## Adjudication

- R1-A26: previously retained **P**.
- R2-A26: previously retained **P**.
- R3-A26: **F → F retained** on the successor candidate.
- R4-A26: previously retained **P**.

RF-01 remains partially repaired, with one route-specific residual failure: VoiceOver + Safari did not automatically expose the initial Qualtrics Connecting advisory.

## Stop rule

This successor has exhausted the materially different dedicated-announcer route after the earlier ordinary live-region, longer-delay and Safari urgency/timing attempts also failed.

Do not add:

- another arbitrary delay;
- a Safari-specific focus theft or user-agent branch;
- assertive escalation for a non-blocking advisory;
- browser TTS as a substitute for the screen-reader status channel;
- duplicated live regions;
- changes to answer, scoring, storage or submission behavior merely to force speech.

PR #80 should remain unmerged and may be closed as a failed successor. The residual F is more trustworthy than weakening unrelated interaction or error semantics.

## Claim boundary

This record establishes only the named manual technical failure. It does not establish universal Safari/VoiceOver behavior, usability, disabled-user benefit or complete WCAG conformance.
