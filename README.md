# Accessible Questionnaire Platform

Accessible Questionnaire Platform (AQP) is a browser-based research prototype for configuring and running compatible questionnaire definitions through one shared participant interface. Questionnaire wording, response values, scoring strategy, version information, and provenance are loaded as validated data rather than being fixed in one questionnaire-specific page.

**Release represented by this tree:** `v0.8.1`  
**Immutable Version 0.8 baseline:** [`v0.8.0`](https://github.com/SaSoup-YR/accessible-questionnaire-platform/releases/tag/v0.8.0)  
**Evidence boundary:** configuration-specific technical and manual evaluation. The repository does not claim universal accessibility, complete WCAG conformance, psychometric equivalence, usability improvement, or benefit for disabled users.

## Open the prototype

- [Platform landing page and demonstrations](https://sasoup-yr.github.io/accessible-questionnaire-platform/)
- [Researcher setup](https://sasoup-yr.github.io/accessible-questionnaire-platform/study.html)

The landing page offers three browser-local demonstrations:

- weighted NASA Task Load Index;
- raw NASA Task Load Index;
- System Usability Scale.

Participants in a configured study normally open the generated participant link. That link contains the validated study configuration and pseudonymous participant code. Centrally collected configurations must be opened from the approved Qualtrics parent.

## What AQP includes

- one participant runner for the documented questionnaire-definition profile;
- validated questionnaire definitions and an allowlisted scoring strategy;
- a canonical SHA-256 definition fingerprint and a complete definition snapshot in result records;
- researcher review before an imported or custom definition can be used;
- bounded QSF, LSS, LSG, and LSQ import for supported ordered rating structures;
- transactional answer editing, browser-local recovery, and completed-result backup;
- local result export and a reviewed Qualtrics collection bridge;
- native keyboard and answer controls retained alongside optional audio, voice, smiley, and experimental gaze routes.

The number of researcher setup screens is an implementation detail, not the research contribution.

## Getting started

### Run locally

```bash
git clone https://github.com/SaSoup-YR/accessible-questionnaire-platform.git
cd accessible-questionnaire-platform/source
npm ci
npm run dev
```

Open the local URL printed by Vite. The root route contains the platform landing page and demonstrations. `/study.html` contains the researcher setup.

### Run the verification suite

```bash
cd source
npm ci
npm test -- --run
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
npm run test:browser-support
npm run build:release
```

The committed lockfile is the reproducible dependency source. The Version 0.8.1 release gate also captured `npm outdated` and `npm audit`; newer registry versions were not adopted without a demonstrated security or supported-browser compatibility reason. See [`docs/DEPENDENCY-REVIEW-v0.8.1.md`](docs/DEPENDENCY-REVIEW-v0.8.1.md).

## Supported definitions and import boundary

The committed source definitions are in [`source/instruments/`](source/instruments/). A release build copies the distributable files to the root `questionnaires/` directory:

- `nasa-tlx-weighted.questionnaire.json`;
- `nasa-tlx-raw.questionnaire.json`;
- `system-usability-scale.questionnaire.json`;
- `questionnaire-definition.schema.json`.

AQP accepts only the documented definition and import profile. Unsupported question types, active logic, unsafe markup, incomplete scoring, and ambiguous conversion are blocked or presented for explicit researcher confirmation. Imported or adapted instruments still require separate permission and psychometric review.

## Evaluation and known limitations

The immutable pre-repair manual audit contained 132 route/check cells: 94 Pass, 31 Fail, 7 Not applicable, and 0 Not tested. Targeted remediation and exact-route retesting closed 25 historical failures. Six configuration-specific failures remain:

- VoiceOver with Safari did not automatically expose the initial embedded Qualtrics `Connecting` status;
- Windows Voice Access and in-page Web Speech competed for the same spoken stop command;
- live browser speech recognition did not reliably return the frozen `number four` and `not four` phrases in four route/check cells.

AQP retains safe visible controls and does not infer a missing number or negation. A green automated test does not replace a failed real assistive-technology observation.

Start with:

- [`EVIDENCE-INDEX.md`](EVIDENCE-INDEX.md) for claim-to-evidence mapping;
- [`TESTING.md`](TESTING.md) for reproducible test procedures;
- [`BUILD-INFO.json`](BUILD-INFO.json) for machine-readable release provenance;
- [`RELEASE-NOTES.md`](RELEASE-NOTES.md) for the retained release scope and limitations;
- [`CODE-OVERVIEW.md`](CODE-OVERVIEW.md) for a plain description of the main code modules;
- [`docs/AI-ASSISTED-DEVELOPMENT-NOTES.md`](docs/AI-ASSISTED-DEVELOPMENT-NOTES.md) for truthful software-development provenance and the thesis-disclosure boundary;
- [`docs/PLANNED-STUDY-NOT-EXECUTED.md`](docs/PLANNED-STUDY-NOT-EXECUTED.md) for the explicit statement that planning documents produced no participant evidence;
- [`OPEN-SCIENCE.md`](OPEN-SCIENCE.md) and the [deposit manifest draft](docs/open-science/DEPOSIT-MANIFEST-DRAFT.md) for the final archival-material plan.

For Version 0.8.1, the one-time curation gate [run 32722484056](https://github.com/SaSoup-YR/accessible-questionnaire-platform/actions/runs/32722484056) ran the locked install, dependency comparison/security audit, 235 unit/component tests, 14 rendered-browser tests, 18 Chromium/Firefox/WebKit support tests, production and standalone builds, release synchronization, current-document link checking, and the public/private repository-boundary checks. It then removed its own temporary workflow and committed the tested generated outputs. `BUILD-INFO.json` records the exact synchronized tree head.

## Repository structure

```text
source/          TypeScript source, tests, and build configuration
assets/          generated GitHub Pages JavaScript and CSS
questionnaires/  distributable questionnaire definitions and JSON Schema
integrations/    reviewed Qualtrics package and guidance
docs/            current architecture, methods, evidence, archive, and deposit-planning records
tools/           reproducible release and documentation utilities
```

Generated root HTML, `assets/`, and distributable questionnaire files are refreshed with `npm run build:release`. They are not edited by hand. Superseded but useful public records are kept under `docs/archive/`; unexecuted participant-study planning material was moved to the private project archive.

## Citation and licence

Use [`CITATION.cff`](CITATION.cff) for software citation. Repository software is released under [`LICENSE`](LICENSE). Questionnaire wording, scoring methods, imported materials, and third-party code can have separate rights or conditions; see [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

Researchers remain responsible for ethics approval, instrument permission, participant support, deployment configuration, data governance, and evaluation in the technologies they intend to use.
