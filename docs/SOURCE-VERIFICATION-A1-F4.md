# Source verification: import, rendering, recovery and collection

Verified against the current TypeScript source and automated tests on 1 August
2026. Statuses distinguish behaviour that was already present from gaps closed
during this review.

## A. LimeSurvey structure

| Item | Status | Source evidence |
|---|---|---|
| A1. Array (Flexible Labels) | **ALREADY HANDLED; regression evidence added** | `parseLimeSurveyXml` and `parseLimeSurveyAnswerScale` in `source/src/platform-questionnaire-import.ts` join type `F` parent questions to ordered `subquestions`, localised row wording in `question_l10ns`, and the shared scale in `answers`/`answer_l10ns`. `source/tests/platform-questionnaire-import.test.ts` now includes a multi-row, five-column LSS regression. |
| A2. LimeSurvey document types | **ALREADY HANDLED under the user-confirmed product scope** | The parser checks `LimeSurveyDocType` before conversion and explicitly distinguishes Survey/LSS, Group/LSG and Question/LSQ. Following the explicit project direction given after the real LSG test, LSG and LSQ are supported as standalone instruments with review warnings about missing survey/group context; they are not misrepresented as complete surveys. LSA and other document types are rejected. |

The original narrow requirement would have rejected every LSG. The project owner later
explicitly requested mature LimeSurvey coverage after the real LSG test, so standalone
LSG and LSQ conversion is a documented product-scope decision rather than an inferred
supervisor requirement. LSA remains outside that scope because an archive can include
responses, tokens and participant data as well as structure.

## B. Voice-input boundary

| Item | Status | Source evidence |
|---|---|---|
| B. Imported-questionnaire voice | **CONFIRMED FIXED; MANUAL QUALITY RETEST REQUIRED** | The recorded decision retains one English route for spoken displayed numbers and visible English labels. `renderVoiceInput`, `startVoiceInput`, `configureVoiceHints` and `isEnglishLanguage` in `source/src/accessible-nasa-tlx.ts` implement that boundary with `en-GB`. Feature-detected contextual hints improve recognition in supporting browsers; ranked safe alternatives, standalone number homophones and bounded label variants reduce false rejection. Rejected transcripts are shown. Non-English label recognition is not claimed; buttons remain available. Parser and component tests remain in `source/src/voice-input.ts`, `source/tests/voice-input.test.ts` and `source/tests/platform-component.test.ts`. |

A definition-level `supports.voiceInput = false` flag was not added because it
would remove the confirmed numeric fallback from imported instruments. The UI
states the actual language and matching boundary before recognition starts.

The parser uses bounded, meaning-preserving variants rather than unrestricted fuzzy
matching: for example, `neither agree or disagree` can identify the single visible
neutral option, while a partial label or negated answer remains unselected. The first
safe browser-ranked match may be proposed, but never recorded without confirmation.
Automated parser tests cannot establish recognition quality for every
accent, microphone, speaking rate, browser or operating system; one real-microphone
English-label and English-number check remains a release gate.

## Real-world file regression evidence

Two original real-world audit files were tested locally on 1 August 2026;
their questionnaire content is not committed to the public repository. File identity
was recorded by SHA-256:

- `limesurvey_survey_578216.lss`: `a3c954a02a0193b048e6bf4590a8ae78f27fa612bd96ebd5f9668a15a01dc7d2`
- `limesurvey_group_9987.lsg`: `283292f512c954fc81e423476d6968d3351492a8652433a1fcde836c3d3bee0b`

The real LSS exposed all six source groups. After explicit group/scale selection,
every compatible route converted with zero unsupported findings: 1- and 2-item
administrative subsets, 11- and 6-item scenario subsets, 2-item 1–5 and 6-item
1–21 subsets, the 5-item Spatial Presence subset and the 4-item Realness subset.
The five-item Spatial Presence definition was rendered and completed through the
participant-result flow. The real LSG converted SP1–SP5 on its 1–7 scale and was
also rendered and completed through the same flow. This is local real-file evidence,
not a substitute for the remaining deployed-browser and UCL Qualtrics release gate.

## C. Imported matrix rendering

LimeSurvey/Qualtrics matrices are normalised to one accessible rating row per
page. This preserves row and scale semantics while avoiding a wide, fragile
HTML table on small or magnified screens.

