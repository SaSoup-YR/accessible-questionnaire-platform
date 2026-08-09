# Bounded definition-driven platform architecture

Prototype: Accessible Questionnaire Platform Version 0.8

Revised decision date: 10 August 2026

## Decision

Version 0.8 implements bounded definition-driven reuse within an explicitly
supported declarative profile. It is **not questionnaire-independent**.

The same conductor, participant runner, support controls, interruption recovery,
input-route provenance, result schema and Qualtrics bridge run three distributable built-in
instruments and a bounded researcher-supplied definition profile:

| Definition | Response structure | Scoring strategy | Pairwise stage |
| --- | --- | --- | --- |
| Weighted NASA-TLX | six integer ratings, 0–100 in steps of 5 | weighted pairwise NASA-TLX | all 15 pairs |
| Raw TLX | six integer ratings, 0–100 in steps of 5 | unweighted arithmetic mean | none |
| System Usability Scale | ten integer ratings, 1–5 | standard alternating SUS rule | none |
| Researcher supplied | 1–20 integer single-choice items sharing one scale | reviewed mean or sum with optional reverse scoring | none |

This contrast is deliberate. Re-running the same six-item workflow under another
title would not demonstrate separation. Raw TLX isolates a scoring/workflow change
while preserving the six TLX items. SUS changes item count, agreement range,
navigation length and scoring rule. An original synthetic fixture exercises the
semantic-differential renderer without becoming a distributable questionnaire.
Raw TLX and SUS omit the pairwise stage.

## Why the scope is constrained

The phrase any questionnaire is not technically or methodologically defensible.
Questionnaires may use free text, dates, multiple selection, ranking, matrices,
branching, adaptive logic, semantic differentials, repeated groups, multimedia,
clinical safety rules and proprietary scoring. A runner that supports these bounded
rating profiles cannot claim those capabilities.

Version 0.8 therefore supports:

- one required integer single-choice response per page;
- a uniform bounded magnitude, agreement or semantic-differential scale defined by
  minimum, maximum and step;
- optional five-landmark presentation where the definition explicitly permits it;
- optional all-pairs comparisons;
- an allowlisted and tested scoring strategy;
- versioned item, source and scoring metadata in every result.
- a no-code custom path for 1–20 items on one shared 0–100-bounded integer
  scale, using reviewed mean or sum scoring.
- a browser-local review and conversion path for supported Qualtrics QSF and
  LimeSurvey LSS/LSG/LSQ rating questionnaires.

It does not currently support:

- free-text, multiple-answer, general matrix, ranking or date items;
- display or skip logic;
- arbitrary JavaScript supplied by a definition;
- an unreviewed scoring expression;
- automatic psychometric equivalence between an official item and an optional
  accessibility presentation;
- arbitrary remote definition URLs;
- custom formula strings or executable code.

Refusing unsupported definitions is part of the research contribution. Silent
approximation could alter an instrument while still producing a plausible score.

## Architectural boundary

### 1. Definition layer

Files matching `source/instruments/*.questionnaire.json` are discovered at build
time for the built-in registry. Each file contains identity, version, source,
items, scale, optional pairwise behavior, capability flags and the name of an
approved scorer.

The conductor also has a no-code builder and validated JSON import for the
researcher-supplied profile. It creates the same `QuestionnaireDefinition`
contract, but only with the generic mean or sum scorer and no pairwise stage.
The validated definition is embedded in the study configuration, participant
link and result record. It is bounded to 9,000 UTF-8 bytes and cannot replace a
built-in ID.

`platform-questionnaire-import.ts` is an adapter before this definition
boundary. It parses a bounded Qualtrics QSF or LimeSurvey LSS/LSG/LSQ subset, records
accepted, confirmation-required and unsupported content, and produces a draft
only when no active content would be silently lost. A Qualtrics single-answer
Likert matrix can be expanded row-by-row when its row and response order are
explicit. The researcher still confirms scale meaning, mean/sum scoring and
reverse-scored items. The resulting object passes through the same custom
definition validator and scorer allowlist; the adapters cannot bypass them.

