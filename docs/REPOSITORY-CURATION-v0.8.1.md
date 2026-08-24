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

This supports software findability and reuse while retaining version and provenance information. It also reduces the risk that planned study documents, old release gates, or failed experimental successors are read as current product behaviour.

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

The private archive was written before the corresponding public paths were removed. Its public receipt records the private repository and exact archive commit without exposing the private files. A short public record states that the proposed study was not executed and produced no participant evidence.

## Evidence that remains public

Final and residual evidence remains public. In particular, the repository keeps:

- the immutable 132-cell baseline;
- final RF-03, RF-04, RF-05, RF-08, and RF-09 closure records;
- RF-01, RF-06, and RF-07 residual-failure records;
- final release, deployment, and public-page smoke records;
- machine-readable source-of-truth and contrast adjudication files.

Intermediate candidate plans can be archived, but a failed result is not deleted merely because it is inconvenient.

## Remote branch curation

Before any remote branch ref was deleted, `docs/archive/BRANCH-CLEANUP-INVENTORY-v0.8.1.json` recorded each branch name, final tip SHA, related pull request where available, and preserve/delete decision. Every selected tip was then verified as reachable from `archive/pre-v0.8.1-branch-tips` before its remote ref was removed.

The completed pre-merge branch set is deliberately limited to:

- `main`;
- `gh-pages`;
- `archive/evaluation-pre-fix-2026-08-16`;
- `archive/pre-v0.8.1-branch-tips`;
- `release/v0.8.1-curation`, retained only while PR #84 remains open.

All recorded `codex/*`, obsolete deployment and trigger branches, superseded release-candidate branches, and closed/merged development branches were removed without rewriting their commits. Formal tags were not changed. After PR #84 is merged, its source branch can be deleted because its exact head, merge identity, inventory, and archived ancestry remain available.

## Dependency and link review

The committed lockfile remains the reproducible dependency source. `npm outdated` and `npm audit` were captured for Version 0.8.1. Newer packages were not adopted merely to make version numbers current; the release gate was limited to a demonstrated security issue, supported-browser compatibility problem, or separately evaluated toolchain migration.

Current repository-document links were checked in the authoritative curation run. The result is a time-specific verification record, not a guarantee that an external site can never move later.

## Release rule

`v0.8.1` is a new release for the public landing page, documentation, dependency review, and repository curation. It does not move `v0.8.0`. Questionnaire configuration and result schema compatibility remain based on the Version 0.8 protocol unless a separately tested migration changes that protocol.
