# Release-candidate verification gate

This gate separates branch review, temporary preview testing, public deployment and
the immutable release tag. Use synthetic participant codes only.

## Required order

1. Push the candidate to a non-default branch and open a **Draft** pull request.
   Pull-request verification runs, but the public GitHub Pages site is unchanged.
2. Run a temporary HTTPS preview when one is available. Keep it private for local
   import checks; expose it only for a short synthetic Qualtrics iframe test.
3. Complete the real-file, microphone and Qualtrics checks below before merge when
   the preview supports them. Record browser, operating system, candidate commit,
   expected result and observed result.
4. If a browser-service failure can only be re-tested on the stable Pages origin, a
   green automated build plus focused branch review may approve merge solely to deploy
   an **untagged candidate**. Record every outstanding manual check explicitly; merge
   must not be described as a passed release gate.
5. A verified push to `main` synchronises `gh-pages`. Compare the live
   `BUILD-INFO.json` with the merged commit, then complete the outstanding public-page,
   microphone, real-file and Qualtrics smoke checks. A failure requires a follow-up fix
   before any release tag.
6. Create the immutable release-candidate tag only after every manual and automated
   gate passes.

## Recorded rc.4 result — 1 August 2026

The implementation candidate was public commit
`31ba69d918c2f8b7d21a0dde5c697fb93ef99f7a`, synchronized to `gh-pages` before
the release-record commit. Verification was deliberately bounded to the changed
and safety-critical paths:

- 18 test files and 181 tests passed, including 12 representative axe structural
  scans, voice negation/alternative-order tests, contextual-hint runtime fallback,
  stale recognition events and the single-retry boundary;
- TypeScript, production, standalone and synchronized release builds passed, and
  the production dependency audit reported zero vulnerabilities;
- the public conductor, participant, missing-answer and same-device recovery smoke
  paths passed with synthetic data;
- the primary tester reported the post-fix voice route working. Supplied screen
  evidence shows `Not 4`, `Agree quickly` and `Strongly` leaving the answer
  unselected, while intentional `4` produced the correct visible proposal and
  still required explicit confirmation;
- disconnected submission showed the connection/retry state rather than a false
  receipt; reconnect/retry and refresh recovery then operated normally;
- the supervisor-supplied German LSG imported and ran without an import or
  participant-flow error. German spoken labels are not claimed: the route remains
  `en-GB`, with English displayed numbers for every questionnaire and English
  labels only for English questionnaires; and
- the `0.8.7-q7` Qualtrics bridge and result schema are unchanged from the recorded
  accepted-row baseline. The current candidate repeated the changed-risk adverse
  path rather than treating external speech-service accuracy as deterministic.

Decision: the reviewed release-record commit may receive the immutable
`v0.8.0-rc.4` tag. This records a technical release candidate only; it is not a
claim of full WCAG conformance, psychometric equivalence, multilingual spoken-label
recognition or authorization to recruit.

## Real-file preview check

1. Open the candidate `study.html` preview.
2. Import the real LSS. Confirm that all six source groups are listed before any
   conversion. Select one 5-item group and confirm wording, order, visible labels and
   numeric values against the source.
3. Import the real LSG separately. Confirm that it is identified as a standalone group,
   not a complete survey, and that the missing survey context is disclosed.
4. Convert both, generate participant links, complete every item and download the result.
5. Fail the gate for any silent omission, different order/value, wrong score, blank page
   or generic parse error.

## Real-microphone protocol

Use current Chrome or Edge on HTTPS. Voice input is optional and uses the browser's
speech service; audio is not stored.

Use an imported English questionnaire that visibly contains `Agree` and
`Strongly agree`. Test with the primary tester and, where practical, one additional
technical tester with a different speaking style. This is product QA, not a study
measure: do not record identity, demographics or audio.

For each tester:

1. Say the short command `number four` three times, then say the bare word `four`
   three times. At least two attempts in each set must propose the correct value;
   harmless standalone transcriptions such as `for` or `fore` may propose 4, but no
   proposal may become an answer before confirmation.
