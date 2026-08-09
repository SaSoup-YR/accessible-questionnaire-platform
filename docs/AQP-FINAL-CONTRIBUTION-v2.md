# AQP final contribution statement v2

Status: aligned with evaluation matrix v6 and the technical-evaluation route
Date: 2026-08-09

## Locked contribution statement

This dissertation contributes and evaluates a **bounded questionnaire
administration pipeline that makes measurement integrity inspectable from study
configuration to result export**. It combines a versioned definition contract,
fail-closed import boundaries, a canonical definition fingerprint and a
self-contained provenance record. The evaluation tests these properties with an
independent-oracle round trip, a pre-specified negative battery and export-only
reconstruction, rather than inferring them from interface completion.

## Contributions

### 1. Checkable measurement identity and provenance

The same canonical SHA-256 definition fingerprint is carried by the generated
configuration and completed result and is recomputed at load and submission. Every
result embeds the complete versioned definition, scorer identity, final values,
input routes and support state. An export can therefore be reconstructed and
diffed without relying on the later state of the repository.

This fingerprint establishes internal consistency and a checkable definition
identity; it is not a digital signature or proof of researcher origin. Because
the configuration fragment is unsigned, a person who replaces both a definition
and its recomputed fingerprint can create a different self-consistent link.
Authenticated study authorship would require a signature or trusted registry and
is outside the present contribution.

The contribution is the checkable chain, not merely that the software stores a
JSON object. It can be falsified by a hash mismatch that does not block, a missing
definition/scorer/response, or an export that cannot reproduce the result.

### 2. Quantified fail-closed fidelity boundary

AQP converts only the documented shared integer, single-choice profile and runs
only allowlisted executable scorers. Supported QSF/LSS/LSG/LSQ content is compared
programmatically with an independent source-of-truth sheet. Unsupported logic,
question types, scales, scoring or executable fields are refused rather than
silently approximated.

The boundary is a substantive part of the contribution: a definition file alone
cannot introduce a new scoring rule or mixed response structure. Those changes
require reviewed executable scoring and validation code. Therefore the system is
definition-driven within a declared boundary, not questionnaire-independent.

### 3. Reproducible, bounded accessibility engineering evidence

The participant runner provides semantic single-item administration, direct
per-item review correction, saved-progress recovery, explicit errors and
confirmed voice proposals. These are implemented features, not by themselves
evidence of benefit. The contribution is accompanied by reproducible real-browser
checks across pre-specified states, widths and zoom, a cross-browser capability
matrix, and a versioned manual audit that records exact NVDA, VoiceOver and
OS-voice-control observations per WCAG criterion.

Until the manual audit is executed, this part remains partially unevidenced. Even
after it is completed, it supports only a technical claim for named configurations,
not that disabled users benefit or that AQP is generally more accessible.

## What is not a contribution

- Splitting the researcher page into six or ten screens is an implementation
  change. Its source-change invalidation and separate fidelity checkpoints support
  safe setup, but the number of screens is not a research contribution.
- Loading definitions as data is a common platform pattern. Novelty is not claimed
  for JSON configuration, save/resume, QSF/LimeSurvey import or a questionnaire
  runner in isolation.
- The withdrawn AQP–Qualtrics respondent comparison provides no evidence and is
  not retained as an active contribution.
- The current work does not establish score equivalence across presentation modes,
  psychometric validity, general usability, questionnaire independence, universal
  accessibility or benefit for disabled users.

## Current quantified evidence

Local pre-release results are:

- 9 built-in/import cases, 39 items and 288 independent-oracle field comparisons,
  with 0 mismatches;
- 12 adversarial inputs, with 0 silently altered;
- 9/9 result exports and 39/39 item responses reconstructed, with 0 mismatches; and
- 194 unit/component/technical tests passing.

Only results reproduced by CI and tied to the deployed commit may appear as final
release evidence. Rendered-browser CI and manual assistive-technology results must
be reported separately with their own status.

## Dissertation claim boundary

The dissertation may claim:

- bounded definition-driven reuse for the implemented response/scorer profile;
- exact fidelity and fail-closed behaviour for the named tested cases;
- checkable definition identity and self-contained export reconstruction; and
- automated/manual technical accessibility findings for named states and exact
  browser/assistive-technology configurations, after those audits are executed.

It must not claim:

- questionnaire independence or arbitrary plug-in scoring;
- psychometric or score equivalence between sequential and standard presentation;
- that AQP is generally accessible, more accessible than Qualtrics, or beneficial
  to disabled users; or
- complete WCAG conformance from axe, Playwright or one manual auditor.
