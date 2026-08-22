# Final AQP prototype freeze record — 22 August 2026

Status: **engineering repair programme and repository curation closed; the final `v0.8.0` publication uses a verified `main` snapshot and an immutable tag.**

## 1. Frozen product identity

Software version and release tag: `v0.8.0`  
Integrated product revision: `e00a737de964e120ffec38c5030d4ad212cbff5d`  
Final integration branch before release: `agent/final-prototype-integration`

The integrated product was constructed from the retained cumulative RF-06/RF-09/RF-08/RF-07 head plus the exact retained RF-01, RF-05 and final RF-04 heads. Generated HTML and hashed assets were discarded at conflict boundaries and rebuilt from the integrated source; no minified bundle conflict was resolved by hand.

One-time construction workflow `32543873697` completed successfully and removed itself from the committed tree.

The final curated pre-merge workflow `32544582158` completed successfully on head `69ce59443718e17729ce3dadda2d3bd810b88231`:

- 26/26 unit/component files and 230/230 tests;
- 12/12 rendered-browser tests;
- 18/18 Chromium, Firefox and Playwright WebKit support tests;
- production, standalone and synchronized release builds;
- committed generated-release freshness;
- 0 reported vulnerabilities from the locked installation audit.

Later edits in the release branch are documentation and publication metadata only. The release process requires the exact final PR head and the resulting `main` snapshot to pass the same ordinary workflow before the immutable tag is created.

## 2. Evidence ledger

The q8 pre-repair matrix remains immutable:

- 132 route/check cells;
- 94 Pass;
- 31 Fail;
- 7 Not applicable;
- 0 Not tested.

Targeted post-fix engineering and exact-route retesting closed **25 historical failures**. This is not presented as a second complete 132-cell audit.

Six historical failures remain:

| Family | Cell(s) | Final decision |
| --- | --- | --- |
| RF-01 | R3-A26 | Retain Fail. VoiceOver + Safari did not automatically expose the initial embedded Qualtrics Connecting status. Safe Start gating, visible state and blocking alert remain. |
| RF-06 | R4-A10 | Retain Fail. Windows Voice Access and in-page Web Speech competed for the same spoken stop command. Visible Stop, watchdog and native answer controls remain. |
| RF-07 | R3-A11, R3-A12, R4-A11, R4-A12 | Retain Fail. Live recognition did not reliably return the frozen proposal/negation phrases. AQP does not infer omitted words and commits only after explicit confirmation. |

No further application-level repair is planned for these cells. Further attempts would either repeat failed mechanisms, weaken answer-integrity safeguards, create competing announcement/focus channels or introduce a new external speech service and research/privacy scope.

## 3. Final RF-04 adjudication

Exact candidate: `0444d6f8a3a77f7cb9409d79c01a75ff42d9471d`.

On macOS Safari + VoiceOver, after exactly three saved SUS answers and reload with VoiceOver active, the observed caption was:

> Saved questionnaire found, web dialog, with 6 items

The VoiceOver context entered the named modal; the modal exposed the exact `3 of 10` state and recovery choices. Activating Resume then produced:

> heading level 2, Item 4, Item 4, region

The rendered progress remained `3 of 10 responses completed`. The first three answers were preserved.

Adjudication:

- R3-A14: Fail to Pass;
- R3-A15: Pass retained;
- RF-04 is closed for all six historical A14/A15 failure cells.

Persistent record: `RF04-NATIVE-DIALOG-POSTFIX-MANUAL-AUDIT-2026-08-22.md`.

## 4. Freeze decision

The executable prototype is frozen after the final integration. From this point:

- do not add another accessibility feature solely to reduce the residual failure count;
- do not change questionnaire wording, values or scoring without reopening definition fidelity and psychometric review;
- do not replace a failed manual observation with source-code or automation inference;
- do not hand-edit generated release bundles;
- allow only release-blocking corrections, evidence clarification, security maintenance or an explicitly scoped future study branch;
- record any post-release change as a new version rather than moving the frozen tag.

## 5. Repository curation boundary

The final public surface preserves:

- source, tests and locked dependencies;
- generated release entry points and assets;
- questionnaire definitions and schema;
- Qualtrics integration material;
- immutable audit baselines and targeted repair records;
- failed-attempt summaries needed to explain residual limitations;
- dissertation/project deliverables;
- licence, citation and third-party notices;
- exact revisions, run IDs, artifact IDs and screenshot hashes supporting final claims.

The cleanup removed or replaced only:

- machine-specific document-build imports;
- temporary one-time workflows after they completed;
- stale top-level prose that contradicted the final evidence state;
- unreferenced generated assets through the normal release synchronization process;
- low-value duplicate scaffolding or accidental local artifacts where identified.

Commit history, baseline failures and contradictory evidence were not erased.

## 6. Dissertation claim boundary

Supported statement:

> AQP demonstrates a bounded loaded-definition questionnaire platform with fail-closed definition/result provenance, reusable participant interaction mechanisms and configuration-specific technical/manual accessibility evidence. Across the immutable pre-repair audit, targeted remediation closed 25 of 31 historical failures while retaining six browser/assistive-technology boundary failures.

Not supported:

- the prototype is accessible to every disabled person;
- the prototype fully conforms to WCAG;
- imported or transformed instruments are psychometrically equivalent;
- the interface improves usability or reduces cognitive burden;
- the prototype benefits disabled users;
- the technical audit authorizes participant recruitment or data collection.

## 7. Publication and provenance protocol

The public release is valid only when all of the following records agree:

1. the final integration PR head passed the ordinary read-only workflow;
2. the reviewed PR was squash-merged to `main` without an intervening head change;
3. the `main` workflow passed and synchronized GitHub Pages;
4. the deployed researcher and participant entry points loaded from that verified tree;
5. the immutable `v0.8.0` tag points to the verified release snapshot;
6. the GitHub release uses the committed `RELEASE-NOTES.md` and does not move the tag;
7. superseded repair PRs are closed with links to the integrated release rather than merged separately.

Publication records may add commit, workflow, deployment and tag identifiers. They must not change the frozen product behavior, six residual failures or dissertation claim boundary without new executed evidence.
