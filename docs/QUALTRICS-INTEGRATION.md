# UCL Qualtrics central-collection integration

Prototype: Accessible Questionnaire Platform Version 0.8

## Purpose and boundary

The participant answers the configured questionnaire inside one Qualtrics
Text/Graphic question. On submission, the GitHub Pages child sends one complete
pseudonymous Version 4 record to the exact configured Qualtrics origin. The parent
question validates and stages generic `AQP_*` Embedded Data, acknowledges the same
submission ID, then invokes Qualtrics native navigation. The researcher receives the
record through Qualtrics Data & Analysis.

The bridge supports every validated Version 0.8 definition, including the bounded
researcher-supplied profile, because it stores instrument identity, generic
item/pair responses, scoring metadata and the lossless raw record. A custom raw
record also contains its complete definition snapshot. The bridge does not
hard-code NASA dimension fields.

No token, password or database credential is placed in GitHub, the participant URL
or browser storage. A raw GitHub participant link cannot collect centrally.
Participants must receive the activated Qualtrics distribution link.

Use the integration only within the project's existing approved protocol,
participant-information, consent, retention and information-governance plan. The
supplied participant code is pseudonymous. That does not make the whole Qualtrics
response anonymous: an anonymous distribution link records IP address and
approximate location by default. If those fields are not required by the approved
study, enable **Anonymize responses** in Survey Options before the synthetic test.
The setting applies to future responses and is not retroactive. Confirm the actual
export rather than relying on the link name. Do not add names, email addresses,
diagnoses or highly confidential linked fields without the required UCL
information-governance review. Freeze the exact prototype, configuration and
survey before participant recruitment.

## Installation inputs

The first three files are required copy-and-paste inputs, not files to upload.
The final-page message is optional plain text:

| Content | Status | Qualtrics location |
| --- | --- | --- |
| Complete generated question HTML | Required | One Text/Graphic question in HTML/source view |
| `embedded-data-fields.txt` | Required | Embedded Data element near the beginning of Survey Flow; one line per unset field |
| `qualtrics-question.js` | Required | JavaScript editor for the same Text/Graphic question, without `script` tags |
| Generated End of Survey message | Optional | Custom End of Survey message as ordinary text; never paste it into HTML or JavaScript |

`study.html` generates the three required blocks and the optional final-message
block for the chosen instrument and configuration. Use those blocks rather than
uploading repository files.

## One-time setup

1. Create a blank UCL Qualtrics survey.
2. Add the participant information and consent pages covered by the study protocol.
3. In **Survey Options → Security**, decide whether **Anonymize responses** must
   be enabled. For the documented pseudonymous-code workflow, enable it unless
   the approved protocol explicitly requires IP or location metadata. Publish the
   setting before collecting the verification row.
