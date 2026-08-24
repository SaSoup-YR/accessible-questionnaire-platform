# Open Science and Materials

This file separates material that is public now, material intended for the final dissertation archive, and material that does not exist or should not be public. It does not turn planning documents or technical tests into participant evidence.

## Public in this repository

- TypeScript and JavaScript source code;
- the committed dependency lockfile;
- unit, component, rendered-browser, and cross-browser tests;
- synthetic import fixtures;
- distributable questionnaire definitions and JSON Schema;
- current Qualtrics integration materials;
- the frozen manual assistive-technology audit;
- targeted post-fix and residual-failure evidence;
- release, deployment, and public-page provenance;
- build, testing, citation, licence, third-party, dependency, and AI-assistance information.

## Final archival package

Zenodo is the primary planned preservation service for the final dissertation research package. The package will include:

- the exact released AQP source snapshot and software tag identity;
- the final evidence index and current core evidence records;
- the literature search, screening, study-family, and author/full-text verification tables actually used in the dissertation;
- the final core-literature claim matrix;
- analysis scripts used to generate reported numbers, tables, or figures;
- a manifest linking every deposited file to the corresponding software tag and dissertation version;
- README, licence, citation, rights, and reuse information appropriate to each material type.

The draft manifest is maintained at `docs/open-science/DEPOSIT-MANIFEST-DRAFT.md`.

## Staged deposit decision

The DOI is not minted as a final published record while the literature-analysis package is incomplete. The safe sequence is:

1. merge, verify, and tag the immutable `v0.8.1` software release without moving `v0.8.0`;
2. complete and freeze the exact literature/full-text verification tables and analysis code;
3. assemble and checksum the archival package;
4. create a Zenodo draft and reserve a DOI;
5. add the reserved DOI to the package manifest and final Open Science text;
6. preview and publish the fixed record;
7. add the registered DOI to `OPEN-SCIENCE.md`, the current README, and citation metadata without moving an existing software tag.

Zenodo can also archive a GitHub release as a software record. A combined dissertation research package may instead cite the exact GitHub tag as a related identifier. The final choice must avoid depositing two records as though they were the same object.

## Anonymous assessment sharing

The public repository is not anonymous. Identity can be exposed by the account and repository name, `CITATION.cff`, release authorship, commit authors/co-authors, issue and pull-request history, and linked profiles.

For an assessment or blinded review that requires anonymity:

- do not submit the named GitHub URL as an anonymous link;
- create a separate anonymous mirror or an anonymised view-only record that contains only the required frozen materials;
- remove identifying metadata and document content from that mirror rather than rewriting the truthful public repository history;
- check the mirror from a signed-out browser before submission;
- follow the module's specific anonymity instructions, which override this repository note.

An OSF registration can provide an anonymised view-only link for blinded review. OSF Projects are not selected as the new long-term mutable workspace because the service has announced a transition to read-only Projects in February 2027. Zenodo remains the planned fixed preservation record.

## Data types not available

| Data type | Status and reason |
| --- | --- |
| Participant data | None were collected for the released dissertation evidence. The proposed observed study was not executed. |
| Signed consent forms | None exist because no participant study was run. |
| Participant session recordings | None exist. Manual developer/auditor screenshots are represented by bounded observations or hashes where public release could expose account or device information. |
| Real Qualtrics participant responses | None are included. Only synthetic fault and deployment checks are reported. |
| Universal accessibility or benefit evidence | Not produced. Technical and manual configuration-specific evaluation cannot establish a disabled-user benefit claim. |
| Licensed questionnaire material beyond distributable files | Controlled by the relevant instrument or source rights and not redistributed without permission. |

## Current status

- GitHub release `v0.8.0`: published and immutable;
- `v0.8.1` public-entry and repository-curation release: in preparation;
- public questionnaire, Qualtrics, audit, and software evidence: available;
- private ethics and non-executed study planning archive: preserved outside the public repository;
- exact final literature/full-text analysis package: not yet frozen or deposited;
- DOI: not yet issued;
- anonymous assessment mirror: create only when the exact submission package and anonymity rules are known.