Imported markup is reduced to safe visible text. Imported scripts, dynamic
expressions and formulas are not executed. The file is parsed in the browser
and is not sent to a server.

`questionnaire-definition.schema.json` publishes the structural contract.
`validateQuestionnaireDefinition` repeats validation at runtime and adds semantic
checks that are difficult to express in JSON Schema, such as the exact item order
required by the SUS scorer.

Definitions are data, not executable extensions. Unknown fields and scorer names
are rejected.

### 2. Runner layer

`accessible-nasa-tlx.ts` retains its historical filename for traceability, but its
active `<accessible-questionnaire>` component obtains its item count, wording,
scale, anchors, pairwise stage and score label from the selected definition. The
legacy `<accessible-nasa-tlx>` custom-element name remains as a bounded migration
alias.

The supported import profile does not introduce a second matrix renderer. When
an explicitly ordered Qualtrics single-answer Likert matrix is accepted, the
adapter converts each source row into an ordered ordinary item before the
definition boundary. The runner then presents those rows sequentially, one item
per page. Each item uses a native radio group inside a `fieldset` and `legend`,
with the item name, visible response labels, selected state and native keyboard
order preserved. This is a documented presentation transformation requiring
researcher confirmation; it is not a claim that arbitrary source-matrix layout,
logic or interaction is reproduced.

### 3. Accessibility-support layer

Large text, spoken guidance, confirmed voice input, interruption recovery, gaze
input, keyboard operation and screen-reader structure are runner capabilities.
They do not enter a questionnaire score.

Measurement-adjacent supports require a definition capability:

- NASA-TLX currently permits optional simpler explanations and experimental
  smiley landmarks. Their use is logged separately and no psychometric-equivalence
  claim is made.
- SUS disables both. A facial-valence scale is not an agreement scale, and changing
  validated item wording would require separate evidence.
- The runner preserves declared endpoint/response labels and does not invent labels
  for intermediate positions. Screen-reader names and confirmed voice proposals use
  only the value and complete visible label declared by the active definition.

### 4. Scoring layer

`scoring.ts` is an executable allowlist. A JSON file may select an existing
strategy but cannot provide code.

- `nasa-tlx-weighted-v1` requires six 0–100 items, 5-point increments and all
  pairs.
- `nasa-tlx-raw-v1` requires the six ordered TLX items, a 0–100 scale and no
  comparisons;
- `sus-standard-v1` requires the ordered `sus01`–`sus10` items, a 1–5 agreement scale and no
  pairs.
- `ueqs-standard-v1` remains a reviewed executable extension requiring the ordered
  `ueqs01`–`ueqs08` item identifiers, a 1–7 semantic-differential scale and no
  pairs. It is tested with original synthetic item wording; no public built-in
  UEQ-S definition is shipped in this candidate.
- `mean-v1` averages original or explicitly reverse-scored values across 1–20
  items.
- `sum-v1` sums the same adjusted values and derives its declared range from
  the item count.

A genuinely new scoring rule requires reviewed code and tests. This is intentional:
scoring is part of instrument validity, not ordinary presentation configuration.

### 5. Record and collection layer

Result schema Version 4 stores:

- questionnaire ID, name, version, definition schema and scoring strategy;
- the complete validated definition snapshot when it is researcher supplied;
- item responses and any pairwise choices;
- primary score, declared range and strategy-specific details;
- configured support, final support state, changes and input routes;
- timing, pseudonymous participant code and submission ID.

The Qualtrics bridge uses generic `AQP_*` Embedded Data fields and stores the full
record in bounded raw JSON chunks. It no longer assumes six NASA dimensions.
Exact-origin messaging, a matching submission receipt, local backup before the
handoff and navigation recovery are retained from the Version 0.7 implementation.

### 6. Configuration and interruption-recovery migration