2. Say `Agree` three times and `Strongly agree` three times. At least two attempts for
   each must propose the matching visible label, and the two labels must never be
   conflated by the platform parser.
3. Say `not four`, `agree quickly` and `strongly`. If the browser transcript contains
   `not four`, `note 4`, `knot four`, `naught four` or `nought four`, no proposal may be
   produced. Repeat this check with the alternatives in both rank orders in the automated
   suite (`4` first and the unsafe phrase second, then the reverse).
4. A speech service may occasionally delete the negation and return only `4`. Client code
   cannot infer a word that is absent. In that case verify that `I heard: 4` and the proposed
   answer are both visible and announced, that the answer remains unselected, and that only
   explicit confirmation can record it. Select **Try again** rather than confirming.
5. Say `4` intentionally and verify that the same confirmation step succeeds. Confirm that
   visible answer buttons still work before and after rejected speech.
6. On one deliberately unrecognised phrase, verify that the interface displays what
   the browser heard and offers another try without changing the selected answer.
7. Record the browser/version, recognition transcript, proposal, confirmation behaviour
   and fallback. If contextual speech hints are supported by that browser, the code supplies
   the current visible numbers and labels automatically; no separate tester action is needed.
   If the service rejects those hints, verify that listening restarts automatically without
   displaying `phrases-not-supported`, then completes the normal proposal/confirmation route.

Recognition quality still depends partly on the browser service, but repeated failure of
the stated two-of-three success threshold in the supported test browser is a release blocker.
Automatic selection, hidden accepted/rejected transcripts, missing confirmation or degraded
button input is also a release blocker.

## UCL Qualtrics protocol

Use a duplicate technical-test survey, not the live study survey. Install the complete
HTML, Embedded Data manifest and JavaScript generated by the same candidate preview.

### Normal submission

1. Publish the duplicate survey and use its anonymous distribution `/jfe/form/` link.
2. Submit known answers with code `RC4-ONLINE-01`.
3. In Data & Analysis verify `__js_AQP_ACCEPTED = 1`, schema 4, the expected instrument
   ID, answers and score. Verify there is one row for the code.

### Interrupted submission and recovery

1. Start a fresh response with code `RC4-OFFLINE-01`.
2. Disconnect the network before selecting **Calculate and submit responses**.
3. Confirm that the page does not claim that Qualtrics recorded the response, a local
   backup/recovery message is visible, and the Qualtrics connection warning appears
   without first selecting Next.
4. Close and reopen only after the backup state is visible; verify the same-device
   recovery notice. Reconnect and retry according to the visible instructions.
5. Only the successfully retried response may contain `__js_AQP_ACCEPTED = 1`.

An immediate close before browser code runs cannot guarantee delivery. The release claim
is therefore bounded to receipt-confirmed submission plus visible local recovery; it must
not claim lossless delivery after arbitrary tab termination.

## File-format boundary

- QSF is the supported Qualtrics survey-structure input.
- LSS, LSG and LSQ are the currently supported LimeSurvey structure scopes, with
  explicit context warnings for LSG and LSQ.
- LSA remains deliberately rejected because an archive may include responses, tokens
  and participant data. The error directs the researcher to export structure as LSS.
- LSL, response-data, printable, spreadsheet and generic document formats are not
  questionnaire-definition inputs.

LSA parsing is out of scope for this prototype. It must not be added without a separate
security, privacy and data-migration review; release communication should state this
boundary directly rather than invite researchers to upload an archive.

## Regression-fixture method

Private real-world files are not committed. Their structural failure modes are represented
by sanitised permanent fixtures and tests: multi-row Flexible Labels arrays with shared
scales, group exports without a survey table, single-question exports, multiple survey
groups, mixed rating sets, localisation tables and unsafe/unsupported content. This keeps
the regression reproducible without publishing original questionnaire wording.
