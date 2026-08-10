# AQP final contribution statement v2

Status: aligned with evaluation matrix v6 and the technical-evaluation route
Date: 2026-08-10

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
JSON object. It can be falsified by a missing or mismatched Version 4 fingerprint
that does not block loading/submission/restoration, a missing
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

Current correction-candidate results are:

- 5 compatible imported definitions admitted through the shared data path with
  0 instrument-specific production files, 96/96 shared case-contract executions
  with 0 instrument-specific copies, and 16/16 support-allowlist combinations
  matching;
- 8 distributable built-in/import cases, 31 items and 234 independent-oracle field comparisons,
  with 0 mismatches;
- 12 adversarial inputs, with 0 silently altered;
- 8/8 result exports and 31/31 item responses reconstructed, with 0 mismatches; and
- missing-fingerprint and stale-fingerprint configuration tampering rejected.

The earlier passing PR revision reproduced the fidelity, refusal and
reconstruction counts, but its 60-scan browser inventory is superseded. The
expanded every-screen protocol requires 27 states × 5 profiles = 135 scans and
is awaiting PR CI. Pull-request results are not final-main or deployed-release
evidence. The manual assistive-technology audit remains NT and must be reported
separately.

Only three built-ins are distributable in the correction candidate. UEQ-S was
removed because written permission covering public repository redistribution and
deployment was not established. This is a disclosed scope reduction from the
supervisor's four-built-in request and requires explicit acceptance; it is not
counted as a successful fourth case.

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