Version 0.7 study configurations are normalised to Version 4 as weighted
NASA-TLX configurations. Version 0.7 in-progress recovery copies use the same
strict response shape but an older storage key and no instrument ID. The runner
therefore looks for that legacy key only when the active definition is weighted
NASA-TLX, validates the saved stage, indexes, pair count, participant code and
configuration ID, then rewrites it under the Version 0.8 instrument-aware key.
It never assigns a legacy recovery copy to a researcher-supplied or other
instrument definition. A legacy copy that cannot be validated or rewritten is
left untouched rather than guessed or silently destroyed.

## Relationship to mature systems

The separation follows established patterns without copying an implementation:

- HL7 FHIR separates a reusable
  [Questionnaire](https://hl7.org/fhir/questionnaire.html) definition from a
  [QuestionnaireResponse](https://hl7.org/fhir/questionnaireresponse.html).
- SurveyJS represents survey structure as a
  [JSON model](https://surveyjs.io/form-library/documentation/design-survey/create-a-simple-survey)
  that a common runner renders.
- [JSON Schema 2020-12](https://json-schema.org/specification) provides a
  machine-readable vocabulary for constraining JSON data.

FHIR and SurveyJS are much broader than this dissertation prototype. They support
the architectural separation, not a claim of feature parity.

## Evidence supplied by Version 0.8

Automated evidence must show more than successful rendering:

1. all three distributable built-in JSON definitions pass structural and semantic validation;
2. executable fields and incompatible scorer/scale combinations are rejected;
3. weighted NASA-TLX produces 21 rating values, 15 pairs and its weighted result;
4. Raw TLX produces the same six ratings, no pair page and their unweighted mean;
5. SUS produces five response values, no pair page and its alternating result;
6. an original synthetic fixture produces seven visually unnumbered response
   positions, while a separate synthetic eight-item definition exercises the
   retained centred scorer without third-party wording;
7. the same conductor creates a participant configuration for every registered instrument;
8. the same participant element completes all registered workflows;
9. the same Version 4 record and Qualtrics bridge preserve every result;
10. accessibility checks run on representative workflows.
11. a conductor can create a new questionnaire without editing source, and its
    participant URL reproduces the definition in a separate runner;
12. custom mean, sum, reverse scoring, result validation and export are
    deterministic;
13. executable fields, built-in-ID replacement, unsupported scoring, invalid
    scales and oversized definitions are rejected.
14. representative QSF, LSS, LSG and LSQ fixtures preserve item, response and numeric
    order through conversion;
15. malformed files, flow logic and dynamic content block conversion; mixed
    LimeSurvey groups require an explicit compatible rating-set choice, while
    every non-selected source question is reported rather than silently removed;
16. a reviewed imported definition survives JSON round-trip, participant
    completion, scoring and result export;
17. the three-part import review has focus movement, visible status and
    representative structural accessibility coverage.
18. an explicitly ordered imported Qualtrics matrix is expanded, rendered as
    sequential labelled radio groups, completed, scored and exported through the
    same participant component;
19. a valid Version 0.7 weighted NASA-TLX recovery copy migrates to the Version 0.8
    key and remains resumable, while the migration is not applied to another
    instrument.

These tests establish architectural reuse and data integrity. They do not establish
that either optional support improves accessibility or preserves psychometric
properties. Those are evaluation questions.

## Extension path

Raw TLX, SUS and the synthetic semantic-differential fixtures exercise the
registered extension boundaries. The no-code builder
adds a second path for questionnaires that fit the bounded rating profile.
Qualtrics QSF and LimeSurvey LSS/LSG/LSQ adapters add a third path into that same
profile; they do not broaden the runner or scorer by inference. A new response
type or scoring rule is still accepted only when it is represented explicitly
in reviewed code and tests. The public build does not execute a formula or
script supplied by a definition and does not claim that every questionnaire is
supported. This incremental policy gives each capability a testable boundary
and preserves scoring provenance.
