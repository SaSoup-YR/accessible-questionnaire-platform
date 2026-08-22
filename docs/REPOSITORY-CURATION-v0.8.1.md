# Repository Curation for AQP v0.8.1

## Purpose

AQP `v0.8.1` separates the current reusable software, current documentation, final evidence, superseded public records, and private study-planning materials. The `v0.8.0` tag is not moved or changed.

The curation follows these rules:

1. keep the working source, tests, lockfile, current documentation, licence, citation metadata, and generated release;
2. keep the immutable baseline and the evidence needed for final Pass and residual Fail claims;
3. move superseded but relevant public records into `docs/archive/` rather than presenting them as current guidance;
4. move non-executed participant-study materials and duplicate Word deliverables to the private project archive;
5. do not rewrite authorship, commit history, failed observations, or exact release identifiers;
6. list archived and removed paths so that the curation itself can be reviewed.

This supports software findability and reuse while retaining version and provenance information. It also reduces the risk that planned study documents, old release gates, or failed experimental successors are read as current product behavior.

## Public current surface

The public current surface contains:

- platform landing and researcher setup;
- TypeScript source and automated tests;
- distributable questionnaire definitions and schema;
- current Qualtrics integration;
- current architecture, testing, evidence boundary, and release documentation;
- final manual audit and targeted post-fix evidence;
- licence, citation, and third-party notices.

## Public archive

The public archive contains records that remain useful for understanding development or reproducing a historical decision, but are no longer current instructions. Examples include release-candidate gates, migration notes, pre-release evidence freezes, supervisor-response records, and superseded repair plans.

Archive paths remain in Git history and are listed in the curation inventory. Current documents link to the final evidence, not to intermediate instructions.

## Private project archive

The private archive contains:

- duplicate Word deliverables generated from public Markdown;
- the self-contained Version 0.7 participant artifact;
- consent, recruitment, risk, task, and coding drafts for the study that was not executed;
- any private or sealed material that should not appear in a public software repository.

A short public record states that the proposed study was not executed and produced no participant evidence.

## Evidence that remains public

Final and residual evidence remains public. In particular, the repository keeps:

- the immutable 132-cell baseline;
- final RF-03, RF-04, RF-05, RF-08, and RF-09 closure records;
- RF-01, RF-06, and RF-07 residual-failure records;
- final release, deployment, and public-page smoke records;
- machine-readable source-of-truth and contrast adjudication files.

Intermediate candidate plans can be archived, but a failed result is not deleted merely because it is inconvenient.

## Release rule

`v0.8.1` is a new release for the public landing page, documentation, dependency review, and repository curation. It does not move `v0.8.0`. Questionnaire configuration and result schema compatibility remain based on the Version 0.8 protocol unless a separately tested migration changes that protocol.
