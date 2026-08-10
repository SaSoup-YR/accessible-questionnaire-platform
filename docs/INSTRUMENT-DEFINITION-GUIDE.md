# Instrument definition guide

Version 0.8 loads registered files from:

`source/instruments/*.questionnaire.json`

## Adding a questionnaire without editing code

If the questionnaire already exists in Qualtrics or LimeSurvey, first follow
[`QUESTIONNAIRE-IMPORT.md`](QUESTIONNAIRE-IMPORT.md). The structured importer
reviews supported QSF/LSS/LSG/LSQ rating questions, blocks unsupported active content,
and sends the confirmed result through the same definition validator described
below.

Open `study.html` and select **Add your own questionnaire**. The page separates
three routes:

1. convert a reviewed Qualtrics QSF or LimeSurvey LSS/LSG/LSQ source export;
2. reproduce an AQP definition JSON previously downloaded from this platform; or
3. build a bounded questionnaire manually.

QSF/LSS/LSG/LSQ and AQP JSON are not interchangeable. The first route converts external
source-platform structure. The second revalidates an already normalised platform
definition.

With the manual route, a researcher can:

1. enter the questionnaire name, version, description, participant instruction
   and source or authorship label;
2. choose a shared integer scale between 0 and 100;
3. add 1–20 required single-choice items with their exact wording and two visible
   endpoint labels;
4. choose the reviewed mean or sum calculation;
5. mark individual items as reverse-scored;
6. validate and select the definition;
7. download the definition JSON and generate the participant configuration.

The definition is embedded in the configuration, participant URL and result
record. A participant or another browser therefore does not need the original
builder state. Importing the definition JSON or saved study configuration
reproduces the same wording, values and score rule.

This path accepts data, not code. It rejects free-text items, multiple answers,
branching, matrices, pairwise stages, arbitrary formula strings and JavaScript.
The 9,000-byte definition limit keeps the participant URL and full Qualtrics raw
record within the documented transport allocation.

The builder verifies technical structure and deterministic scoring only. Before
use, the researcher must separately verify permission, primary-source wording,
population/task validity, interpretation, fit with the project's existing
approved protocol and data management.

Follow [`CUSTOM-QUESTIONNAIRE-TEST.md`](CUSTOM-QUESTIONNAIRE-TEST.md) for a
fixed-input test with a known reverse-scored result, JSON reproduction and a
Qualtrics accepted-row check.

## Adding a registered instrument

1. Confirm that its use, wording and scoring are permitted and cite the primary
   source in the definition.
2. Copy the structural pattern described by
   `questionnaire-definition.schema.json`.
3. Give the instrument and every item stable IDs and a version.
4. Select only an existing scorer whose semantic requirements the instrument
   satisfies. Do not place JavaScript or a formula string in the JSON.
5. Enable simpler explanations or smiley landmarks only when instrument-specific
   evidence and the evaluation protocol justify them.
6. Run `npm test` and `npm run build:release`.
7. Add an end-to-end test showing the item count, response scale, stage transitions,
   score and exported record.
8. Re-test the generated Qualtrics package before collecting data.

## Current definition profile

Required content:

- definition schema version, ID, instrument version and names;
- description, participant introduction and content-integrity notice;
- source or authorship label, with an optional primary HTTPS source URL;
- declared magnitude, agreement or semantic-differential scale type, with integer
  minimum, maximum and step;
- one or more single-choice items;
- allowlisted scoring strategy and result range;
- capability flags.

Optional content:

- exactly five labelled landmarks;
- an all-pairs comparison stage;
- one visible label for every numeric response value on an item;
- simpler explanatory text and voice endpoint aliases.

## Validation behavior

Both the published JSON Schema and runtime semantic validator are intentional.
JSON Schema catches structural errors. Runtime validation additionally checks
scorer compatibility, HTTPS sources, unique item IDs, scale divisibility,
landmark positions and capability dependencies.

The distributable built-in registry includes weighted NASA-TLX, Raw TLX and SUS.
Original synthetic fixtures exercise semantic-differential rendering without
redistributing a third-party instrument. The specialised centred-score extension
remains executable/tested code, but no corresponding public built-in item set is
shipped in this candidate.

The runner fails closed. An unknown property, scorer or incompatible definition
stops the build or registration instead of being ignored.

## Extension limits

Built-in definitions remain versioned repository files. Researcher-supplied
definitions are validated locally and carried inside the generated study
configuration; the public site does not fetch an arbitrary remote definition URL.

The no-code path supports a shared bounded integer scale with reviewed mean or sum
scoring. Adding a new response type, subscale rule, weighting formula, adaptive
flow or other scorer still requires reviewed implementation and tests in
`source/src/scoring.ts`. This is why the public claim is **bounded
definition-driven reuse**, not questionnaire independence and not compatibility
with every questionnaire.
