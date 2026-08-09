# Version 0.8 technical test checklist

Use synthetic data only. Do not recruit until the candidate release, study
protocol and applicable data route are confirmed.

Record commit, browser, operating system, device, test data, expected result,
observed result and Pass, Partial, Fail or Not supported.

## 1. Conductor and definition boundary

1. Open `study.html`.
2. Select weighted NASA-TLX. Confirm 6 items, 21 values, 15 comparisons and weighted
   scoring.
3. Select Raw TLX. Confirm the same six items, 21 values, no comparisons and
   unweighted-mean scoring.
4. Select SUS. Confirm 10 items, 5 values, no comparisons and SUS scoring.
5. Confirm that UEQ-S is absent from this public candidate and that no UEQ-S
   definition file is present in `questionnaires/`.
6. Import the committed original synthetic semantic-differential fixture. Confirm
   seven visually unnumbered positions and preserved accessible endpoint context.
7. Confirm SUS removes smiley and simpler-wording controls while retaining
   presentation, audio, recovery, voice and gaze controls.
8. Generate, download and re-import one configuration for each distributable instrument.
9. Import a result in the configuration input. Confirm `There is a problem` receives
   focus and is moved to the start of the visible viewport on desktop, iPhone and
   iPad.

## 2. Structured import and definition reproduction

Follow the exact acceptance procedure in
[`docs/QUESTIONNAIRE-IMPORT.md`](docs/QUESTIONNAIRE-IMPORT.md).

At minimum:

1. Import the repository's sanitised QSF, LSS, LSG and LSQ fixtures separately.
2. For QSF, LSS and LSG, confirm two items, source order, 1–5 numeric values,
   visible labels and zero unsupported items. For LSQ, confirm one item and the
   explicit warning that survey and group context is unavailable.
3. Convert QSF, LSS and LSG with reviewed mean scoring, complete answers `4` and
   `2`, and confirm a score of `3.00`. Convert LSQ and confirm its one response
   and score.
4. Download each AQP definition JSON and re-import it through the separate
   **Reuse an AQP questionnaire definition** route.
5. Repeat with a fresh real QSF and real LimeSurvey structure exports. Use LSS
   for a whole survey, LSG for one group and LSQ for one standalone question.
6. For a multi-group LSS, confirm that group and compatible rating-set selection
   name every excluded group/question rather than silently flattening the file.
7. Verify newly dated local and Qualtrics results and exports.
8. Treat any silent omission, approximation, order/value mismatch, wrong score
   or failed round-trip as a release blocker.
9. Import a sanitised two-row LimeSurvey Array (Flexible Labels) question. Confirm
   that both row statements appear in source order, each row has its own labelled
   radio group, and both use the same complete scale from `answer_l10ns`.

### Recorded real-file regression for the current candidate

On 1 August 2026, two real-world audit files were tested directly without adding
their questionnaire content to the public repository:

- `limesurvey_survey_578216.lss`, SHA-256
  `a3c954a02a0193b048e6bf4590a8ae78f27fa612bd96ebd5f9668a15a01dc7d2`;
- `limesurvey_group_9987.lsg`, SHA-256
  `283292f512c954fc81e423476d6968d3351492a8652433a1fcde836c3d3bee0b`.

The LSS exposed all six groups. Every compatible group/rating-set selection converted
with no unsupported findings, and the five-item Spatial Presence selection completed
through the participant-result flow. The LSG converted SP1–SP5 on the 1–7 scale and
also completed through that flow. The primary tester subsequently imported and ran the
supervisor-supplied German LSG on the synchronized public candidate without an import
or participant-flow error. This verifies the structured-import path, not German
spoken-label recognition. The recorded `0.8.7-q7` Qualtrics accepted row is a
historical baseline only. Bridge `0.8.8-q8` adds the definition fingerprint and
must receive a fresh synthetic accepted row before release; the current candidate
repeated the changed-risk offline warning, reconnect/retry and refresh-recovery paths.

### Recorded rc.4 voice and recovery smoke check

