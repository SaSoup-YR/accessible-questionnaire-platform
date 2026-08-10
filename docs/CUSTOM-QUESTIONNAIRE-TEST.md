# No-code custom-questionnaire verification

This procedure checks whether a researcher-supplied questionnaire can be created,
reproduced, scored and collected without editing source code. Use only synthetic
participant codes and answers during verification.

A successful run is evidence of the implemented workflow. It does not by itself
show that the questionnaire is valid, that the workflow is easy for a novice, or
that the interface improves accessibility.

## Fixed test definition

Open the versioned
[`study.html?package=0.8.8-q8`](https://sasoup-yr.github.io/accessible-questionnaire-platform/study.html?package=0.8.8-q8)
page, select **Add your own questionnaire**, and enter the following values.

| Field | Test value |
| --- | --- |
| Questionnaire name | Task Support Check |
| Short name | TSC |
| Questionnaire version | 1.0.0 |
| Source or authorship label | Researcher-authored technical test |
| Source URL | Leave blank |
| Description | A synthetic questionnaire used to verify the custom questionnaire workflow. |
| Participant instruction | Think about the task you have just completed and answer all three items. |
| Scale type | Agreement |
| Score calculation | Mean of item values |
| Minimum response value | 1 |
| Maximum response value | 5 |
| Response step | 1 |
| Score name | Task support score |

Keep the first two item editors and select **Add another item** once. Enter:

| Item | Item label | Question or statement | Low endpoint | High endpoint | Simpler explanation | Reverse |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Clarity | The task instructions were clear. | Strongly disagree | Strongly agree | How clear were the instructions? | No |
| 2 | Control | I felt in control while completing the task. | Strongly disagree | Strongly agree | How much control did you feel? | No |
| 3 | Difficulty | The task was difficult to complete. | Strongly disagree | Strongly agree | How difficult was the task? | Yes |

Select **Validate and use this questionnaire**.

Required result:

- the page immediately moves to the selected-questionnaire summary;
- the summary has a visible green confirmation with a check mark and the words
  **Questionnaire ready**; colour is not the only success cue;
- keyboard focus is on that summary, so a keyboard or screen-reader user receives
  the same confirmation;
- the confirmation says that `Task Support Check 1.0.0` was validated and selected;
- the questionnaire selector shows it as researcher supplied;
- the summary reports 3 items, 5 agreement response values, 0 comparisons and
  `Task support score`;
- **Download current questionnaire definition** becomes available.

If validation fails, do not continue. Correct the named field and validate again.

## Local end-to-end test

1. Download the current questionnaire definition JSON.
2. Enter these study values:
   - Study ID: `CUSTOM-TEST-01`
   - Study title: `Custom questionnaire technical test`
   - Task label: `completing a short practice task`
3. Select **This browser only**.
4. Leave the standard response presentation available. Enable score display for
   this synthetic test so the expected result can be checked.
5. Select **Generate link**.
6. Download the configuration JSON.
7. Select **Open participant page**.
8. Enter participant code `TEST-CUSTOM-001`.
9. Start the questionnaire and answer:
   - Clarity: `5`
   - Control: `3`
   - Difficulty: `2`
10. Review and submit.

The third item is reverse-scored:

`1 + 5 - 2 = 4`

The expected mean is:

`(5 + 3 + 4) / 3 = 4.00`

Required result:

- the review page retains the raw answers `5`, `3` and `2`;
- the final primary score is `4.00`;
- the JSON result contains `instrument.id = "custom-tsc"`;
- `instrument.definition` contains the complete three-item definition;
- `result.details.adjustedRatings` contains `5`, `3` and `4`;
- `result.details.reversedItemIds` contains only `item-03`;
- the CSV contains `primary_score = 4`, `embedded_definition = 1`, the three
  raw ratings and the complete `questionnaire_definition_json`;
- after returning to and reloading the conductor page, one local result is
  available for export.

## Definition and configuration reproduction

This check establishes that another browser can reproduce the study without
retyping the questionnaire.

1. Open the versioned conductor page in a new private browser window.
2. Open **Add your own questionnaire**.
3. Under **2. Reuse an AQP questionnaire definition**, choose the definition
   file downloaded above. Do not use the separate QSF/LSS/LSG/LSQ source-export input.
4. Confirm that the page moves to the visible **Questionnaire ready** summary and
   that Task Support Check is selected with the same three items, 1–5 scale and
   mean rule.
5. Separately select **Import configuration JSON** and choose the downloaded
   configuration.
6. Confirm that the page moves to the visibly highlighted **Configuration ready**
   panel and that the same Study ID, task label, configuration ID and participant
   link are restored.

Keep both JSON files as test evidence. The definition proves the questionnaire
content and scoring rule; the configuration proves the exact study settings.

## UCL Qualtrics collection test

Use a blank or copied synthetic survey, not a live recruitment survey.

1. In the conductor page, select **UCL Qualtrics central collection**.
2. Paste the exact UCL Qualtrics preview or survey URL.
3. Generate a new configuration.
4. In Qualtrics, replace all three required installation inputs together:
   - Complete generated question HTML in one Text/Graphic question;
   - every generated Embedded Data field, including the `__js_` prefix, near the
     beginning of Survey Flow;
   - complete generated JavaScript in the same question's JavaScript editor.
5. Save, Preview, then **Review and Publish**.
6. Open the active distribution link in another browser or device.
7. Use participant code `TEST-CUSTOM-Q-001` and answers `5`, `3`, `2`.
8. In **Data & Analysis**, inspect the newly dated row, not an older row.
9. If the study uses the documented pseudonymous-code route, enable
   **Anonymize responses** before this run and confirm that the exported row has
   blank IP address and location fields. An anonymous link alone still records
   these fields by default.

Required fields:

| Qualtrics field | Expected value |
| --- | --- |
| `__js_AQP_ACCEPTED` | `1` |
| `__js_AQP_SCHEMA` | `4` |
| `__js_AQP_INSTRUMENT_ID` | `custom-tsc` |
| `__js_AQP_SCORING_STRATEGY` | `mean-v1` |
| `__js_AQP_SCORE_NAME` | `Task support score` |
| `__js_AQP_PRIMARY_SCORE` | `4.00` |
| `__js_AQP_RATINGS_JSON` | item 01 = 5, item 02 = 3, item 03 = 2 |
| `__js_AQP_SCORE_DETAILS_JSON` | item 03 adjusted to 4 and listed as reversed |
| `__js_AQP_RAW_CHUNK_COUNT` | a positive whole number |

Export the Qualtrics row as CSV. Reconstructing the raw chunks should show the
same full definition, answers and result. A rendered iframe alone is not a pass;
the newly submitted row and export are the collection evidence.

## Deliberate rejection checks

Run these one at a time, then restore the valid test definition.

| Change | Required outcome |
| --- | --- |
| Leave one item question blank | Validation stops and identifies the missing question |
| Minimum `1`, maximum `6`, step `2` | Validation rejects a range that cannot divide exactly |
| Enter an `http://` source URL | Validation requires an HTTPS source |
| Try to add more than 20 items | The add control is unavailable at 20 |
| Import JSON containing an unknown executable field such as `"execute"` | Import fails as an unsupported field |
| Disconnect before a Qualtrics submission | No accepted remote result is claimed; recovery and backup remain available |

Record the exact observed message for every rejection. A silent correction or a
calculated score from invalid input is a failure.

## Evidence record

For each run, retain:

- date and tester;
- browser, device and operating system;
- Git commit or release tag;
- bridge build shown on the conductor page;
- definition JSON and configuration JSON;
- expected and observed score;
- local JSON/CSV or the newly dated Qualtrics CSV row;
- Pass, Partial or Fail;
- issue number and re-test result for any failure.

## Release-candidate gate

Create a new release candidate only after:

1. automated tests and `npm run build:release` pass;
2. the fixed local test produces `4.00`;
3. definition and configuration imports reproduce the study;
4. a newly dated Qualtrics row passes the field checks;
5. the deliberate rejection checks fail safely;
6. GitHub Pages serves the same assets as the tested commit;
7. successful questionnaire validation and both JSON imports move focus to a
   visible, textual success confirmation;
8. the intended Qualtrics anonymisation setting is published and verified in a
   newly exported row;
9. no known blocking issue remains.

Choose the next unused release-candidate number after the latest published tag.
A published tag is immutable evidence: do not move or overwrite it. If a defect
is found after publication, correct it, repeat proportionate verification and
create another candidate.

To create the candidate in the GitHub interface:

1. merge the verified changes into `main`;
2. open **Releases** and select **Draft a new release**;
3. select **Choose a tag**, enter the next unused candidate tag, and create it
   from the exact verified `main` commit;
4. use release title `Accessible Questionnaire Platform <candidate tag>`;
5. mark it as a **pre-release**;
6. list the tested commit, bridge build, checks passed, known limits and exact
   conductor URL in the notes;
7. publish the release;
8. open the tag and confirm its commit is the same commit that produced the
   retained evidence.
