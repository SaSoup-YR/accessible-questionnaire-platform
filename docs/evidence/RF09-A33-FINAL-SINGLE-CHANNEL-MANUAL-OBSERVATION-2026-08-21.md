# RF-09 / A33 final single-channel manual observation — 21 August 2026

Status: **final R3 audio-on blocker passed on the exact immutable runtime; full-cell final-candidate bookkeeping remains separate**

## Exact candidate

- Product runtime: `0fae81bb5b59115e809ae2c4ae32e72b2600cd0c`.
- Immutable preview: `/rf09-final-single-channel-preview/`.
- Preview `SOURCE-SHA.txt`: exactly the runtime above.
- Route: R3 VoiceOver + Safari on macOS.
- Historical q8 remains immutable at **94 P / 31 F / 7 NA / 0 NT**.

## Observation

The auditor began with `Read new questions and feedback aloud` off and activated the visible checkbox once. Without moving the VoiceOver cursor to the visible result, VoiceOver automatically presented the AQP setting result:

> Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open.

The supplied screenshot shows the checkbox checked, the identical visible blue AQP result, and the VoiceOver caption containing the same complete message.

This directly closes the audio-on announcement blocker that kept R3-A33 failed on the preceding `98b8cd63...` and `d2c8ca5...` candidates.

## Adjudication boundary

This observation proves the changed audio-on sub-path on the exact final runtime. It does **not** silently inherit all six A33 transition observations or answer/focus invariants from an older SHA; the frozen protocol requires final-candidate evidence before the complete route-cell can be reclassified.

Accordingly:

- final-runtime audio-on sub-check: **P**;
- R3-A33 complete route-cell: **pending minimal exact-candidate closure bookkeeping**, not automatically rewritten;
- R4-A33 complete route-cell: likewise requires exact-final-candidate closure if a formal F→P claim is made;
- no additional RF-09 code change is justified by this successful diagnostic.

RF-09 code is frozen at the final single-channel architecture while the next independent repair family proceeds in a stacked branch.