On 1 August 2026, the primary tester reported the current English voice route working
and supplied visible-state evidence for the safety boundary. `Not 4`, `Agree quickly`
and `Strongly` produced no selected answer. Intentional `4` produced the correct visible
proposal for value 4 and required **Confirm** before recording it. The same candidate
showed a connection/retry message when submission was attempted offline; after the
connection returned, retry and page-refresh recovery worked normally. These are bounded
manual smoke results alongside the automated parser, fallback, stale-event and
single-retry regression tests; they are not a universal speech-recognition claim.

## 3. Participant workflows

### NASA-TLX

1. Complete six ratings and all fifteen pair comparisons.
2. Check reversed Performance anchors: Good at 0 and Poor at 100.
3. Review and submit. Verify the Version 4 record has NASA identity, answers,
   weights, weighted score, support state and input routes.

### SUS

1. Confirm the exact ten statements and a 1–5 agreement scale.
2. Complete all ten items. Confirm that no pair page appears.
3. Use the ideal alternating pattern 5,1,5,1,5,1,5,1,5,1 and verify a SUS score of
   100.
4. Verify the Version 4 record has SUS identity, ten ratings, empty pair data,
   alternating contributions and the SUS score.

### Raw TLX

1. Confirm the six TLX items and 0–100 scale are retained.
2. Complete values 0, 20, 40, 60, 80 and 100. Confirm no pair page appears and the
   Raw workload score is 50.

### Synthetic semantic-differential regression

1. Load `custom-semantic-differential-check.questionnaire.json` through the
   validated custom-definition route.
2. Confirm seven visually unnumbered positions between the two original synthetic
   endpoints, no pair page and a deterministic mean result.
3. Confirm this fixture is labelled synthetic and is not described as UEQ-S or as
   psychometric-equivalence evidence.

## 4. Errors, focus and recovery

1. Leave an item unanswered and press Next. Confirm an explicit error, programmatic
   focus and immediate movement to the start of the visible viewport on desktop,
   phone and tablet. Test both the
   direct participant page and the full-viewport participant page inside Qualtrics
   Preview.
2. Reload a recovery-enabled questionnaire midway. Re-enter or recover the
   pseudonymous code according to the shared-device procedure. Confirm focus moves
   to the saved-questionnaire region and its accessible description states the
   exact completed count and Resume/Erase choices. With automatic audio previously
   enabled, confirm the page attempts the same exact message; also test the explicit Hear
   saved-progress message fallback because mobile browsers may block speech after
   reload.
3. Test storage disabled/full. Confirm no crash or false local-save claim and retain
   in-memory JSON/CSV routes.
4. Test return-to-answer and resubmission after a host failure.
5. Load a synthetic Version 0.7 weighted NASA-TLX interrupted session. Confirm it
   is rewritten with the Version 4 instrument and definition snapshot before Resume
   is offered. Change the stored definition snapshot and confirm recovery is blocked,
   a restart message is shown and no old answer is applied.
6. Load a synthetic Version 0.7 completed backup. Confirm ratings, pair choices,
   weights and score are recalculated and a valid Version 4 backup is created. Repeat
   with a tampered score and confirm the old record is retained but not imported.

## 5. Voice input

1. Test displayed numeric values first; these are the recommended cross-device
   utterances.
2. In NASA smiley mode test Low, Closer to Low, Middle, Closer to High and High.
   On iPhone, record the actual transcript returned for Low; test `zero` as the
   documented reliable fallback.
3. Test Performance with Good, Closer to Good, Middle, Closer to Poor and Poor.
4. Confirm every accepted result is shown and announced as a proposal and requires
   explicit confirmation.
5. Confirm `not low`, `not four`, `note 4`, `knot four`, `naught four`,
   `nought four`, `low or high`, `anything but low`, `twenty three`, `73` and two
   pair names are rejected. Test both alternative orders for an unsafe result: a
   valid number before the unsafe phrase and after it. When several safe alternatives
   map to different visible answers, confirm that only the browser's first-ranked safe
   answer is proposed, its transcript is displayed and no value is recorded automatically.
