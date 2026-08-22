# Accessible Questionnaire Platform (AQP)

AQP is a browser-based research prototype for configuring, running and recording bounded questionnaire definitions through one shared participant interface. It treats a questionnaire as loaded data—items, response values, scoring rules and provenance—rather than as a questionnaire hard-coded into the runner.

**Release status:** final MSc prototype release, 22 August 2026.  
**Software version and immutable tag:** `v0.8.0`.  
**Integrated product revision:** `e00a737de964e120ffec38c5030d4ad212cbff5d`.  
**Evidence boundary:** configuration-bounded technical and manual evaluation; not a claim of universal accessibility, complete WCAG conformance, psychometric equivalence, usability improvement or benefit for disabled users.

## What the prototype contributes

The implemented contribution is a reusable questionnaire-definition boundary plus a fail-closed participant and result pipeline:

- one participant runner is reused across compatible instruments;
- definitions carry item wording, ordered response values, scale labels, scoring strategy and a canonical SHA-256 fingerprint;
- the fingerprint and full definition snapshot travel with the study configuration and result record;
- malformed, incomplete, unsupported or altered definitions are rejected rather than silently approximated;
- imported content is reviewed before a participant link can be generated;
- review editing, interruption recovery, browser-local backups and Qualtrics staging preserve answer integrity;
- optional presentation, audio, voice and experimental gaze routes do not replace the native answer controls.

The number of researcher setup screens is an implementation detail, not the research contribution.

## Included definitions and import boundary

The distributable repository includes:

- weighted NASA Task Load Index;
- raw NASA Task Load Index;
- System Usability Scale;
- the versioned questionnaire-definition JSON Schema.

AQP also accepts a deliberately bounded subset of Qualtrics QSF and LimeSurvey LSS, LSG and LSQ definition exports. Conversion is limited to reviewable ordered single-choice/rating structures. Archives, response-data exports, executable logic, unsafe markup, ambiguous scoring and unsupported question structures are blocked or named for researcher confirmation; they are not silently discarded.

## Run the prototype

Hosted release entry points:

- researcher/conductor: `https://sasoup-yr.github.io/accessible-questionnaire-platform/study.html`
- participant runner: `https://sasoup-yr.github.io/accessible-questionnaire-platform/`

The participant page normally receives a generated configuration and pseudonymous participant code in the URL fragment. Opening a centrally collected configuration outside its approved Qualtrics parent is blocked.

For a local development copy:

```bash
git clone https://github.com/SaSoup-YR/accessible-questionnaire-platform.git
cd accessible-questionnaire-platform/source
npm ci
npm run dev
```

Then open the local URL printed by Vite. The root participant page and `/study.html` researcher page are separate entry points.

## Evaluation snapshot

The immutable pre-repair manual audit contained **132 route/check cells: 94 Pass, 31 Fail and 7 Not applicable**. The baseline is retained unchanged.

Targeted engineering and exact-route retesting subsequently closed **25 of the 31 historical failures**. Six route-specific failures remain:

| Repair family | Residual cell(s) | Retained boundary |
| --- | --- | --- |
| RF-01 | R3-A26 | VoiceOver + Safari did not automatically expose the initial embedded Qualtrics `Connecting` status, although blocking failure, safe connection gating and the other named routes were retained. |
| RF-06 | R4-A10 | Windows Voice Access and in-page Web Speech competed for the same spoken stop command; visible Stop and native answer controls remain available. |
| RF-07 | R3-A11, R3-A12, R4-A11, R4-A12 | Browser speech recognition did not reliably return the frozen `number four` / `not four` phrases. AQP does not infer a missing number or negation and never commits a voice proposal before confirmation. |

RF-04 saved-session recovery is closed for the historical A14/A15 failures. On the final VoiceOver + Safari route, the native saved-questionnaire dialog received the VoiceOver context, exposed the exact `3 of 10` state and continued directly to the focused Item 4 heading with the three committed answers preserved.

The final curated release candidate passed ordinary read-only workflow `32544582158` on head `69ce59443718e17729ce3dadda2d3bd810b88231`:

- 26/26 Vitest files and 230/230 tests;
- 12/12 rendered-browser routes;
- 18/18 Chromium, Firefox and Playwright WebKit support routes;
- production, standalone and synchronized release builds;
- committed generated-release freshness;
- locked dependency audit with 0 reported vulnerabilities.

The release is tagged only after the corresponding `main` workflow and GitHub Pages deployment are verified. Playwright WebKit is browser-engine evidence, not Safari + VoiceOver evidence. Manual announcement, focus and voice-control claims use the named real assistive-technology observations instead.

## Reproduce and inspect the evidence

Start with:

- [`TESTING.md`](TESTING.md) — deterministic, browser and manual procedures;
- [`EVIDENCE-INDEX.md`](EVIDENCE-INDEX.md) — claim-to-file and claim-to-revision map;
- [`RELEASE-NOTES.md`](RELEASE-NOTES.md) — retained changes and known limitations;
- [`BUILD-INFO.json`](BUILD-INFO.json) — machine-readable release and evidence summary;
- [`docs/evidence/`](docs/evidence/) — immutable baselines, repair plans, manual adjudications and final freeze records.

Generated root HTML and hashed assets are committed because GitHub Pages serves them. They must be refreshed through `npm run build:release`; hand-editing generated bundles is outside the release process.

## Repository map

```text
source/          TypeScript source, tests, Vite/Playwright configuration and standalone build
assets/          Generated GitHub Pages bundles (do not hand-edit)
questionnaires/  Distributable definitions and JSON Schema
docs/            Architecture, protocols, integration guidance and evidence records
deliverables/    Versioned dissertation/project documents
integrations/    Qualtrics bridge/package material
tools/           Reproducible document-generation utilities
```

## Citation, licensing and third-party material

Citation metadata is provided in [`CITATION.cff`](CITATION.cff). Repository software is licensed under [`LICENSE`](LICENSE). Questionnaire wording, scoring methods, imported source material and third-party libraries may have separate rights or conditions; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

Do not present this prototype or its audit as evidence that a deployed study is accessible to every person. Researchers remain responsible for instrument permission, ethics approval, participant support, deployment configuration, data governance and evaluation in the technologies they actually intend to use.
