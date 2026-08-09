# Accessible Questionnaire Platform

A public research prototype that separates questionnaire definitions from a shared
study-conductor, participant, accessibility-support, result and UCL Qualtrics
workflow.

- **[Prepare a study](https://sasoup-yr.github.io/accessible-questionnaire-platform/study.html?package=0.8.8-q8)**
- **[Open the participant technical demonstration](https://sasoup-yr.github.io/accessible-questionnaire-platform/)**

Use synthetic codes during technical verification. Before real recruitment,
freeze the exact release, configuration and Qualtrics survey; complete the
cross-device preflight; and confirm that the final procedure is covered by the
project's existing approved protocol and data-management plan.

## Release status

The last reviewed release-record commit is the immutable **`v0.8.0-rc.4`**
baseline. The current source is an untagged correction candidate paired with
Qualtrics bridge **`0.8.8-q8`**. It is not a release evidence point until its
real-browser checks and a fresh synthetic Qualtrics row pass. The earlier
**`v0.8.0-rc.3`** and **`v0.8.0-rc.2`** tags remain unchanged evidence
baselines.

The immutable **`v0.8.0-rc.4`** baseline contains the prepared import and
participant workflow. The current source is a post-`rc.4` researcher-wizard
candidate: ready-made/saved questionnaires use six short screens and a
Qualtrics/LimeSurvey import uses ten short screens with separate question,
value, warning and scoring review. It adds same-tab draft recovery, browser
step history, per-item review correction and a definition fingerprint in the
configuration and result record. See
[`docs/RESEARCHER-WIZARD.md`](docs/RESEARCHER-WIZARD.md).

The `rc.4` baseline added `.lsg`
question-group and `.lsq` single-question imports, explicit selection when an
`.lss` survey contains several groups and source-language metadata for correct
page semantics. Voice input has one deliberately bounded English route: every
supported questionnaire accepts a displayed number spoken in English, while an
English questionnaire also accepts one complete visible English answer label,
with a small allowlist of meaning-preserving speech-service variants.

Verification on the post-`rc.4` wizard candidate:

- a clean lock-file installation completed;
- 19 unit/component/technical-evaluation test files passed, containing 194 passing tests;
- 12 representative axe structural accessibility scans passed;
- the independent-oracle round trip checked 9 built-in/import cases, 39 items and
  288 fields with 0 mismatches;
- the 12-row adversarial battery recorded 0 silently altered inputs, and 9/9
  result exports reconstructed 39/39 item responses with 0 mismatches;
- TypeScript, production, standalone and synchronized release builds passed;
- the attached real six-group LimeSurvey LSS exposed all six groups, produced a
  safe conversion for every compatible group/scale selection, and completed the
  five-item Spatial Presence group through the participant-result flow;
- the matching real LimeSurvey LSG converted the same SP1–SP5 items and 1–7
  response scale with no unsupported content; and
- a sanitised LimeSurvey LSQ converted one required rating question while
  explicitly warning that its former survey and group context is unavailable;
- an imported English questionnaire accepted a displayed number, common standalone
  number homophones and a complete visible English label through one `en-GB` voice
  control; supported browsers also receive the current visible answers as contextual
  recognition hints, with an automatic one-time plain-recognition retry when a speech
  service exposes but rejects the experimental hints;
- an imported German questionnaire retained the same single control and accepted
  its displayed values when spoken as English numbers, without claiming German
  label recognition; and
- ambiguous and negated speech remained unselected, including common `not`
  homophones in either recognition-alternative order; a small allowlist covers
  harmless standalone number homophones and fixed-label inflections, numeric input
  is never extracted from arbitrary surrounding prose, and the explicit confirmation
  explains the remaining browser-service omission boundary;

Bounded live-browser verification on 1 August 2026 also confirmed the public
conductor and participant flow, same-device recovery, a supervisor-supplied
German LSG import, disconnected submission warning plus reconnect/retry, and the
post-fix microphone route. `Not 4`, `Agree quickly` and `Strongly` did not select
an answer; intentional `4` produced a visible answer proposal and still required
explicit confirmation. The earlier `0.8.7-q7` Qualtrics normal-submission
evidence is historical only: the definition-fingerprint field changes the
`0.8.8-q8` result contract and requires a fresh synthetic accepted row.
These checks establish the documented technical workflow, not multilingual
spoken-label support, universal browser reliability or permission to recruit.

### Verification recorded for `v0.8.0-rc.3`

Automated verification:

- a clean lock-file installation completed;
- 18 test files passed, containing 149 passing tests;
- 9 representative axe structural accessibility scans passed; and
- TypeScript, production, standalone and synchronized release builds passed.

Manual structured-import verification:

- fresh Qualtrics QSF and LimeSurvey LSS exports were imported through the
  deployed conductor page;
- questionnaire title, item order, wording, response labels and numeric values
  were checked against each source export before conversion;
- both converted definitions generated working participant questionnaires, and
  responses 4 and 2 produced the reviewed mean score 3.00;
- the converted LSS definition was installed with the matching Qualtrics bridge
  and completed through an activated UCL Qualtrics distribution link; and
- two exported Qualtrics rows each contained `AQP_ACCEPTED = 1`, schema 4,
  instrument ID `custom-tsc`, ratings 4 and 2, and primary score 3.00.

Unsupported or uncertain source content remains visible and blocks conversion
rather than being silently removed or approximated. These checks establish the
tested technical workflow; they do not establish universal accessibility,
psychometric equivalence or benefit for a disability group.

### Verification recorded for `v0.8.0-rc.2`

Automated verification:

- 17 test files passed, containing 130 passing tests;
- 8 axe structural accessibility scans passed;
- TypeScript, production, standalone and synchronized release builds passed;
- the local HTTP entry-point smoke test passed;
- the high-level production dependency audit reported 0 vulnerabilities.

Manual workflow verification:

- Weighted NASA-TLX, Raw TLX, SUS and UEQ-S were each reinstalled, completed and
  exported through UCL Qualtrics;
- a researcher-supplied questionnaire was created without code, downloaded as
  JSON, imported again and reproduced with the same items, scoring and result
  fields;
- its local result and Qualtrics accepted row, primary score, answers and raw JSON
  reconstruction were checked;
- normal online submission, automatic hand-off, disconnected submission warning,
  local backup, reconnect/retry, reload/interruption recovery and phone/tablet
  recovery paths were exercised.

These checks establish that the release behaves as specified in the tested
technical workflows. They do not establish that the platform is universally
accessible or that it improves a questionnaire's psychometric properties.

### Known limitations

- Novice-conductor and questionnaire-user evaluation is still pending. The current
  evidence supports an evaluation-ready prototype, not a completed user-study
  claim.
- The no-code custom path is deliberately bounded to 1–20 required single-choice
  items on one shared integer scale, with reviewed mean or sum scoring and optional
  reverse scoring. Structured import supports the same definition profile. It
  can extract one explicitly selected compatible rating set from a mixed
  LimeSurvey group, but it does not convert free text, multiple answers, ranking,
  branching, arbitrary formulas or general matrix behaviour. Qualtrics
  single-answer Likert matrix rows may be expanded only when their order and
  numeric scale are explicit. Accepted rows are presented sequentially as
  labelled native radio groups; the platform does not reproduce the source
  matrix layout or logic.
- Structural validation cannot determine copyright permission, measurement
  validity, population suitability or equivalence to an original instrument.
- Passing automated checks is not a claim of complete WCAG 2.2 conformance or
  coverage of every browser, screen reader and assistive-technology combination.
  The versioned manual audit currently contains a frozen protocol and **NT** cells,
  not completed NVDA/VoiceOver/voice-control evidence.
- Voice recognition depends on the browser, operating system and any network-backed
  speech service. The single control requests `en-GB`. It accepts an allowed displayed
  number spoken in English for every questionnaire and, only for English questionnaires,
  one complete visible English answer label. Supported browsers are given the current
  visible answers as contextual hints; common standalone number homophones and a small
  set of meaning-preserving label variants are handled, but general fuzzy matching is
  deliberately not used. It does not translate or claim non-English label recognition.
  Permission, microphone, no-speech, network
  and abort failures leave the ordinary answer buttons available. Webcam
  gaze input remains experimental and requires conventional keyboard/pointer
  fallbacks.
- A disconnected submission is not centrally recorded until the connection is
  restored and Qualtrics accepts the response. The recovery copy remains on the
  same browser and device, so it should be downloaded before that local state is
  cleared.
- GitHub Pages hosts the application but does not store participant records.
  Remote collection requires the matching exact-origin Qualtrics bridge.
- Qualtrics may record IP address and approximate location unless the survey's
  anonymisation setting is enabled and confirmed in a new export.

## Supported scope

Version 0.8 is a bounded shared runner, not a questionnaire-independent survey
engine. It accepts one shared integer single-choice scale per definition, a limited
set of response structures and an allowlist of scorer implementations. Adding a
questionnaire that needs a new scorer or mixed response scales requires code and
review; the definition file alone is not sufficient.

| Registered definition | Items and scale type | Workflow | Scoring |
| --- | --- | --- | --- |
| Weighted NASA-TLX | 6 magnitude items, 0–100 in steps of 5 | ratings plus 15 pairs | weighted NASA-TLX |
| Raw TLX | 6 magnitude items, 0–100 in steps of 5 | ratings only | unweighted arithmetic mean |
| System Usability Scale | 10 agreement items, 1–5 | ratings only | standard alternating SUS |
| UEQ-S | 8 semantic differentials, 1–7 | ratings only | centred overall, pragmatic and hedonic means; **blocked from a new public release until redistribution permission is confirmed** |
| Researcher supplied or safely imported | 1–20 integer single-choice items on one shared 0–100-bounded scale | ratings only | researcher-confirmed mean or sum, with optional reverse-scored items |

For both NASA-TLX definitions, the valid displayed and spoken values are
`0, 5, 10, …, 100`. Values such as `1`, `2`, `3` or `92` are deliberately
rejected rather than silently rounded. Raw TLX is the six-item unweighted form;
the weighted definition is the separate six-rating plus fifteen-comparison
workflow.

Built-in questionnaire files are discovered from
[`source/instruments/*.questionnaire.json`](source/instruments/). JSON Schema plus
runtime semantic checks reject unsupported fields and incompatible scorers. Scoring
functions are an executable allowlist; JSON cannot inject code.
Questionnaire item text is not automatically covered by a future software licence;
see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) and the UEQ-S release gate.

On the conductor page, the researcher first chooses one of two setup routes:

- **Ready-made or saved AQP definition (six screens):** select a registered
  definition, re-import a previously validated `.json` definition, or build a
  bounded questionnaire manually; then confirm scoring and configure the study.
- **Qualtrics or LimeSurvey export (ten screens):** review and convert a
  Qualtrics `.qsf`, LimeSurvey `.lss`, `.lsg` or `.lsq` export through separate
  source, question, value, warning and scoring screens before configuring the
  study.

The researcher reviews the detected wording, order, labels, numeric values,
unsupported content and scoring before generating the prepared participant
link. Participants answer that link; they do not configure the questionnaire.
For technical testing, **This browser only** keeps the result on the same device
and provides JSON/CSV export. For approved remote collection, **UCL Qualtrics**
uses the exact configured survey and shows success only after a matching receipt.

The two file imports are not duplicates. QSF/LSS/LSG/LSQ files are source-platform
exports that require review and conversion. AQP JSON is the platform's already
normalised, portable definition and is validated again without repeating source
conversion.

External import detects the format, extracts only the supported questionnaire
content and shows three separate lists: imported safely, requires confirmation
and unsupported. Unsafe active content inside the selected rating set blocks
conversion. Questions outside that set are listed explicitly and remain in the
source survey; the platform never silently drops them. Before conversion, the
researcher must confirm wording, order, displayed labels, numeric values,
mean/sum scoring and reverse-scored items. Imported markup becomes safe plain
text, and imported code is never executed.

Current Qualtrics exports that omit unchanged default recodes are accepted only
when their explicit choice order proves the default `1` through `N` mapping.
Current LimeSurvey exports may use a declared base language, inert generated
question attributes and default `A001` through `A00N` answer codes; each
conversion is exposed for researcher confirmation. Non-default opaque codes,
active attributes, scripts and survey logic remain blocking.

A multi-group LSS is not flattened silently. The conductor chooses one group to
review as a standalone questionnaire. If that group contains different numeric
scales, the conductor then chooses one compatible rating set. Reviewed radio-list,
dropdown-list, 5 Point Choice and numeric Array rating rows may be converted.
Questions outside the selected set remain in LimeSurvey and are named explicitly;
they are never silently merged or scored. Group relevance, omitted groups, blank
intermediate scale labels and Array expansion are shown for confirmation.
Question-level conditions and unsupported behaviour still block an item selected
for conversion. An LSG is the clearest input when the researcher intends to reuse
one questionnaire group.

The full validated definition is embedded in the study configuration,
participant link and result record, so another browser does not need a local
copy. Download the converted definition JSON with the protocol.

This remains a bounded definition profile, not an arbitrary survey uploader.
Free text, multiple answers, ranking, branching, unsupported matrices, custom
formula strings and executable code are not converted. Content outside a selected
rating set is listed and remains in the source survey; unsafe behaviour inside the
selected set blocks conversion. Theme, navigation,
publication and notification settings remain in the source platform. The
platform validates structure and calculation; the conductor remains responsible
for permission, provenance, psychometric validity and study suitability.

LimeSurvey `.lsa` archives are deliberately not accepted because they may include
responses, tokens and participant data rather than questionnaire structure only.
Export `.lss` for a survey, `.lsg` for one group or `.lsq` for one question.

See
[`docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md`](docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md)
for the decision, evidence and explicit limits.
Use
[`docs/CUSTOM-QUESTIONNAIRE-TEST.md`](docs/CUSTOM-QUESTIONNAIRE-TEST.md)
for a fixed-input local, JSON round-trip and Qualtrics test.
Use
[`docs/QUESTIONNAIRE-IMPORT.md`](docs/QUESTIONNAIRE-IMPORT.md)
for export, review, conversion and limitation details.

## Roles and collection

| Role | Entry point | Responsibility |
| --- | --- | --- |
| Study conductor | `study.html` | Selects a built-in questionnaire, safely imports a supported QSF/LSS/LSG/LSQ export or validates a researcher-supplied definition; then sets study/task context, support defaults, policy and collection route. |
| Participant | generated `index.html#study=...` | Enters a pseudonymous code and answers the prepared instrument. No setup is required before starting. |
| UCL Qualtrics | activated distribution link | Hosts the participant iframe, stores the generic Version 4 record and returns a matching receipt. |

The raw GitHub page does not collect remotely. Central collection is activated only
inside the configured Qualtrics parent. Participants receive the activated Qualtrics
link, not the raw GitHub URL.

## Accessibility-support boundary

The shared runner provides keyboard and screen-reader structure, large text, built-in
spoken guidance, confirmed voice input, interruption recovery and experimental gaze
input. The conductor may lock presentation, permit presentation/audio/recovery
preferences, or permit all definition-approved choices.

Support changes and input routes are recorded separately and never enter scoring.
Instrument-specific capability checks prevent smileys or unvalidated simpler wording
from appearing in built-in scored instruments. Their standard response positions keep the official
endpoint labels without inventing meanings such as `Neutral` or `Agree` for
intermediate values. Imported blank intermediate labels likewise remain numbered rather
than being given invented meanings. Confirmed voice input is deliberately English-only:
all supported rating questionnaires accept their displayed values as English numbers,
and English questionnaires additionally accept one complete visible English label,
including a small set of documented recognition variants.
Non-English label recognition is not claimed. Recognition availability and transcription
accuracy still depend on the participant's browser and operating system; buttons always
remain available and every proposal requires confirmation. NASA-TLX smiley landmarks
remain an explicitly declared experimental presentation route; author-written simpler
explanations are no longer included in any built-in scored definition. A researcher-supplied definition may
provide separately labelled supplemental help, which receives a distinct fingerprint;
AQP does not claim psychometric equivalence for that wording.

WCAG 2.2 is used as an engineering and test framework. The repository does not claim
complete WCAG conformance or disability-group benefit. See
[`docs/WCAG-2.2-COMPONENT-AUDIT.md`](docs/WCAG-2.2-COMPONENT-AUDIT.md).
The evidence limits for jsdom, rendered-browser and human testing are separated in
[`docs/ACCESSIBILITY-EVIDENCE-BOUNDARY.md`](docs/ACCESSIBILITY-EVIDENCE-BOUNDARY.md).

## Result safety

The generic Qualtrics bridge:

- uses an exact-version two-way handshake and blocks starting when generated HTML,
  parent JavaScript and participant code do not match;
- presents the participant application as a full-browser viewport with one visible
  scrollbar instead of a clipped nested question panel;
- sends only to the exact configured HTTPS parent origin;
- accepts only a matching submission receipt;
- attempts a complete local backup before host contact;
- retains JSON/CSV recovery controls;
- restores navigation after staging or native-advance failure;
- records instrument identity, generic answers, scoring details, support provenance
  and lossless raw JSON chunks;
- contains no API token or secret.

Install and re-test the Version 0.8 package from
[`docs/QUALTRICS-INTEGRATION.md`](docs/QUALTRICS-INTEGRATION.md). Version 0.7
`ANTLX_*` fields are not compatible with the new generic `AQP_*` manifest. Existing
Version 0.7 rows are not deleted or backfilled: their values remain under
`ANTLX_*`, while their later-added `AQP_*` cells are expected to be blank.

## Repository map

| Purpose | Location |
| --- | --- |
| Questionnaire definitions and schema | [`source/instruments/`](source/instruments/) |
| Definition validation/registry | [`source/src/questionnaire-definition.ts`](source/src/questionnaire-definition.ts) |
| No-code custom definition builder | [`source/src/custom-questionnaire.ts`](source/src/custom-questionnaire.ts) |
| QSF/LSS/LSG/LSQ review and conversion | [`source/src/platform-questionnaire-import.ts`](source/src/platform-questionnaire-import.ts) |
| Allowlisted scoring | [`source/src/scoring.ts`](source/src/scoring.ts) |
| Participant runner | [`source/src/accessible-nasa-tlx.ts`](source/src/accessible-nasa-tlx.ts) |
| Conductor | [`source/src/study-conductor.ts`](source/src/study-conductor.ts) |
| Configuration/result schemas | [`source/src/study.ts`](source/src/study.ts) |
| Qualtrics child and parent bridge | [`source/src/result-sink.ts`](source/src/result-sink.ts), [`integrations/qualtrics/`](integrations/qualtrics/) |
| Current standalone participant runner | [`source/demo/accessible-questionnaire-platform-v0.8.html`](source/demo/accessible-questionnaire-platform-v0.8.html) |
| Historical v0.7 baseline | [`source/demo/accessible-nasa-tlx-v0.7.html`](source/demo/accessible-nasa-tlx-v0.7.html) |
| Architecture and extension rules | [`docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md`](docs/QUESTIONNAIRE-PLATFORM-ARCHITECTURE.md), [`docs/INSTRUMENT-DEFINITION-GUIDE.md`](docs/INSTRUMENT-DEFINITION-GUIDE.md) |
| No-code custom-questionnaire test | [`docs/CUSTOM-QUESTIONNAIRE-TEST.md`](docs/CUSTOM-QUESTIONNAIRE-TEST.md) |
| Qualtrics/LimeSurvey import guide | [`docs/QUESTIONNAIRE-IMPORT.md`](docs/QUESTIONNAIRE-IMPORT.md) |
| Current source verification | [`docs/SOURCE-VERIFICATION-A1-F4.md`](docs/SOURCE-VERIFICATION-A1-F4.md) |
| Release-candidate verification gate | [`docs/RC4-RELEASE-GATE.md`](docs/RC4-RELEASE-GATE.md) |
| Researcher-workflow evaluation plan | [`docs/IMPORT-WORKFLOW-EVALUATION.md`](docs/IMPORT-WORKFLOW-EVALUATION.md) |
| Migration | [`docs/MIGRATION-V0.7-V0.8.md`](docs/MIGRATION-V0.7-V0.8.md) |
| Colour and WCAG audit | [`docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md`](docs/NON-TEXT-CONTRAST-AND-COLOUR-AUDIT.md), [`docs/WCAG-2.2-COMPONENT-AUDIT.md`](docs/WCAG-2.2-COMPONENT-AUDIT.md) |
| Technical risk register | [`docs/TECHNICAL-RISK-REGISTER.md`](docs/TECHNICAL-RISK-REGISTER.md) |
| Supervisor-feedback acceptance evidence | [`docs/SUPERVISOR-ACCEPTANCE-EVIDENCE-v1.md`](docs/SUPERVISOR-ACCEPTANCE-EVIDENCE-v1.md) |
| Final contribution statement v2 | [`docs/AQP-FINAL-CONTRIBUTION-v2.md`](docs/AQP-FINAL-CONTRIBUTION-v2.md) |
| Evaluation matrix v6 | [`docs/AQP-EVALUATION-MATRIX-v6.md`](docs/AQP-EVALUATION-MATRIX-v6.md) |
| Quantified technical evaluation protocol | [`docs/TECHNICAL-EVALUATION-PROTOCOL-v1.0.md`](docs/TECHNICAL-EVALUATION-PROTOCOL-v1.0.md) |
| Manual AT audit v1.0 | [`docs/manual-audit/AQP-MANUAL-AT-AUDIT-v1.0.md`](docs/manual-audit/AQP-MANUAL-AT-AUDIT-v1.0.md) |
| Planned observed researcher study | [`docs/OBSERVED-RESEARCHER-STUDY-PROTOCOL-v1.0.md`](docs/OBSERVED-RESEARCHER-STUDY-PROTOCOL-v1.0.md) |
| Ethics amendment submission summary | [`docs/ethics/AQP-ETHICS-AMENDMENT-SUMMARY-v1.0.md`](docs/ethics/AQP-ETHICS-AMENDMENT-SUMMARY-v1.0.md) |
| Participant information, consent, risk and data-receipt templates | [`docs/ethics/`](docs/ethics/) |

Historical Version 0.5 and 0.6 standalone files remain in Git history but were
removed from the active tree to avoid ambiguous test candidates.

## Build and verify

```bash
cd source
npm ci
npm test
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
npm run test:browser-support
npm run report:browser
npm run report:browser-support
npm run build:release
```

Automation covers definition/scorer compatibility, weighted NASA-TLX, Raw TLX, SUS,
UEQ-S, researcher-supplied and QSF/LSS/LSG/LSQ-imported end-to-end workflows,
configuration and Version 0.7 saved-progress migration, imported-matrix row
rendering, conservative voice parsing, direct and iframe-parent
focus/error movement, saved-session semantics, visible-state contrast, result
validation/export, exact-origin receipts, Qualtrics adverse paths, standalone
packaging and structural axe scans. The Playwright suite serves the production build
and adds rendered Chromium checks for named critical states, actual Tab focus,
computed focus styling, critical target dimensions, 1280/768/320-CSS-pixel widths,
Chromium page-scale 2.0 and its 640-CSS-pixel reflow companion. The cross-browser
job separately records native API support in Chromium, Firefox and Playwright
WebKit. CI publishes quantified fidelity/safety/reconstruction results,
machine-readable and HTML browser records, a readable Playwright report, failure
traces and per-state summaries for the exact tested revision. Passing automation
is software evidence, not participant evidence, disabled-user benefit evidence or
a WCAG conformance claim.
