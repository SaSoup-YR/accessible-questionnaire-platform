# AQP quantified technical evaluation protocol v1.0

Protocol frozen: 2026-08-09
Evaluation type: technical fidelity, refusal safety, provenance and rendered-browser regression
Release rule: report only results tied to an immutable commit SHA and passing CI run

## Evaluation question and boundary

The evaluation asks whether the implemented AQP release preserves the declared
questionnaire and response record within its documented support boundary, rejects
unsupported behaviour without silent alteration, supports reconstruction from its
own export, and passes pre-specified automated checks in named rendered states.

It does **not** test psychometric equivalence between sequential and standard
administration, benefit for disabled users, general usability, universal
questionnaire independence or complete WCAG conformance. Those claims require
different evidence.

## E1. Fidelity round trip

### Independent oracle

`docs/evidence/fidelity-source-of-truth.json` is a hand-maintained test oracle. It
is not generated from AQP production definitions or renderer output. Built-in
content was transcribed against the named instrument sources; native import
expectations were transcribed from the committed QSF/LSS/LSG/LSQ source fixtures
before running the import and rendering pipeline.

The revised inventory contains all three distributable built-in instruments and every supported
native import fixture in the repository:

| Case class | Cases | Items |
| --- | ---: | ---: |
| NASA-TLX weighted and raw | 2 | 12 |
| SUS | 1 | 10 |
| QSF | 1 | 2 |
| LSS (legacy and current) | 2 | 4 |
| LSG | 1 | 2 |
| LSQ | 1 | 1 |
| **Total** | **8** | **31** |

UEQ-S is not part of this release inventory because no explicit permission covering
public source redistribution and deployment was established. Its item text and
built-in catalogue entry were removed. Generic semantic-differential rendering is
tested separately with original synthetic wording and is not counted as an
instrument-fidelity case.

### Procedure

For each case, the automated evaluation loads or imports the source through the
production path, renders the participant interface, completes the fixed response
set, reaches review and creates a result record. It compares independently
expected and observed values for:

- item count and order;
- item identifiers, visible names and complete item text;
- response labels and stored values;
- required status;
- scoring-rule identifier;
- reported score name; and
- score under the fixed response set.

Each unequal field is retained as a mismatch with case, item and expected/actual
values. The primary result is `mismatches / field comparisons` and the release
gate is **0 mismatches in every case**. One silent mismatch fails the release.

### Current local result

The correction-candidate local build produced 8 cases, 31 items, 234 field comparisons and
0 mismatches. These numbers become citable only when reproduced by CI and tied to
the deployed commit.

## E2. Negative import battery

The battery contains one pre-specified row for each adversarial input requested in
the evaluation design. Outcomes use exactly four mutually exclusive categories:

1. **refused-specific** — no definition/link is produced and the message names
   the offending field or unsupported behaviour;
2. **refused-generic** — no definition/link is produced, but the message identifies
   only the file/parse class;
3. **accepted-documented-loss** — conversion proceeds only when the loss is
   explicitly represented to the researcher and acknowledged; or
4. **silently-altered** — a participant-ready definition is produced after a
   behaviour or measurement field is dropped or changed without an explicit gate.

| Adversarial input | Required safe outcome |
| --- | --- |
| Executable field | Refuse; name the executable field |
| Incompatible scoring | Refuse; name the scoring incompatibility |
| Mixed scales in one instrument | Refuse; name the mixed-scale boundary |
| Display logic | Refuse; name unsupported behaviour |
| Skip logic | Refuse; name unsupported behaviour |
| Randomisation | Refuse; name unsupported behaviour |
| Carry forward | Refuse; name unsupported behaviour |
| Non-forced response | Refuse; name optional-response boundary |
| Unsupported question type | Refuse; name question/type boundary |
| Oversized definition | Refuse; name size/count boundary |
| Malformed XML | Refuse; XML/file parse message |
| Truncated file | Refuse; XML/file parse message |

The primary finding is the count in `silently-altered`; the release gate is
**0/12**. Specific and generic refusals are reported separately rather than merged
into a green total.

### Current local result

The local run recorded 10 specific refusals, 2 generic parse refusals,
0 accepted-with-documented-loss cases and 0 silently altered cases. CI must
reproduce the result for the release commit.

## E3. Definition identity and export reconstruction

### Definition identity

