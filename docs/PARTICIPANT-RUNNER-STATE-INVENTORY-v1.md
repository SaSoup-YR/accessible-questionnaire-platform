# Participant runner state inventory v1

Frozen: 2026-08-10
Purpose: define the complete set of structurally distinct, participant-visible
states required by the correction-candidate browser regression and manual audit.

## Boundary

“Every participant screen” is operationalised as every reachable state that
changes the page's structure, task, error/recovery instruction or available
action. It does not mean every Cartesian combination of selected value, item
number, text-size preference and browser width. Those combinations reuse the
same component contract and are sampled separately by the fidelity and viewport
tests.

Automated scans are technical evidence only. Where a hardware, host-platform or
failure callback cannot be produced safely in CI, the production component is
rendered in a deterministic state fixture. The report labels those rows as
`deterministic UI-state fixture`; it does not claim that the external camera,
speech or Qualtrics service was exercised. The manual audit must exercise the
real route and may not copy the expected announcement from source code.

## Frozen state set

| ID | Participant-visible state | Automated setup | Manual audit |
| --- | --- | --- | --- |
| S01 | Invalid/incompatible participant link | Production malformed link | A24 |
| S02 | SUS introduction | Production participant link | A01–A03 |
| S03 | Accessibility/audio options expanded | Production disclosure control | A03 |
| S04 | Standard SUS item | Production workflow | A04–A05 |
| S05 | Missing-answer validation error | Production workflow | A06 |
| S06 | Built-in voice unavailable | Production browser-capability change | A09 |
| S07 | Built-in voice listening | Deterministic browser speech adapter | A10 |
| S08 | Confirmed-voice proposal pending | Deterministic browser speech adapter | A11–A12 |
| S09 | Voice-recognition error | Deterministic browser speech adapter | A13 |
| S10 | Saved-progress offer | Production save and reload | A14 |
| S11 | Resumed-progress summary | Production Resume action | A15 |
| S12 | Review and direct per-item correction | Production workflow; Cancel and Save are exercised as separate outcomes | A16–A17 |
| S13 | Submission failure with retry/backup | Deterministic sink-failure state | A18, A28 |
| S14 | Local completion | Production workflow | A18 |
| S15 | Recovered completed-backup offer | Production completion and reload | A25 |
| S16 | Qualtrics bridge connecting | Deterministic host-bridge state | A26 |
| S17 | Qualtrics bridge failure | Deterministic host-bridge state | A26 |
| S18 | Qualtrics submission transition | Deterministic accepted-receipt state | A27 |
| S19 | Qualtrics recording unconfirmed | Deterministic advance-failure state | A27–A28 |
| S20 | NASA-TLX pairwise comparison | Production workflow | A08 |
| S21 | NASA-TLX smiley-landmark item | Production support selection | A29 |
| S22 | Gaze setup expanded | Production disclosure control | A30 |
| S23 | Gaze positioning dialog | Deterministic camera-state fixture | A30 |
| S24 | Gaze calibration dialog | Deterministic camera-state fixture | A30 |
| S25 | Gaze proposal confirmation | Deterministic gaze-selection fixture | A31 |
| S26 | Synthetic semantic-differential item | Production custom definition | A32 |
| S27 | Imported fully labelled German item | Production custom definition | A23 |

Each S01–S27 state is scanned in five profiles: 1280, 768 and 320 CSS-pixel
widths, CDP 200% page scale, and the corresponding 640×450 CSS layout companion.
The required denominator is therefore **27 × 5 = 135 scans**. The generated
report must contain every state/profile pair, zero missing rows, and must report
axe violations, axe incomplete results, horizontal overflow and rendered target
sizes rather than hiding them.

## Deliberate non-states

- A changed support preference is a status-message event within S03/S04, not a
  separate screen. Its announcement is checked manually in A33.
- Different item numbers and selected values reuse S04; their data fidelity is
  checked across every item by the independent-oracle round trip.
- A browser storage write failure reuses the S13/S14 recovery structure. It is
  forced in unit tests and checked manually under A28; it is not counted twice
  as a visually identical browser state.
- Built-in speech synthesis does not create a new visual screen. Its exact
  output and interaction with screen readers are manual observations.

Changing this inventory after viewing a failure requires a dated protocol
deviation. Adding a newly reachable participant screen requires adding both an
automated state row and a manual-audit row before release.