| Item | Status | Source evidence |
|---|---|---|
| C1. N rows on a shared scale | **ALREADY HANDLED** | `renderRating` renders each normalised sub-item; `source/tests/platform-component.test.ts` completes an expanded Qualtrics matrix with three rows. |
| C2. Dynamic scale size | **ALREADY HANDLED** | `buildRatingValues` in `source/src/questionnaire-definition.ts` derives all values from the loaded definition; `renderFullRatingScale` maps that array. Tests cover 5-, 7- and 21-value scales. |
| C3. Row labelling | **ALREADY HANDLED** | Each page uses a labelled `section`, heading, question text and `fieldset`/`legend`; each option is a native radio with a row-specific `name` and accessible label. |
| C4. Keyboard movement | **ALREADY HANDLED** | Native radio grouping provides arrow-key movement within the row; Next/Previous changes rows and the common focus helper moves focus to the new heading or error summary. Component and axe tests exercise the structure. |
| C5. Long labels | **CONFIRMED FIXED** | `source/src/styles.css` now applies `min-width: 0`, `overflow-wrap: anywhere` and automatic hyphenation to imported labels and legends. `source/tests/focus-style.test.ts` protects the responsive rules. |
| C6. Dynamic progress | **ALREADY HANDLED** | `renderProgress`, `renderRating` and the spoken step summary calculate counts from `definition.items` and the loaded pair list; there is no six-item/fifteen-pair assumption. |

## D. Saved-session migration

| Item | Status | Source evidence |
|---|---|---|
| D1. Older fields | **ALREADY HANDLED; strengthened** | `normaliseStudyConfig` in `source/src/study.ts` migrates schema 3 to schema 4 with the built-in weighted NASA-TLX definition. `normaliseSavedSession` applies the same bounded default to legacy progress. |
| D2. Definition changes | **CONFIRMED FIXED** | `persistProgress` now stores the full validated `questionnaireDefinition` snapshot. `validSavedSession` requires an exact snapshot match, so a changed imported definition cannot silently reuse old answers. |
| D3. Migration tests | **ALREADY HANDLED; expanded** | `source/tests/saved-session-announcement.test.ts` tests schema 3 progress, early schema 4 built-in progress, changed-definition rejection and invalid data. `source/tests/study.test.ts` tests schema 3 configuration and completed-result migration. |
| D4. Partial versus completed | **CONFIRMED FIXED** | Partial progress is migrated in the participant component. `loadCompletedResults` in `source/src/study.ts` now separately reads the Version 0.7 completed-backup key, recomputes the weighted score, validates every field and migrates only an exact record. |
| D5. Safe failure | **CONFIRMED FIXED** | Invalid current progress is not resumed and a visible restart message is shown. Invalid legacy progress/completed backups are preserved rather than guessed, overwritten or silently converted. |

## E. Deployment synchronisation

| Item | Status | Source evidence |
|---|---|---|
| E1. Complete Pages tree | **ALREADY HANDLED** | `.github/workflows/verify.yml` verifies the release build, then uses `git read-tree --reset -u` with the verified main SHA to replace the complete `gh-pages` tree. |
| E2. Live build identity | **DEPLOYMENT GATE** | `BUILD-INFO.json`, generated entry points and production assets must be committed together. After merge, the workflow must finish and the live `BUILD-INFO.json` must match the merged revision before a release tag is created. |
| E3. Embedded Data manifest | **ALREADY HANDLED; evidence strengthened** | The generated bridge and `docs/QUALTRICS-INTEGRATION.md` share the current prefixed manifest. `source/tests/result-sink.test.ts` now requires exact equality between every generated `setEmbeddedData` field (including all raw chunks) and every documented `__js_` field. |

## F. Regression checks

| Item | Status | Source evidence |
|---|---|---|
| F1. Qualtrics hand-off | **ALREADY HANDLED** | `createQualtricsParentResultSink` and `submitToApprovedResultSink` in `source/src/result-sink.ts` require exact origin, build and submission-ID receipts. The parent bridge stages data, returns that receipt, then attempts native Qualtrics navigation after 800 ms. It does not announce durable server acceptance before navigation succeeds. |
| F2. Ambiguous NASA voice | **CONFIRMED FIXED AND STRENGTHENED** | `source/src/voice-input.ts` rejects explicit negation, common `not` homophones (`note`, `knot`, `naught`, `nought`), exclusion/correction language and off-scale values. Unsafe unresolved meaning in any ranked alternative rejects the entire recognition result, regardless of order. Otherwise the first browser-ranked safe visible-answer match may be proposed and must be confirmed. Numeric input is accepted only as a complete bounded answer or an explicit supported landmark expression; arbitrary prose is not mined for a number. Tests cover both `4`/`Note 4` rank orders. |
| F3. Voice confirmation | **CONFIRMED FIXED AND STRENGTHENED** | A recognised proposal is written to a polite live status, optionally spoken only when prior automatic-audio consent is active, then focus moves to the confirmation button. The visible confirmation now says to compare the recognised transcript and proposal because a speech service can omit a word. Selection occurs only after explicit confirmation. |
| F4. Non-text contrast | **ALREADY HANDLED** | `source/src/styles.css` uses `#0b0c0c` for the 3 px inner focus outline and `#ffdd00` for the outer halo. `source/tests/focus-style.test.ts` and `docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md` record ratios above 3:1 on all tested answer surfaces. |

## Verification command

```text
cd source
npm ci
npm test
npm run build:release
```

Current local result: 18 test files and 189 tests passed, including 12 axe
structural scans; TypeScript, production, standalone and release synchronisation
builds passed.
