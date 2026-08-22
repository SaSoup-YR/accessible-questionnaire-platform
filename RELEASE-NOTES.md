# AQP 0.8.0 — final prototype release notes

Date: 22 August 2026  
Status: final MSc prototype freeze candidate

## Release scope

AQP 0.8.0 is the final integrated technical prototype for the dissertation route. It combines the loaded questionnaire-definition platform, participant runner, result provenance, bounded import workflow, Qualtrics bridge and the retained accessibility/recovery repairs into one generated release.

This release supports configuration-specific technical claims. It does not establish universal accessibility, complete WCAG conformance, psychometric equivalence, usability improvement or benefit for disabled users.

## Included questionnaire definitions

- weighted NASA Task Load Index;
- raw NASA Task Load Index;
- System Usability Scale;
- versioned questionnaire-definition JSON Schema.

The researcher workflow also accepts a bounded, review-first subset of Qualtrics QSF and LimeSurvey LSS, LSG and LSQ definition exports. Unsupported or ambiguous source content is blocked or named for confirmation rather than silently changed.

## Retained platform capabilities

- questionnaire content and scoring loaded from a validated definition rather than compiled into the participant runner;
- canonical SHA-256 definition fingerprint in the configuration and result record;
- full definition snapshot retained with results for reconstruction;
- pseudonymous participant-code binding and invalid-link blocking;
- transactional review editing: Cancel preserves the committed answer, route, score and stored progress; Save commits once;
- browser-local interruption recovery and completed-result backups;
- truthful Qualtrics staging, waiting, failure and host-owned completion states;
- fail-closed storage/staging recovery with Retry, Change, JSON and CSV routes;
- 320 CSS-pixel participant reflow safeguards;
- visible native smiley radio targets for speech-control number overlays;
- explicit setting-change feedback without moving focus or changing an answer;
- native modal saved-session recovery with direct continuation to the first unanswered task;
- visible Stop, watchdog and native-answer fallback for optional in-page voice input;
- strict voice proposal parsing, negation veto and explicit confirmation before answer commitment;
- optional experimental gaze route with separate confirmation and ordinary controls retained.

## Final targeted repair outcome

The immutable pre-repair q8 audit remains **94 Pass / 31 Fail / 7 Not applicable / 0 Not tested** across 132 route/check cells.

Separate targeted post-fix evidence closed **25 of the 31 historical failures**. Six residual cells remain:

| Family | Residual cells | Release decision |
| --- | --- | --- |
| RF-01 | R3-A26 | Retain visible Connecting state, verified safe gating and blocking alert. Do not force focus, duplicate speech or relabel the silent VoiceOver + Safari route as Pass. |
| RF-06 | R4-A10 | Retain visible Stop, watchdog and native controls. Do not add an unreliable workaround for simultaneous Windows Voice Access and in-page Web Speech command capture. |
| RF-07 | R3-A11, R3-A12, R4-A11, R4-A12 | Retain strict parsing and explicit confirmation. Do not guess a missing number/negation or weaken the frozen phrase criterion. |

The final RF-04 residual was closed. On the exact Safari + VoiceOver candidate, VoiceOver entered the named saved-questionnaire web dialog; the modal exposed the exact `3 of 10` state and recovery choices; Resume continued to the focused Item 4 heading with all three answers retained.

## Verification

Integrated product revision:

`e00a737de964e120ffec38c5030d4ad212cbff5d`

Ordinary read-only canonical workflow:

`32544006644 — success` on documentation head `2c183b3a2dc2333feeace48dcd4638c344c14b17`

Recorded gates:

- 26/26 unit/component test files and 230/230 tests;
- 12/12 rendered-browser routes;
- 18/18 Chromium, Firefox and Playwright WebKit support routes;
- production, standalone and synchronized release builds;
- committed generated-release freshness;
- 0 vulnerabilities reported by the locked installation audit.

Retained 90-day workflow artifacts:

- quantified technical evaluation: ID `9467917456`, archive SHA-256 `e5f1df4693c76d0ee3bc651803a1ec563ea9b5d5f26417d381a7d86b4260d5d1`;
- rendered accessibility evidence: ID `9467954426`, archive SHA-256 `b5ca8b8e5175bc06a8f511190ff89deed5847025deba5d9eabd4eb3e432881b6`.

Playwright WebKit is not Safari + VoiceOver evidence. Automated speech support is not a live microphone-recognition result.

## Known limitations

- Browser speech recognition remains dependent on browser, operating system, microphone, language model and service availability.
- Simultaneous OS voice control and page-level speech recognition may compete for commands.
- The initial embedded Qualtrics Connecting status was not automatically exposed by VoiceOver + Safari in the frozen R3 route; blocking error exposure and safe Start gating remain.
- The bounded import profile does not support every questionnaire or source-platform feature.
- Imported or transformed instruments require independent permission and psychometric review.
- Experimental gaze requires a secure context, camera permission and calibration and is not part of the core accessibility claim.
- Browser-local recovery and export do not replace an approved research data-management system.
- The technical audit did not include a disabled-participant benefit study.

## Deployment notes

The root `index.html`, `study.html`, `assets/` and `questionnaires/` directories are generated release outputs. Refresh them only with:

```bash
cd source
npm ci
npm run build:release
```

Do not hand-edit the generated bundles. A Qualtrics deployment must use the exact reviewed bridge/package, a copied synthetic survey for fault testing and a fresh host-row smoke test before research use.

## Evidence and citation

- `EVIDENCE-INDEX.md` maps claims to exact repository records;
- `BUILD-INFO.json` contains the machine-readable release summary;
- `TESTING.md` contains reproducible procedures;
- `docs/evidence/FINAL-PROTOTYPE-FREEZE-2026-08-22.md` records the final claim boundary;
- `CITATION.cff`, `LICENSE` and `THIRD_PARTY_NOTICES.md` govern citation and redistribution information.
