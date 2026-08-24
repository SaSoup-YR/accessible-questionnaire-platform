# RF-09 / A33 Final Cumulative Closure

Date: 22 August 2026  
Status: **R3-A33 and R4-A33 received targeted post-fix Pass evidence. No further RF-09 manual repetition is required.**

The historical q8 baseline remains unchanged at 94 Pass, 31 Fail, 7 Not applicable, and 0 Not tested. This record documents later targeted adjudication only.

## Frozen Requirement

Change text size, interruption recovery, and automatic audio one at a time. Each real change must produce one timely and accurate result without moving focus or changing a questionnaire answer. Harmful duplicate feedback is a failure.

Historical cells:

- R3-A33: VoiceOver with Safari;
- R4-A33: Windows Voice Access with Chrome.

## Cumulative Manual Evidence

The retained RF-09 evidence records show the following bounded sequence:

1. The first candidate exercised all six R3 setting changes. The selected rating remained unchanged and the visible focus remained on the changed native control. The remaining defect was that VoiceOver did not expose the separate setting-result message.
2. The successor candidate exposed five of the six distinct R3 result messages through VoiceOver. It also removed the R4 `Standard` target-name collision and allowed Voice Access to activate the text-size, recovery, and audio controls.
3. On final runtime `0fae81bb5b59115e809ae2c4ae32e72b2600cd0c`, VoiceOver automatically exposed the complete audio off-to-on result once without the auditor moving the VoiceOver cursor to the visible result.

Primary manual records:

- `RF09-A33-POSTFIX-MANUAL-AUDIT-2026-08-21.md`;
- `RF09-A33-ARIANOTIFY-MANUAL-AUDIT-2026-08-21.md`;
- `RF09-A33-FINAL-SINGLE-CHANNEL-MANUAL-OBSERVATION-2026-08-21.md`.

## Final-Runtime Invariants

The retained automated RF-09 tests assert that:

- Large text and Standard text retain focus on the changed native radio;
- recovery on and off retain focus on the recovery checkbox;
- audio on and off retain focus on the audio checkbox;
- the preselected rating remains checked through each setting change;
- each setting change produces one RF-09 notification;
- the existing answer-status message is not overwritten;
- enabling audio does not create a competing self-confirmation utterance;
- disabling audio stops active AQP speech and reports the off state once.

Automation supports the final-runtime focus and answer invariants. It is not substituted for the real VoiceOver and Voice Access observations.

## Final Adjudication

- **R3-A33: Fail to Pass.**
- **R4-A33: Fail to Pass.**

These are targeted route/cell results. They are not a complete 132-cell post-fix re-audit and do not establish universal accessibility, complete WCAG conformance, usability improvement, or participant benefit.