4. Put one Text/Graphic question on its own page.
5. Open the versioned
   [`study.html?package=0.8.10-q10`](https://sasoup-yr.github.io/accessible-questionnaire-platform/study.html?package=0.8.10-q10)
   entry point, choose the questionnaire, select UCL Qualtrics collection,
   paste the preview or active survey URL and complete the study fields.
6. Generate the configuration.
7. Open the Text/Graphic question's HTML/source view. Replace the whole body with
   Complete question HTML from the generated package. The static template is not
   usable unchanged because it contains a participant-URL placeholder.
8. Add an Embedded Data element before the questionnaire block. Declare every line
   of `embedded-data-fields.txt`, including `__js_`, and leave the values unset.
9. Replace the question's JavaScript with `qualtrics-question.js`.
10. Optional: configure the generated End of Survey message as ordinary text.
   Qualtrics' default final page is acceptable and this message does not affect
   collection. Do not add HTML, JavaScript or a redirect. Use the generated
   message if the participant's score must remain visible after submission.
11. Save and Preview. After the synthetic checks pass, select **Review and
    Publish**. Draft changes do not update an already active distribution link.

The conductor heading and its Current Qualtrics generator notice must both show
`0.8.10-q10`. If generated JavaScript shows an earlier value, close that stale tab and
reopen the versioned link above. Do not paste assets from the stale tab.

The JavaScript uses `setJSEmbeddedData` with names that omit `__js_`; Qualtrics maps
them to the prefixed Survey Flow fields. Do not remove the prefix in Survey Flow.
If custom HTML or JavaScript is unavailable in the UCL tenant, ask the administrator
instead of moving secrets into client code.

## What the editor and Preview should show

The editing canvas may display tokens such as
`${e://Field/__js_AQP_PARTICIPANT_CODE}` literally. That is expected because no
response exists in the editor.

In Preview before submission:

- the recorded-response summary is hidden;
- the iframe remains hidden until the exact-origin child handshake succeeds, then
  the configured participant page becomes visible;
- the status changes from `Connecting the questionnaire` to `The questionnaire is
  connected`, names bridge `0.8.10-q10` and says the diagnostic fields were staged;
- the participant application fills the browser viewport and exposes one visible
  vertical scrollbar at the browser edge. The surrounding Qualtrics page does not
  create a second scrolling region.

If the raw summary is visible, repeat the HTML/source-view step. If the iframe is
blank, regenerate the complete HTML and confirm that the placeholder is absent.
If the connection status does not change, do not continue a real response. Replace
both the complete generated HTML and the generated JavaScript from the same
configuration. The bridge restores native navigation after eight seconds so a
misconfigured synthetic run cannot trap the tester.

The connection message establishes a same-origin bridge and a successful
in-browser write request. It is not proof of a durable server row. Only a newly
completed synthetic response whose newly dated Data & Analysis row contains
`__js_AQP_ACCEPTED = 1`, schema 4 and the expected instrument ID passes collection
preflight. Older rows are not backfilled.

Bridge diagnostics use `__js_AQP_BRIDGE_READY = 1` and
`__js_AQP_BRIDGE_BUILD = 0.8.10-q10`. `__js_AQP_ACCEPTED` is left unset until a
complete result has passed validation. This keeps a connection diagnostic separate
from an accepted response and prevents a failed or abandoned run from being labelled
as `AQP_ACCEPTED = 0`. Rows created with older bridge packages keep their original
values and must be interpreted using that package's documentation.

Qualtrics invokes question JavaScript in `addOnReady`, after the page is displayed.
The child iframe can therefore finish its first render before the parent message
listener exists. Bridge `0.8.10-q10` uses a two-way ready handshake with an exact
package fingerprint and bounded parent retries. It moves the live wrapper to the
document body, fixes it to the visual viewport, disables outer-page scrolling and
lets the participant document own the single scrollbar. It no longer depends on
measuring and copying a changing child height through Qualtrics theme wrappers.
During post-staging failed-advance recovery, q10 restores the outer page styles but
keeps the already-running participant iframe in its current DOM parent so that the
participant completion/recovery state is not intentionally discarded by re-parenting.
Full DOM restoration remains in the setup, connection, staging-failure and unload
paths. This is an implementation mechanism; A27 remains a manual route finding until
the frozen assistive-technology retest is completed.

## Handoff and data-loss protection

`setJSEmbeddedData` stages values in the current browser survey session; it does not
make them durable until the Qualtrics page is submitted. The receipt sent to the
participant iframe confirms this staging step, not a server-side record. Version
0.8 therefore:

1. creates a complete local backup before contacting the parent;
2. establishes a two-way parent/child readiness handshake;
3. sends the result only to the configured HTTPS origin;
4. requires a receipt with the same submission ID;
5. keeps JSON and CSV emergency buttons available;
6. starts native Qualtrics advancement after an 0.8-second technical handoff;
7. reports a definite browser-offline state immediately after that handoff and
   makes one native Qualtrics advance attempt so its network-error dialog appears
   without a second participant action;
8. restores native navigation after a missing connection, staging error or a
   failed-advance watchdog;
9. requires the generated HTML, parent JavaScript and child application to report
   the same bridge fingerprint before enabling participation or accepting a record.

The 0.8 seconds is not participant reading time. Increasing it enlarges the window
in which a participant can close the tab after seeing an acknowledgement but before
Qualtrics has submitted the page. Durable completion information belongs on the End
of Survey page, which remains visible.

During a normal handoff, the page displays a short `Submitting response` status and
advances automatically. Built-in spoken guidance does not read a second transition
message because that speech would add load and may be interrupted by navigation. If
native advancement fails, the parent sends a failure message to the participant
iframe. The visible alert and, when previously enabled, built-in spoken guidance
state that recording is unconfirmed and direct the participant to reconnect, keep
or download one backup and use the restored Qualtrics Next button. A local backup
is a recovery route, not evidence of a Qualtrics row.

The conductor generates optional End of Survey text from the score-display policy.
It includes the instrument and score only when the conductor selected Show score to
participant. The repository text file contains a placeholder and is not a
ready-to-paste substitute for that generated block. Omitting this optional text does
not affect response storage; use the Qualtrics default final page instead.

## Generic fields

The normalized fields include:

- bridge-ready state and the exact bridge build;
- submission, study, participant, timing and prototype identifiers;
- instrument ID, name, version and scoring strategy;
- the complete definition snapshot inside the raw record when the questionnaire is researcher supplied;
- score name, primary score and defined range;
- item and pair responses;
- configured/final support, support changes and input routes;
- raw JSON chunk count and 24 bounded chunks.

The normalized primary score is stored to two decimals for display and export. The
raw chunks retain the lossless record. Reconstruct it by concatenating
`__js_AQP_RAW_01` through the count in `__js_AQP_RAW_CHUNK_COUNT`.

`AQP_RAW_01` through `AQP_RAW_24` are bounded storage chunks, not 24 questionnaire
answers. They preserve one complete JSON record when a single Qualtrics field is too
short. Keep them in Survey Flow, but hide them from the ordinary Data Table view
with Column chooser if they make manual inspection difficult.

The no-code builder limits a custom definition to 20 items and 9,000 UTF-8 bytes
so the complete record can remain inside this allocation. Before recruitment,
complete the longest planned custom questionnaire in the actual UCL survey and
confirm that the resulting row has `AQP_ACCEPTED = 1` and reconstructable raw
chunks.

The recorded-response/PDF view replaces the fresh iframe with a read-only generic
summary whenever `__js_AQP_ACCEPTED = 1`. The raw JSON and CSV export remain the
authoritative record.

## Mandatory synthetic verification

Use non-participant codes such as `TEST-NASA-001` and `TEST-SUS-001`.

### Normal paths

1. Complete a weighted NASA-TLX response through a Qualtrics Preview or anonymous
   distribution link on another browser/device.
2. Confirm automatic advancement and the Qualtrics final page. The default final
   page is sufficient unless the protocol requires the generated custom message or
   a persistent participant score.
3. In Data & Analysis verify:
   - `__js_AQP_ACCEPTED = 1`;
   - matching submission ID;
   - instrument ID `nasa-tlx-weighted`;
   - six ratings, fifteen pair choices and the weighted score;
   - support configuration, final state and input routes;
   - a reconstructable raw record.
   - if **Anonymize responses** is enabled, IP address, latitude, longitude and
     contact fields are blank in the newly exported row.
4. Repeat with SUS and verify:
   - instrument ID `system-usability-scale`;
   - ten 1–5 ratings;
   - empty pair responses;
   - the expected alternating SUS score.
5. Repeat with Raw TLX. Confirm its instrument ID, empty pair data and expected
   unweighted score details. UEQ-S is not present in this public candidate because
   redistribution permission has not been established.
6. Open View Response and an individual PDF. Confirm that the blank interactive
   iframe is replaced by the saved instrument, score and response summary.

### Adverse paths

7. Close immediately after the in-frame acknowledgement. Reopen the same configured
   link on the same device, enter the same synthetic code and confirm that the
   completed local backup is discoverable. Check Data & Analysis separately.
8. Disconnect the network at submission. When the browser reports that it is
   offline, confirm that the result page changes to a focused failure alert after
   the 0.8-second handoff, without waiting for Qualtrics' network-error dialog.
   The Qualtrics Next button must be restored and a backup must remain available.
   Reconnect, select Next and verify the newly dated row separately. Repeat once
   with a blocked server while the browser still reports online; the six-second
   watchdog must provide the same recovery route. On a phone and tablet, confirm
   that the single participant viewport reveals the error rather than leaving it
   above the visible area.
9. Reload midway through a recovery-enabled questionnaire. Confirm that the saved
   session restores the exact next step after the pseudonymous code is re-entered.
   The Resume control must receive focus and expose the saved count and Resume/Erase
   choice to a screen reader. If automatic audio was previously enabled, confirm
   the attempted spoken message and the user-activated replay fallback.
10. Block or fill site storage. Confirm that submission does not crash, backup
    buttons remain available and the page does not claim a stored local copy.
11. Stage an invalid or oversized synthetic record. Confirm that Qualtrics navigation
    is restored and the record is not falsely acknowledged.
12. In a copied synthetic survey, block native advancement. Confirm that the
    six-second watchdog reports failure and restores Next. For the q10 A27 retest,
    also confirm that the participant remains on the completed recovery state rather
    than returning to `Before you begin`; the participant-side failure alert is the
    focused recovery target on screen-reader routes; JSON/CSV backup controls remain
    present; and the restored native Next control is visible, keyboard-focusable and
    operable. On the OS voice-control route, record whether Next can be exposed and
    activated through the platform's target-discovery commands. Record the actual
    route outcome rather than inferring Pass from the browser-automation checks.
13. Test voice input with `not low`, `low or high`, `twenty three`, `73` and two
    factor names. None may become a proposal. Test one consistent lower-ranked
    alternative and confirm that it remains an explicit proposal rather than an
    automatic answer. In SUS, confirm that the exact official endpoint labels
    `Strongly disagree` and `Strongly agree` propose 1 and 5, while `Agree` and
    `Neutral` are not inferred. With the original synthetic semantic-differential
    fixture, confirm that each complete visible endpoint is accepted, a phrase naming
    both endpoints is rejected, and confirmation is still required.
14. Delete synthetic rows and local backups if the approved plan requires a clean
    dataset.

Record the survey ID, distribution URL, frozen Git commit, configuration JSON, date,
browser/device and exported rows in the study log.

After any installation change, publish it and create a newly dated synthetic
response. Rows recorded before the `AQP_*` package was installed are expected to
remain blank in the new columns; they are not evidence that the new package failed.

## Migration warning

Version 0.7 used `__js_ANTLX_*` fields and a Version 3 result. A Version 0.7
Qualtrics question must be replaced with the three required Version 0.8 inputs.
The change is not retroactive: old responses remain in their `__js_ANTLX_*` columns,
and the new `__js_AQP_*` columns are expected to be blank for those rows. Do not
delete the old fields until the Version 0.7 rows have been exported and verified.
See `MIGRATION-V0.7-V0.8.md`.

## Participant preference policy

Prepared defaults with optional participant choice remains appropriate for a
formative accessibility evaluation:

- the conductor provides a usable starting configuration;
- the participant is not required to configure the instrument;
- permitted adjustments and their timestamps are recorded separately;
- adjustments never enter the instrument's scoring function.

Use Prepared settings only for a controlled measurement comparison when changing
presentation would introduce an uncontrolled condition. The protocol must choose
and justify one policy before recruitment.

## Claim boundary

Passing these checks shows that the software can collect complete cross-device
records. It does not show that the workflow is easier, that an accessibility support
improves outcomes, or that modified presentation is psychometrically equivalent.
Those require an approved evaluation and pre-specified outcomes.

## Platform sources

- [UCL Research Information Governance FAQs](https://www.ucl.ac.uk/advanced-research-computing/platforms-services/information-governance-advisory-service/research-information-governance-faqs)
- [UCL forms and survey tools accessibility guidance](https://www.ucl.ac.uk/isd/services/digital-accessibility-services/creating-accessible-content/forms-and-survey-tools)
- [Qualtrics: Add JavaScript](https://www.qualtrics.com/support/survey-platform/survey-module/question-options/add-javascript/)
- [Qualtrics: Embedded Data](https://www.qualtrics.com/support/survey-platform/survey-module/survey-flow/standard-elements/embedded-data/)
- [Qualtrics: End of Survey](https://www.qualtrics.com/support/survey-platform/survey-module/survey-flow/standard-elements/end-of-survey-element/)
- [Qualtrics: Export response data](https://www.qualtrics.com/support/survey-platform/data-and-analysis-module/data/download-data/export-data-overview/)
- [Qualtrics: Recorded responses](https://www.qualtrics.com/support/survey-platform/data-and-analysis-module/data/recorded-responses/)
