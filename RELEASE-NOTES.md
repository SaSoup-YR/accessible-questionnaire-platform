# AQP 0.8.1 — public entry and repository curation

Date: 24 August 2026  
Status: public-entry and repository-curation release

## Release purpose

AQP 0.8.1 adds a public platform landing page and completes repository curation without moving or replacing the immutable `v0.8.0` release. It does not introduce a new questionnaire/result protocol version and does not broaden the research claim beyond the configuration-specific technical and manual evidence already recorded.

The release does not establish universal accessibility, complete WCAG conformance, psychometric equivalence, usability improvement, reduced cognitive burden, or benefit for disabled users.

## Public interface

The root page now presents AQP as a questionnaire platform rather than opening one questionnaire without context. It provides browser-local demonstrations for:

- weighted NASA Task Load Index;
- raw NASA Task Load Index;
- System Usability Scale.

Generated study links continue to open the same participant runner with a validated questionnaire definition, locked study settings and pseudonymous participant code. The researcher setup remains available at `study.html`.

## Repository curation

Version 0.8.1:

- replaces the earlier README with a concise purpose, use, verification, limitation, citation and licence structure;
- adds a plain code overview and an accurate AI-assisted-development provenance record;
- adds staged open-science and deposit-manifest records without claiming that a DOI already exists;
- moves duplicate Word deliverables, the Version 0.7 standalone artifact, and unexecuted study/ethics planning files to the private project archive before removing their public copies;
- retains one short public `PLANNED-STUDY-NOT-EXECUTED.md` statement confirming that planning documents produced no participant evidence;
- moves superseded release gates, migration notes, evidence freezes, evaluation matrices and intermediate repair plans into `docs/archive/`;
- keeps current final evidence and residual failures in the public evidence surface;
- records every removed remote branch name, exact final tip SHA, related pull request where available and preserve/delete decision;
- verifies each deleted branch tip as reachable from `archive/pre-v0.8.1-branch-tips` before deleting the remote ref;
- keeps `main`, `gh-pages`, necessary archive branches and all formal tags.

The active `release/v0.8.1-curation` branch is retained only until PR #84 is merged. A protected workflow deletes a merged same-repository head branch only when its live SHA still matches the exact merged PR head.

## Dependency and link provenance

The committed `source/package-lock.json` remains the reproducible dependency source. The authoritative curation gate captured:

- `npm outdated --json`;
- `npm audit --json`;
- the reason each available update was deferred;
- a current-document repository-link audit.

Nine development/tooling packages had newer registry versions. None was upgraded merely to make the version numbers current. The locked graph reported zero known vulnerabilities, and the full tested browser/build matrix passed. Major TypeScript, Vite, Vitest, jsdom and Node type migrations, plus the paired axe update, remain separately scoped compatibility work rather than release-tidying changes.

A zero-vulnerability registry report is time-specific and does not prove that no undisclosed vulnerability exists. An external-link audit is also time-specific and cannot guarantee that a third-party site will never move.

## Automated verification

The authoritative Version 0.8.1 curation gate was GitHub Actions run `32722484056`, which completed successfully and committed the tested synchronized outputs at `cb34910bd127d2c1a7201c64f81fefaeef7758b6`.

Recorded results:

- 27/27 unit/component test files;
- 235/235 unit/component tests;
- 14/14 rendered Chromium browser tests;
- 18/18 Chromium, Firefox and Playwright WebKit support-route tests;
- production build passed;
- self-contained participant build passed;
- generated release synchronization and freshness passed;
- 27 current documents, 59 links and 35 unique external links checked with zero recorded failures;
- locked dependency audit reported zero known vulnerabilities.

`BUILD-INFO.json` records this tested-and-synchronized release-output provenance. Later documentation-only curation commits do not silently relabel themselves as a new product test run. The exact final pull-request head is also required to pass the standard repository workflow before merge.

## Manual evidence boundary

The immutable pre-repair manual audit remains **94 Pass / 31 Fail / 7 Not applicable / 0 Not tested** across 132 route/check cells. Targeted exact-route retesting closed 25 historical failures. Six configuration-specific failures remain:

| Family | Residual cells | Retained boundary |
| --- | --- | --- |
| RF-01 | R3-A26 | VoiceOver with Safari did not automatically expose the initial embedded Qualtrics `Connecting` status. Visible gating and blocking error behaviour remain; the silent route is not relabelled Pass. |
| RF-06 | R4-A10 | Windows Voice Access and in-page Web Speech competed for the spoken stop command. Visible Stop, watchdog and native controls remain. |
| RF-07 | R3-A11, R3-A12, R4-A11, R4-A12 | Live browser speech recognition did not reliably return the frozen number/negation phrases. Strict parsing, negation veto, explicit confirmation and native controls remain; AQP does not guess. |

A green automated test is not substituted for a failed real assistive-technology observation. Playwright WebKit is not Safari plus VoiceOver evidence, and a browser capability test is not a disabled-participant benefit study.

## Materials and open science

Public materials include the software, lockfile, tests, questionnaire definitions and schema, Qualtrics integration, current technical/manual evidence, release provenance, licence, citation and third-party notices.

The exact final literature search, screening, study-family, author/full-text verification and analysis-code package is not yet frozen or deposited. No DOI is claimed in this release. `OPEN-SCIENCE.md` and `docs/open-science/DEPOSIT-MANIFEST-DRAFT.md` define the staged Zenodo deposit and anonymous-assessment boundary.

No participant data, signed consent forms, participant recordings or real Qualtrics participant responses were produced for the released dissertation evidence.

## Deployment

The root `index.html`, `study.html`, `assets/` and `questionnaires/` files are generated outputs. Refresh them only with:

```bash
cd source
npm ci
npm run build:release
```

Do not hand-edit generated bundles. Researchers remain responsible for ethics approval, questionnaire permission, deployment configuration, participant support, data governance and evaluation in the technologies they intend to use.

## Version and history policy

- `v0.8.0` remains immutable and is not moved;
- `v0.8.1` is created from the verified merged Version 0.8.1 tree;
- formal release-candidate tags remain available;
- branch ref deletion does not rewrite commit authorship, co-author metadata, closed pull requests or archived evidence;
- the historical Version 0.8.0 release notes remain available at `docs/archive/releases/RELEASE-NOTES-v0.8.0.md` and in the `v0.8.0` tagged tree.
