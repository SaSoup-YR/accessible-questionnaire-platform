# RF-09 / A33 speech-start failover manual audit — 21 August 2026

Status: **third candidate manually observed; R3-A33 remains failed**

## Candidate and evidence boundary

- Candidate runtime / immutable preview source: `d2c8ca5a2beba06bb281ed3db222a7a302f17702`.
- Immutable preview used: `/rf09-speech-failover-preview/`.
- Route: R3 VoiceOver + Safari on macOS.
- Immediate diagnostic requested after the second candidate failed: start with automatic audio off, activate `Read new questions and feedback aloud` once, do not move the VoiceOver cursor to the visible blue result, wait about two seconds, and report the automatic result.
- Auditor observation: **`[no automatic announcement]`**; reported in the audit conversation as `还是完全没说` (“still said nothing at all”).
- This record does not infer an internal `speechSynthesis.speaking`, `pending`, native `ariaNotify`, or fallback-live-region state that was not directly observed on the auditor machine.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Adjudication

**R3-A33 remains F on candidate `d2c8ca5...`.**

The third candidate attempted to distinguish queued browser speech from started browser speech: it observed `speechSynthesis.speaking` for a bounded grace period and used `ariaNotify()` only if browser speech did not start. The real Safari + VoiceOver observation still produced no automatic AQP audio-on setting result.

The manual result therefore disproves the product-level assumption that browser speech lifecycle state is a sufficient gate for suppressing the independent assistive-technology status channel on this route. It does **not** establish which lower-level Safari, VoiceOver, Web Speech or ARIA-notification state caused the silence.

## Why this candidate is not retained as the final engineering attempt

A setting-result status message and optional browser text-to-speech are separate output responsibilities. Coupling the status result to a browser-speech state creates an unnecessary dependency: the component has to guess whether the optional audio channel will actually serve as the user's setting confirmation.

The final bounded successor therefore separates those responsibilities:

- the audio on/off *setting result* uses the same single normal-priority AT notification channel as the other RF-09 setting results;
- enabling the audio option no longer starts browser speech merely to announce that the option was enabled;
- the `audioGuidance` state is still enabled, so subsequent questionnaire questions, selected answers and feedback continue to use the existing browser speech-synthesis feature;
- disabling audio cancels any active AQP browser speech before the off-state result is notified;
- native checkbox semantics, focus, questionnaire answers, scoring, persistence and support-change recording remain in scope for regression checks.

This is a final architectural simplification, not a claim that the next Safari + VoiceOver observation must pass. Real R3 behavior remains the acceptance gate. If the final single-channel successor is also silent, RF-09 will be frozen as an unresolved R3-A33 failure rather than receiving further timing or speech-engine workarounds.
