# Version 0.8 study workflow decision

Decision dates: 20–27 July 2026

## Workflow questions addressed

The implementation must make explicit:

1. which interface belongs to the conductor and which belongs to the participant;
2. why a participant with an impairment is not required to configure the instrument;
3. how the prepared configuration is exported;
4. how complete answers are saved and returned remotely;
5. whether the accessibility infrastructure is reusable beyond NASA-TLX.

## Two roles, one runner

- `study.html` is the conductor page.
- a generated `index.html#study=...` route is the participant page.
- the participant runner loads a validated, versioned questionnaire definition.

The conductor chooses a built-in instrument or validates a bounded
researcher-supplied definition, then sets study context, support defaults,
participant-adjustment policy, input routes, score-display policy and collection
mode. The participant link contains configuration and, for a custom instrument,
its data-only definition. It never contains participant identity, answers,
account tokens or executable code.

For a new questionnaire, the conductor uses the no-code builder or imports a
previously downloaded definition JSON. The supported profile is 1–20 required
single-choice items on one shared whole-number scale, with reviewed mean or sum
scoring and optional reverse-scored items. The builder validates before a link
can be generated. The study protocol should retain the downloaded definition and
the generated configuration.

The conductor is presented as a guarded wizard rather than one crowded page.
A ready-made or saved AQP definition uses six screens: source, scoring, study,
support, collection and review. A Qualtrics/LimeSurvey source export uses ten
screens: source, upload/group selection, questions, answer values, warnings,
scoring, study, support, collection and review. Each Continue action validates
the current task. Browser history follows the step sequence, and a same-tab
session draft survives reload; raw source-file contents are not persisted.

## Local technical workflow

1. The conductor generates a local configuration.
2. A participant/tester enters a synthetic or pseudonymous code and answers the
   prepared instrument.
3. The Version 4 record is stored in the same browser when storage is available.
4. The conductor exports and explicitly erases it.

This is same-device technical testing, not remote collection.

## Approved Qualtrics workflow

1. The conductor selects Qualtrics and supplies its HTTPS survey URL.
2. The configuration stores only the exact parent origin.
3. The generated participant page is installed in Qualtrics with the generic
   Version 0.8 bridge.
4. The participant receives the Qualtrics distribution link.
5. The child creates a local backup, then sends one Version 4 record.
6. Qualtrics validates, stages generic fields, returns a matching receipt and
   advances natively.
7. The researcher retrieves/export records through the restricted UCL account.

Participant download-and-email is an emergency route, not the normal procedure.

## Participant autonomy without required setup

The conductor supplies usable defaults. The protocol selects one policy:

- locked for a controlled condition;
- presentation-only for text, speech and recovery preferences;
- participant-choice for a formative support evaluation.

The participant-choice default is appropriate for investigating use and preference
of the support cluster, but it is not universally preferable. Controlled comparisons
may need locked measurement-adjacent presentation.

Every permitted change records setting, before/after value, stage and timestamp.
Final state and per-answer route are also saved. None enter scoring.

## Definition-aware record

JSON is lossless; CSV is flattened for analysis.

| Area | Contents |
| --- | --- |
| Provenance | schema, prototype, study, configuration and submission IDs |
| Instrument | ID, name, version, definition schema and scoring strategy; full definition snapshot for a researcher-supplied questionnaire |
| Application identity boundary | pseudonymous participant code only; Qualtrics IP/location metadata follows the separately verified survey anonymisation setting |
| Timing | start, changes and completion |
| Answers | generic item responses, optional pairs and presentation order |
| Score | primary score, declared range and strategy-specific details |
| Support | configured/final settings, change log, recovery/audio/gaze use |
| Input provenance | route used for each item and pair |
| Collection | local or exact-origin Qualtrics |

Validation recalculates the selected instrument's score before a stored result is
accepted.

## Evaluation boundary

Technical tests establish deterministic software behavior. They do not establish
that a support is helpful, that the workflow is easier, that optional presentation
is psychometrically equivalent, or that WebGazer is accurate. Real recruitment
uses a frozen release, a successful synthetic Qualtrics preflight and final
materials and procedures confirmed as covered by the project's existing approved
protocol and data-management route.