6. Confirm exact safe aliases such as `hello` for Low are accepted only as the whole
   utterance and never inside a longer phrase.
7. Repeat on every target browser because Web Speech acoustic recognition is
   browser/OS behavior, not controlled by the parser.
8. For an imported English questionnaire, test one complete visible answer label and
   one displayed number. Use the release-gate repetitions in
   `docs/RC4-RELEASE-GATE.md`; a single success is not sufficient evidence. For a
   non-English questionnaire, confirm the single English
   route accepts a displayed number but does not claim multilingual label recognition.
9. Confirm arbitrary prose containing a number is not mined for that number. If the
   browser deletes a spoken negation entirely and returns only a valid value, verify
   that the exact transcript and proposal are shown, nothing is selected before the
   participant confirms, and **Try again** leaves the prior answer unchanged.

## 6. Keyboard, screen reader, colour and reflow

1. Complete all four registered instruments keyboard-only.
2. Confirm radio groups use arrows and Tab leaves the group normally.
3. Confirm selected answers remain visible after focus moves, using a checked state
   and text/check marker as well as colour.
4. Test NVDA/Edge and VoiceOver/Safari reading and focus order.
5. Test 200% zoom, 320 CSS pixel reflow and text-spacing overrides.
6. Test forced-colours mode.
7. Verify the contrast values and claim boundary in
   `docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md`.

## 7. Spoken guidance and gaze

1. Confirm spoken summaries reflect the active instrument and scale.
2. Trigger a selected answer, voice proposal, simpler help where available, restored
   session, error and completion state; verify each expected update.
3. Treat WebGazer target accuracy as Partial unless measured under an approved
   protocol. Test permission, positioning, calibration, proposal, confirmation,
   recalibration and camera stop without claiming independent eye control.

## 8. Qualtrics

Follow every normal and adverse test in
[`docs/QUALTRICS-INTEGRATION.md`](docs/QUALTRICS-INTEGRATION.md).

At minimum:

- install the complete Version 0.8 `AQP_*` package into a blank/copy survey;
- observe and export one row for each registered instrument;
- reconstruct each raw JSON record;
- close immediately after acknowledgement;
- submit while offline;
- reload midway;
- trigger a missing-answer error near the bottom of the full-viewport iframe and
  verify that its single mobile viewport reveals it;
- block/fill storage;
- force staging and native-advance failures;
- deliberately combine old and new generated HTML/JavaScript and confirm that the
  participant cannot start;
- verify the recorded-response/PDF summary;
- select Review and Publish, then verify a newly dated row rather than an older row;
- confirm the distribution bundle contains no secret and accepts only the configured
  origin.

Do not describe central collection as complete until the real UCL account contains
and exports both synthetic records.

## 9. Reproducible rendered-browser evidence

1. Run `npm run build`, then `npm run test:browser` from `source` in installed
   Chromium. The browser suite must serve `dist`, not the Vite development server.
2. Confirm all twelve pre-specified interface states were scanned and none is
   missing: introduction, missing-answer error, voice listening, voice proposal,
   voice-recognition error, ordinary item, saved-progress offer, review,
   completion, pairwise, the synthetic semantic-differential fixture and the imported
   labelled German scale.
3. Inspect every incomplete axe check; do not silently count it as a pass.
4. Confirm every state/profile combination exists at 1280, 768 and 320 CSS-pixel
   widths, Chromium CDP page-scale factor 2.0 and the corresponding 640 by 450
   reflow layout (60 scans total). Confirm no horizontal overflow above one CSS
   pixel.
5. Confirm actual Tab traversal reaches the tested control with a rendered focus
   indicator, and every measured critical target is at least 24 by 24 CSS pixels.
6. Run `npm run report:browser` and archive the axe JSON, axe HTML and Playwright HTML
   reports with the exact
   commit SHA. In GitHub Actions, use the job summary and the
   `rendered-accessibility-evidence` artifact.
7. Report the browser version, state count, violation count, incomplete count,
   overflow count and target-size failures. State explicitly that this is bounded
   automated evidence, not a WCAG conformance result or representative-user evidence.