The questionnaire definition is canonicalised by recursively sorting object keys
while preserving array order, then hashed with SHA-256. The same `sha256:` value is
stored in the study configuration and result record. The participant runner
recomputes the hash when loading the configuration and again before submission.
A missing or mismatched Version 4 fingerprint blocks configuration loading,
submission and completed-result restoration and must not create or restore a
success record. Legacy Version 3 migration remains explicit and instrument-bounded;
there is no hashless Version 4 migration.

The hash is an internal-consistency fingerprint, not a digital signature. The
configuration fragment is unsigned, so this test detects a stale or altered
definition only when the declared fingerprint is not replaced with it. It does
not authenticate researcher origin or prevent a person from replacing both the
definition and a recomputed fingerprint. That residual boundary is reported
explicitly and is not counted as cryptographic authenticity.

### Reconstruction procedure

For each of the eight fidelity cases, discard the original study configuration and
source fixture after creating the export. From the result export alone:

1. validate the result schema;
2. validate the embedded questionnaire definition;
3. recompute and compare the definition hash;
4. recover item sequence, content, scale and scorer;
5. recover final ratings and pair choices;
6. recompute the score; and
7. diff reconstructed definition and responses against the oracle.

The release gate is **100% reconstructable exports and 0 reconstruction
mismatches**. A built-in definition snapshot is required in the export; depending
on a later repository lookup is not reconstruction from the export alone.

### Current local result

The local run reconstructed 8/8 exports and 31/31 item responses with
0 mismatches. CI must reproduce the result for the release commit.

## E4. Rendered-browser WCAG regression in CI

The production build is served to Playwright Chromium. For every pre-specified
participant state, the suite runs axe with WCAG 2.0, 2.1 and 2.2 A/AA tags, checks
horizontal overflow and measures critical interactive targets. It also uses real
Tab navigation and computed styles for representative focus checks.

Required states:

1. introduction;
2. missing-answer error;
3. voice listening;
4. voice proposal pending confirmation;
5. voice-recognition error;
6. ordinary item;
7. saved-progress offer;
8. review;
9. completion;
10. NASA-TLX pairwise comparison;
11. synthetic semantic-differential item; and
12. imported fully labelled German item.

Required profiles per state:

- 1280 × 900 CSS pixels at 100%;
- 768 × 900 CSS pixels at 100%;
- 320 × 900 CSS pixels at 100%;
- Chromium CDP page-scale factor 2.0 on 1280 × 900; and
- 640 × 450 CSS pixels as the deterministic reflow companion for a 1280 × 900
  physical window at 200% zoom.

This produces **60 state-profile scans**. The report records exact Chromium
version, commit SHA, state, viewport, requested and observed scale, axe violations,
incomplete checks, overflow and target measurements. Release gates are:

- all 12 × 5 state/profile combinations present;
- zero automatically detected violations;
- zero horizontal-overflow failures above 1 CSS pixel;
- zero measured critical targets below 24 × 24 CSS pixels; and
- every incomplete axe result retained for inspection, not silently counted as a
  pass.

The JSON, HTML, Playwright report and failure traces are uploaded as a 90-day CI
artefact. These scans are automated technical evidence only.

## E5. Cross-browser capability matrix

An unmodified production page is opened in Playwright Chromium, Firefox and
WebKit. The test records engine/version, native SpeechRecognition and prefixed
SpeechRecognition availability, speech synthesis, local/session storage and a
runner smoke test. Visible built-in voice availability must agree with actual
feature detection.

Firefox's lack of built-in Web Speech recognition is reported as a product-route
limitation, not treated as an AQP test failure. Playwright WebKit on Linux is not
Safari and cannot stand in for VoiceOver/Safari. Actual NVDA, VoiceOver and OS
voice-control results belong only in the manual audit.

## Reproducible commands and artefacts

```text
npm ci
npm test -- --run
npm run report:technical
npm run build
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
npm run test:browser-support
npm run report:browser
npm run report:browser-support
```

Generated evidence:

- `docs/evidence/technical-evaluation-report.json` and `.html`;
- `docs/evidence/axe-browser-report.json` and `.html`;
- `docs/evidence/cross-browser-support-report.json` and `.html`;
- CI job summary, Playwright HTML report and traces; and
- `docs/manual-audit/AQP-MANUAL-AT-AUDIT-v1.0.md` for separately executed manual
  technical observations.

## Analysis and reporting

Report counts, denominators and every mismatch/failure row. Do not use inferential
statistics. Do not convert a zero axe count into a usability or conformance claim.
Do not conceal an unsupported browser route inside an overall average. A failed
release is fixed and rerun, and both the final release revision and test date are
reported.
