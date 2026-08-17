# Tests

Run:

```bash
npm test
```

The exact checkpoint count is recorded in the root `BUILD-INFO.json` after each
verified release build.

- `questionnaire-definition.test.ts` — discovery of three distributable built-ins,
  semantic rejection, weighted NASA-TLX/Raw TLX/SUS scoring, and a synthetic
  eight-item check of the retained centred-score extension.
- `custom-questionnaire.test.ts` — no-code definition creation, bounded embedding,
  mean/sum and reverse scoring, and executable/oversize rejection.
- `platform-questionnaire-import.test.ts` — bounded QSF/LSS/LSG/LSQ format detection,
  current default recode/code shapes, base-language selection, inert versus
  active attributes, multi-group selection, reviewed Array-row expansion,
  question/answer order, safe conversion, malformed input, unsupported content,
  code rejection and JSON round-trip.
- `platform-component.test.ts` — complete researcher-supplied, SUS and Raw TLX
  participant flows, imported-QSF completion/export and conductor link generation
  through the shared components, one English voice control, spoken English numbers
  for every questionnaire, exact visible labels for English questionnaires, and the
  one-time plain-recognition fallback when a service rejects contextual hints at start,
  including a stale first-attempt `onend`, a failing ordinary retry and the two-instance
  retry ceiling.
- `content.test.ts` and `scoring.test.ts` — NASA content, pair invariants and
  weighted scoring compatibility.
- `voice-input.test.ts` — displayed values/labels, conservative ranked alternatives,
  mobile Low homophone, Performance anchors, exact English labels, negation,
  ambiguity and invalid values.
- `accessibility-utils.test.ts` — immediate, post-layout and delayed mobile error
  reveal plus visual-viewport coordinate fallback.
- `saved-session-announcement.test.ts` — recovery-action focus, accessible
  descriptions, delayed live-region change, prior-opt-in speech and replay.
- `component.test.ts` — participant navigation, support, recovery, speech, voice and
  gaze state.
- `study-component.test.ts` — configured participant gate, adjustment policies,
  provenance, backups, storage/network failures and host events.
- `study.test.ts` — v0.7 migration, strict Version 4 records, cross-instrument CSV union,
  storage behavior and corruption rejection.
- `result-sink.test.ts` — exact-origin and exact-build handshakes, full-viewport
  one-scroll presentation, generic 60-field SUS staging, bounded handoff, watchdog
  and failure navigation.
- `a27-recovery-layout.test.ts` — executes the real Qualtrics bridge in jsdom and
  checks that post-staging watchdog recovery restores outer layout styles without
  re-parenting the live participant iframe, while still restoring native Next and
  sending the advance-failure message.
- `conductor-component.test.ts` — role separation, three clearly labelled
  questionnaire-addition routes, reviewed QSF conversion, explicit LimeSurvey
  group selection, no-code custom
  definition, generated Qualtrics package, score-display-aware completion text
  and error focus.
- `accessibility.test.ts` — structural axe scans including the three import/build
  routes and SUS.
- `focus-style.test.ts` — authored focus, control, selected, gaze and link contrast.
- `standalone.test.ts` — Version 0.8 single-file packaging and component boot.
- `webgazer-adapter.test.ts` — secure-context and dwell-state boundaries.
- `e2e-support/a27-iframe-lifecycle.spec.ts` — real-browser Chromium, Firefox and
  Playwright WebKit mechanism evidence that moving a connected iframe between DOM
  parents recreates its child document, whereas the q10-style style-only recovery
  changes preserve in-memory child state. This supports the repair hypothesis; it
  is not assistive-technology or Qualtrics-host evidence.

jsdom cannot validate the mobile visual viewport, rendered contrast,
assistive-technology/browser combinations, speech-service accuracy, webcam gaze
accuracy or iframe browsing-context recreation. The rendered Playwright checks add
browser-engine evidence for selected mechanisms and UI states, but passing automation
is technical evidence and does not establish complete WCAG conformance,
accessibility benefit, psychometric equivalence or an A27 manual-audit Pass.
